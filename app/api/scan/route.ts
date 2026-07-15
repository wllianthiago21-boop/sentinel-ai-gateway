import { enforceRateLimit, saveIncident } from "../../../db/audit.ts";
import { analyzeText, MAX_INPUT_LENGTH } from "../../../lib/security/analyze.ts";
import type { ScanContext, ScanRequest } from "../../../lib/security/types.ts";

export const runtime = "edge";

const ALLOWED_CONTEXTS = new Set<ScanContext>(["prompt", "response", "tool_call"]);
const RESPONSE_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff",
};

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { ...RESPONSE_HEADERS, ...extraHeaders } });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return json({ error: "Content-Type must be application/json." }, 415);
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > 16_000) return json({ error: "Request body is too large." }, 413);

  let rateLimit: { allowed: boolean; remaining: number };
  try {
    rateLimit = await enforceRateLimit(request);
  } catch {
    return json({ error: "The protection service is temporarily unavailable." }, 503);
  }

  const rateHeaders = {
    "RateLimit-Limit": "30",
    "RateLimit-Remaining": String(rateLimit.remaining),
    "RateLimit-Reset": "60",
  };
  if (!rateLimit.allowed) return json({ error: "Rate limit exceeded. Try again in one minute." }, 429, rateHeaders);

  try {
    const rawBody = await request.text();
    if (rawBody.length > 16_000) return json({ error: "Request body is too large." }, 413, rateHeaders);
    const payload = JSON.parse(rawBody) as Partial<ScanRequest>;
    const text = typeof payload.text === "string" ? payload.text : "";
    const context = payload.context ?? "prompt";

    if (!text.trim()) return json({ error: "text is required." }, 400, rateHeaders);
    if (text.length > MAX_INPUT_LENGTH) {
      return json({ error: `text must have at most ${MAX_INPUT_LENGTH} characters.` }, 400, rateHeaders);
    }
    if (!ALLOWED_CONTEXTS.has(context)) return json({ error: "Invalid scan context." }, 400, rateHeaders);

    const result = await analyzeText(text, context);
    let auditStored = false;
    if (payload.store !== false) {
      try {
        await saveIncident(result, text);
        auditStored = true;
      } catch {
        // Analysis remains useful if the audit sink is temporarily unavailable.
      }
    }

    return json({ result, auditStored }, 200, rateHeaders);
  } catch (error) {
    if (error instanceof SyntaxError) return json({ error: "Invalid JSON body." }, 400, rateHeaders);
    const message = error instanceof Error ? error.message : "Unexpected analysis error.";
    return json({ error: message }, 400, rateHeaders);
  }
}
