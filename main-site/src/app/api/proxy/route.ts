import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const BACKEND_BASE = "http://127.0.0.1:3001";

/**
 * Generic proxy that forwards the incoming request to
 * `${BACKEND_BASE}/${path}` where `path` is supplied via the
 * `path` query-string parameter.
 *
 * ‑ Uses the same HTTP method as the caller
 * ‑ Forwards all request headers & body
 * ‑ Returns upstream status, headers & body unmodified
 */
async function handler(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.searchParams.get("path");

  if (!path) {
    return NextResponse.json(
      { error: "Missing `path` query parameter" },
      { status: 400 },
    );
  }

  // Ensure we don’t end up with double slashes.
  const targetUrl = `${BACKEND_BASE}/${path.replace(/^\/+/, "")}`;

  // Clone headers so we can add auth information
  const headers = new Headers(request.headers);

  // Attach the user's session token (if any) as a Bearer auth header
  const token = await getToken({ req: request }); // decoded object, not raw
  const accessToken = token?.accessToken as string | undefined;
  console.log("token", token);
  
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  // Clone the request so we can safely read the body for non-GET methods
  const init: RequestInit = {
    method: request.method,
    headers,
  };

  if (!["GET", "HEAD"].includes(request.method)) {
    init.body = await request.clone().arrayBuffer();
  }

  const upstreamResponse = await fetch(targetUrl, init);

  // Pass-through upstream response
  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: upstreamResponse.headers,
  });
}

// Export handlers for every common HTTP verb
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
