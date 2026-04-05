import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import HomeClient from "./HomeClient";

export default async function Home() {
  const session = await getServerSession(authOptions);

  /* Fetch the server-rendered <search-input> markup from the Astro dev server */
  const astroMarkupRes = await fetch("http://localhost:4321/");
  let astroMarkup = await astroMarkupRes.text();

  /* Rewrite all script URLs so they resolve against the Astro dev server */
  // astroMarkup = astroMarkup
  //   /* custom-element definition */
  //   .replace(
  //     /<script\s+src="\.{2}\/components\/SearchInputElement\.ts"\s*>/,
  //     '<script type="module" src="http://localhost:4321/src/components/SearchInputElement.ts">'
  //   )
  //   /* bundled JS such as /_astro/hoisted.*.js → absolute URL */
  //   .replace(/src="\/(_astro\/[^"]+)"/g, 'src="http://localhost:4321/$1"');

  /* Keep only the <search-input> subtree to avoid nesting full documents */
  // const match = astroMarkup.match(/<search-input[\s\S]*?<\/search-input>/i);
  // astroMarkup = match ? match[0] : "";

  return (
    <HomeClient
      userName={session?.user?.name ?? null}
      userEmail={session?.user?.email ?? null}
      isAuthenticated={!!session}
      session={session!}
    >
      <div
        dangerouslySetInnerHTML={{ __html: astroMarkup }}
        suppressHydrationWarning
      />
    </HomeClient>
  );
}
