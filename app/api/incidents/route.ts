import { listIncidents } from "../../../db/audit.ts";

export const runtime = "edge";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? 12);

  try {
    const incidents = await listIncidents(Number.isFinite(limit) ? limit : 12);
    return Response.json(
      { incidents },
      { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
    );
  } catch {
    return Response.json(
      { incidents: [], warning: "Audit history is temporarily unavailable." },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }
}
