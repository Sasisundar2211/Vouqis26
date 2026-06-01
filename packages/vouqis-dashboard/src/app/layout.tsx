import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import {PlanBadge} from "@/components/PlanBadge";
import {SignOutButton} from "@/components/SignOutButton";
import {createSupabaseServerClient} from "@/lib/supabase-server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vouqis — MCP Trust Layer",
  description: "Score, monitor, and replay MCP server tool calls",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
          <nav className="max-w-6xl mx-auto px-6 h-12 flex items-center gap-6">
            <Link
              href="/"
              className="font-semibold text-sm tracking-tight hover:opacity-80 transition-opacity"
            >
              Vouqis
            </Link>
            <a
              href="https://github.com/Sasisundar2211/Vouqis"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <Link
              href="/evals"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Audits
            </Link>
            <div className="ml-auto flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-xs text-muted-foreground font-mono hidden sm:inline truncate max-w-[160px]">
                    {user.email}
                  </span>
                  <SignOutButton />
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-xs text-muted-foreground font-mono hover:text-foreground transition-colors"
                >
                  Sign in
                </Link>
              )}
              <PlanBadge />
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
