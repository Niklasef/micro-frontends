import NextAuth, { type NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "dummy",
      issuer: process.env.KEYCLOAK_ISSUER!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
