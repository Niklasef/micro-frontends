import { jwtVerify, createRemoteJWKSet, type JWTPayload } from "jose";
import { URL } from "node:url";

const issuer = process.env.KEYCLOAK_ISSUER!;
const JWKS = createRemoteJWKSet(new URL(`${issuer}/protocol/openid-connect/certs`));

export async function verifyToken<T extends JWTPayload = JWTPayload>(token: string): Promise<T> {
  // 1) Try verifying as a standard JWT against the realm JWKS (RS*/ES* signatures)
  try {
    const { payload } = await jwtVerify<T>(token, JWKS, { issuer });
    return payload;
  } catch (primaryErr) {

    // Fallback to OAuth2 Token Introspection (works for opaque tokens too)
    const clientId =
      process.env.KEYCLOAK_CLIENT_ID || process.env.AUTH_KEYCLOAK_ID || "main-site";
    const clientSecret =
      process.env.KEYCLOAK_CLIENT_SECRET || process.env.AUTH_KEYCLOAK_SECRET;

    if (!clientSecret) {
      throw primaryErr;
    }

    const introspectUrl = `${issuer}/protocol/openid-connect/token/introspect`;
    const body = new URLSearchParams({
      token,
      token_type_hint: "access_token",
      client_id: clientId,
      client_secret: clientSecret,
    });

    const res = await fetch(introspectUrl, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) {
      throw primaryErr;
    }

    const data = (await res.json()) as any;
    if (!data || data.active !== true) {
      throw primaryErr;
    }

    // Map common introspection fields to a JWTPayload-like object
    const mapped: any = {};
    for (const k of ["sub", "exp", "iat", "nbf", "aud", "iss", "scope", "client_id", "username"]) {
      if (data[k] !== undefined) mapped[k] = data[k];
    }
    return mapped as T;
  }
}
