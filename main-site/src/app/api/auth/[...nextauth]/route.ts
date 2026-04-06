import NextAuth, { type NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID || "main-site",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "dummy",
      // Use the env var when provided, otherwise fall back to the
      // local development Keycloak realm so `openid-client` receives
      // a valid absolute URL.
      issuer:
        process.env.KEYCLOAK_ISSUER ||
        "http://localhost:8080/realms/furmountain",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        (token as any).access_token = (account as any).access_token;
        (token as any).refresh_token = (account as any).refresh_token;
        (token as any).id_token = (account as any).id_token;
        (token as any).expires_at = (account as any).expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).access_token = (token as any).access_token ?? null;
      (session as any).id_token = (token as any).id_token ?? null;
      (session as any).expires_at = (token as any).expires_at ?? null;
      return session;
    },
  },
  /* Make all Next-Auth cookies available on every sub-domain so that
     requests sent from e.g. search.furmountain.local can include the
     session & state cookies set on furmountain.local. */
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
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
