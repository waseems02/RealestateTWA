import Link from "next/link";
import he from "../../messages/he.json";

export default function Home() {
  return (
    <main className="flex flex-1 w-full max-w-3xl mx-auto flex-col items-center justify-center py-24 px-8 text-center">
      <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {he.app.title}
      </h1>
      <p className="mt-6 text-xl text-zinc-600 dark:text-zinc-400">
        {he.app.tagline}
      </p>
      <Link
        href="/listings"
        className="mt-10 inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-8 text-base font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {he.home.browse_listings}
      </Link>
    </main>
  );
}
