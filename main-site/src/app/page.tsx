import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import HomeClient from "./HomeClient";

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
