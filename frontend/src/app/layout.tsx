import type { Metadata } from "next";
import { Geist, Heebo } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { AiButton } from "@/components/ai-button";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: "RoomieFit — דירות ושותפים ליד הקמפוס",
  description: "Find an apartment and roommates near campus in Israel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${geist.variable} ${heebo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-on-surface font-sans">
        <Nav />
        {children}
        <Footer />
        <AiButton />
      </body>
    </html>
  );
}
