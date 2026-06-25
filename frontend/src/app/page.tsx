import he from "../../messages/he.json";

export default function Home() {
  return (
    <main className="flex flex-1 w-full max-w-3xl mx-auto flex-col items-center justify-center py-32 px-8 text-center">
      <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {he.app.title}
      </h1>
      <p className="mt-6 text-xl text-zinc-600 dark:text-zinc-400">
        {he.app.tagline}
      </p>
      <p className="mt-12 text-sm text-zinc-500">
        Step 8 will swap this static import for full next-intl routing.
      </p>
    </main>
  );
}
