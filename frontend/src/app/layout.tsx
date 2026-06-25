import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { AiButton } from "@/components/ai-button";

export const metadata: Metadata = {
  title: "RoomieFit",
  description: "Find an apartment and roommates near campus in Israel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-on-surface font-sans">
        <Nav />
        {children}
        <Footer />
        <AiButton />
      </body>
    </html>
  );
}
