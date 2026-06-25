import Link from "next/link";
import he from "../../messages/he.json";

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 bg-surface-container-lowest/80 glass-nav shadow-[0_4px_20px_-2px_rgba(30,41,59,0.05)]">
      <div className="flex justify-between items-center w-full px-6 md:px-10 py-4 max-w-[1280px] mx-auto">
        <div className="flex items-center gap-10">
          <Link href="/" className="text-2xl font-bold text-on-surface tracking-tight">
            RoomieFit
          </Link>
          <div className="hidden md:flex gap-6 items-center">
            <Link
              href="/"
              className="text-primary font-bold border-b-2 border-primary pb-0.5 text-sm"
            >
              {he.nav.home}
            </Link>
            <Link
              href="/listings"
              className="text-on-surface-variant text-sm font-medium hover:text-primary transition-colors duration-200"
            >
              {he.nav.listings}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            aria-label="Toggle language"
            className="bg-surface-container-low px-2 py-1 rounded-full flex items-center gap-1 text-xs font-semibold border border-outline-variant"
          >
            <span className="bg-primary text-on-primary px-2 py-0.5 rounded-full">
              {he.nav.lang_he}
            </span>
            <span className="px-2 text-on-surface-variant">{he.nav.lang_en}</span>
          </button>

          <button className="text-primary font-bold text-sm hover:opacity-80 transition-all">
            {he.nav.login}
          </button>

          <Link
            href="/listings"
            className="bg-primary text-on-primary px-6 py-2 rounded-xl text-sm font-bold shadow-lg hover:scale-95 transition-all"
          >
            {he.nav.get_started}
          </Link>
        </div>
      </div>
    </nav>
  );
}
