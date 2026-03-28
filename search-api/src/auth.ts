import { jwtVerify, createRemoteJWKSet, type JWTPayload } from "jose";
import { URL } from "node:url";

const issuer = process.env.KEYCLOAK_ISSUER!;
const JWKS = createRemoteJWKSet(new URL(`${issuer}/protocol/openid-connect/certs`));

export async function verifyToken<T extends JWTPayload = JWTPayload>(token: string): Promise<T> {
  const { payload } = await jwtVerify<T>(token, JWKS, {
    issuer,
    audience: process.env.KEYCLOAK_CLIENT_ID,
  });
  return payload;
}
