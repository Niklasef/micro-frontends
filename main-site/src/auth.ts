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
  secret: process.env.NEXTAUTH_SECRET || "development_secret",
});
