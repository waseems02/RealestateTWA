import Link from "next/link";
import he from "../../messages/he.json";

export function Footer() {
  return (
    <footer className="bg-surface border-t border-outline-variant">
      <div className="w-full px-6 md:px-10 py-16 max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col gap-2 items-center md:items-start">
          <span className="text-2xl font-bold text-on-surface tracking-tight">RoomieFit</span>
          <p className="text-xs text-on-surface-variant">{he.footer.copyright}</p>
        </div>
        <div className="flex gap-6 flex-wrap justify-center">
          <Link href="#" className="text-on-surface-variant hover:text-primary text-xs transition-colors duration-200">
            {he.footer.about}
          </Link>
          <Link href="#" className="text-on-surface-variant hover:text-primary text-xs transition-colors duration-200">
            {he.footer.contact}
          </Link>
          <Link href="#" className="text-on-surface-variant hover:text-primary text-xs transition-colors duration-200">
            {he.footer.terms}
          </Link>
          <Link href="#" className="text-on-surface-variant hover:text-primary text-xs transition-colors duration-200">
            {he.footer.privacy}
          </Link>
        </div>
      </div>
    </footer>
  );
}
