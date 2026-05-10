import "./env.js";
import { jwtVerify, createRemoteJWKSet, type JWTPayload } from "jose";
import { URL } from "node:url";

const issuer = process.env.KEYCLOAK_ISSUER;
if (!issuer) {
  throw new Error(
    "Missing KEYCLOAK_ISSUER environment variable (e.g., http://localhost:8080/realms/furmountain)"
  );
}
const JWKS = createRemoteJWKSet(new URL(`${issuer}/protocol/openid-connect/certs`));

export async function verifyToken<T extends JWTPayload = JWTPayload>(token: string): Promise<T> {
  const { payload } = await jwtVerify<T>(token, JWKS, {
    issuer
  });
  return payload;
}
