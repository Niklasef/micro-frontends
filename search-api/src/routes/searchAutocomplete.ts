import { FastifyPluginAsync } from "fastify";
import { decode } from "next-auth/jwt";
import { verifyToken } from "../auth.js";

const ALL_ITEMS = [
  "Product A",
  "Product B",
  "Product C",
  "Product D",
  "Product E",
  "Product F",
  "Category 1",
  "Category 2",
  "Camera Lens",
  "Camping Bag",
  "Coffee Mug",
];

const MOCK_RECENT_ORDERS = [
  {
    id: "ord-1001",
    title: "Coffee Mug",
    subtitle: "Ordered 2 days ago",
  },
  {
    id: "ord-1002",
    title: "Camping Bag",
    subtitle: "Ordered 1 week ago",
  },
  {
    id: "ord-1003",
    title: "Product B",
    subtitle: "Ordered 3 weeks ago",
  },
];

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(";")) {
    const [k, ...v] = part.split("=");
    if (!k) continue;
    out[k.trim()] = decodeURIComponent(v.join("=").trim());
  }
  return out;
}

function getChunkedCookieValue(
  cookies: Record<string, string>,
  baseName: string
): { value?: string; chunks: string[] } {
  if (cookies[baseName]) {
    return { value: cookies[baseName], chunks: [] };
  }
  const prefix = `${baseName}.`;
  const chunkKeys = Object.keys(cookies).filter((k) => k.startsWith(prefix));
  if (chunkKeys.length === 0) return { value: undefined, chunks: [] };
  const sorted = chunkKeys.sort(
    (a, b) => parseInt(a.slice(prefix.length)) - parseInt(b.slice(prefix.length))
  );
  const value = sorted.map((k) => cookies[k]).join("");
  return { value, chunks: sorted };
}

function isNiklasFromToken(payload: Record<string, any>): { ok: boolean; via?: string } {
  if (!payload) return { ok: false };
  if ((payload as any).preferred_username === "niklas") return { ok: true, via: "preferred_username" };
  if ((payload as any).username === "niklas") return { ok: true, via: "username" };
  if ((payload as any).name === "niklas") return { ok: true, via: "name" };
  return { ok: false };
}

async function decodeNextAuthJWT(token: string, secret: string): Promise<Record<string, any> | null> {
  try {
    // Use NextAuth's decoder which handles both encrypted (JWE) and signed (JWS) tokens
    const payload = await decode({ token, secret });
    return (payload ?? null) as unknown as Record<string, any> | null;
  } catch {
    return null;
  }
}

const searchAutocompleteRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get<{
    Querystring: { q?: string };
  }>("/search-autocomplete", async (request, reply) => {
    const q = request.query.q?.trim().toLowerCase() ?? "";
    fastify.log.info({ q, origin: request.headers.origin ?? null, hasCookie: Boolean(request.headers.cookie), hasAuthHeader: Boolean(request.headers.authorization) }, "Incoming /search-autocomplete request");

    if (!q) {
      return reply.send({ suggestions: [], recentOrders: [] });
    }

    const suggestions = ALL_ITEMS.filter((item) =>
      item.toLowerCase().includes(q),
    ).slice(0, 5);
    fastify.log.info({ suggestionsCount: suggestions.length }, "Computed suggestions");

    let recentOrders: typeof MOCK_RECENT_ORDERS = [];

    // Try to authenticate using NextAuth session cookie first
    const cookies = parseCookies(request.headers.cookie);
    fastify.log.info(
      {
        origin: request.headers.origin ?? null,
        cookieHeaderPresent: Boolean(request.headers.cookie),
        cookieKeys: Object.keys(cookies),
      },
      "Parsed cookies from request"
    );
    const { value: sessionToken, chunks: sessionChunks } = getChunkedCookieValue(
      cookies,
      "next-auth.session-token"
    );
    if (sessionToken) {
      const secret = process.env.NEXTAUTH_SECRET || "development_secret";
      const parts = sessionToken.split(".");
      const tokenType = parts.length === 5 ? "JWE" : parts.length === 3 ? "JWS" : `unknown(${parts.length} parts)`;
      fastify.log.info(
        {
          tokenType,
          tokenLen: sessionToken.length,
          tokenStart: sessionToken.slice(0, 12),
          hasSecret: Boolean(process.env.NEXTAUTH_SECRET),
          secretLen: (process.env.NEXTAUTH_SECRET ?? "development_secret").length,
          chunked: sessionChunks.length > 0,
          chunkCount: sessionChunks.length,
          chunkKeys: sessionChunks,
        },
        "Found next-auth.session-token; attempting to decode"
      );

      const nextAuthPayload = await decodeNextAuthJWT(sessionToken, secret);

      if (nextAuthPayload) {
        fastify.log.info(
          {
            nextAuthPayloadKeys: Object.keys(nextAuthPayload),
          },
          "Decoded NextAuth session payload"
        );
        const accessToken =
          (typeof (nextAuthPayload as any).access_token === "string" && (nextAuthPayload as any).access_token) ||
          (typeof (nextAuthPayload as any).accessToken === "string" && (nextAuthPayload as any).accessToken) ||
          null;

        if (accessToken) {
          fastify.log.info(
            { accessTokenStart: accessToken.slice(0, 12), accessTokenLen: accessToken.length },
            "Found access token in NextAuth session payload; verifying"
          );
          try {
            const providerPayload = await verifyToken(accessToken);
            const nik = isNiklasFromToken(providerPayload as any);
            if (nik.ok) {
              fastify.log.info({ sub: providerPayload.sub, exp: providerPayload.exp, via: nik.via }, "Token from NextAuth session verified successfully for user 'niklas'");
              recentOrders = MOCK_RECENT_ORDERS.filter((order) =>
                order.title.toLowerCase().includes(q),
              ).slice(0, 3);
            } else {
              fastify.log.info({ sub: providerPayload.sub, exp: providerPayload.exp }, "Token verified but user is not 'niklas'; omitting personalized results");
            }
          } catch (err) {
            fastify.log.warn({ err }, "Access token from NextAuth session failed verification");
          }
        } else {
          fastify.log.info("No access_token found in NextAuth session JWT");
        }
      } else {
        fastify.log.warn("Failed to decode NextAuth session token");
      }
    } else {
      fastify.log.info("next-auth.session-token cookie not present on request");
    }

    const authHeader = request.headers.authorization;

    if (!authHeader) {
      fastify.log.info("No Authorization header supplied");
    }

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice("Bearer ".length);
      fastify.log.info({ token }, "Received bearer token");

      try {
        const payload = await verifyToken(token);
        const nik = isNiklasFromToken(payload as any);
        if (nik.ok) {
          fastify.log.info({ sub: payload.sub, exp: payload.exp, via: nik.via }, "Token verified successfully for user 'niklas'");
          recentOrders = MOCK_RECENT_ORDERS.filter((order) =>
            order.title.toLowerCase().includes(q),
          ).slice(0, 3);
        } else {
          fastify.log.info({ sub: payload.sub, exp: payload.exp }, "Token verified but user is not 'niklas'; omitting personalized results");
        }
      } catch (err) {
        fastify.log.warn({ err }, "Token verification failed");
        // invalid / expired token – treat as unauthenticated
      }
    }

    fastify.log.info({ suggestionsCount: suggestions.length, recentOrdersCount: recentOrders.length }, "Sending /search-autocomplete response");
    return reply.send({ suggestions, recentOrders });
  });
};

export default searchAutocompleteRoute;
