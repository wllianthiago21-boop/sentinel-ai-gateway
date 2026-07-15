import { POLICY_VERSION } from "../../../lib/security/analyze.ts";

export const runtime = "edge";

export function GET() {
  return Response.json(
    {
      status: "ok",
      service: "sentinel-ai-gateway",
      policyVersion: POLICY_VERSION,
      classifier: "transparent-nb-1.0.0",
      timestamp: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
  );
}
