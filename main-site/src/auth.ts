import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Keycloak({
      clientId: process.env.AUTH_KEYCLOAK_ID || "main-site",
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET || "",
      // Fall back to the default dev-realm URL when the env var is missing
      issuer:
        process.env.AUTH_KEYCLOAK_ISSUER ||
        "http://localhost:8080/realms/furmountain",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  /* Share the cookies issued by the server helpers across every
     *.furmountain.local host so other micro-front-ends can send them
     along with their requests. */
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        path: "/",
        domain: ".furmountain.local",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: "next-auth.callback-url",
      options: {
        path: "/",
        domain: ".furmountain.local",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        path: "/",
        domain: ".furmountain.local",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    },
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        path: "/",
        domain: ".furmountain.local",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    },
    state: {
      name: "next-auth.state",
      options: {
        path: "/",
        domain: ".furmountain.local",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "development_secret",
});
