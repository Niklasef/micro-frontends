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
  secret: process.env.NEXTAUTH_SECRET || "development_secret",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
