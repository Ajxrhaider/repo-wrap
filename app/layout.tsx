import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "repo-wrap | AI README Generator",
    template: "%s | repo-wrap",
  },
  description:
    "Generate polished, professional README files from your package.json and code snippets with Gemini.",
  applicationName: "repo-wrap",
  keywords: [
    "README generator",
    "AI documentation",
    "Gemini",
    "developer tools",
    "package.json",
    "Next.js",
    "Hizaki Labs",
  ],
  authors: [{ name: "Hizaki Labs" }],
  creator: "Hizaki Labs",
  publisher: "Hizaki Labs",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "repo-wrap | AI README Generator",
    description:
      "Turn package.json files and code snippets into professional README documentation.",
    type: "website",
    siteName: "repo-wrap",
  },
  twitter: {
    card: "summary_large_image",
    title: "repo-wrap | AI README Generator",
    description:
      "Turn package.json files and code snippets into professional README documentation.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        <header className="sticky top-0 z-50 border-b border-indigo-400/40 bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-lg shadow-indigo-950/15">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="group flex min-w-0 items-center gap-3 rounded-lg outline-none transition focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-600"
              aria-label="repo-wrap home"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 shadow-inner ring-1 ring-white/30 transition group-hover:bg-white/25"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="m7.5 4.5-4 7.5 4 7.5" />
                  <path d="m16.5 4.5 4 7.5-4 7.5" />
                  <path d="m14.5 3.5-5 17" />
                </svg>
              </span>

              <span className="min-w-0">
                <span className="block truncate font-heading text-lg font-bold tracking-tight">
                  repo-wrap
                </span>
                <span className="hidden text-xs text-indigo-100 sm:block">
                  by Hizaki Labs
                </span>
              </span>
            </Link>

            <nav
              className="flex items-center gap-1 text-sm font-medium"
              aria-label="Primary navigation"
            >
              <a
                href="#generator"
                className="rounded-lg px-3 py-2 text-indigo-50 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Generator
              </a>
              <a
                href="#how-it-works"
                className="hidden rounded-lg px-3 py-2 text-indigo-50 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:block"
              >
                How it works
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hidden rounded-lg bg-white/15 px-3 py-2 text-white ring-1 ring-white/25 transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:block"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>

        {children}

        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-center text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p>
              © 2026 Hizaki Labs. Built for developers who value great
              documentation.
            </p>
            <p className="font-medium text-slate-600">
              Secure server-side Gemini generation
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}