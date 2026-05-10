import HomeClient from "./HomeClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <HomeClient
      userName={session?.user?.name ?? null}
      userEmail={session?.user?.email ?? null}
      isAuthenticated={!!session}
      session={session!}
    />
  );
}
