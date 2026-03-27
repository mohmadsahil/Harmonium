import type { Metadata } from "next";
import Link from "next/link";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://virtual-harmonium.vercel.app"),
  title: {
    default: "Virtual Harmonium Player | Play Harmonium Online Free",
    template: "%s | Virtual Harmonium Player",
  },
  description:
    "Play harmonium online with keyboard, touch, MIDI, metronome, recording, and Indian classical note modes.",
  keywords: [
    "Play harmonium online",
    "Learn harmonium free",
    "Harmonium notes for beginners",
    "Virtual harmonium player",
    "Sargam keyboard",
  ],
  openGraph: {
    title: "Virtual Harmonium Player",
    description:
      "Interactive online harmonium with mouse and keyboard controls, recording, metronome, and ragas library.",
    type: "website",
    url: "/",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Virtual Harmonium Player" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Virtual Harmonium Player",
    description: "Play harmonium online instantly with Indian music learning tools.",
    images: ["/og-image.svg"],
  },
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "xuJ9S_ndqyy7ns8R3CaRSm-IOTsbSuUlKxPDioOf5rM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const year = new Date().getFullYear();

  return (
    <html lang="en" suppressHydrationWarning className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            <footer className="mt-8 border-t border-white/10 bg-black/20">
              <div className="content-wrap flex flex-col gap-4 px-2 py-6 text-sm text-zinc-300 md:flex-row md:items-center md:justify-between">
                <p>© {year} Virtual Harmonium Player</p>
                <nav className="flex flex-wrap items-center gap-3">
                  <Link href="/" className="hover:text-amber-300">
                    Home
                  </Link>
                  <span className="text-zinc-500">|</span>
                  <Link href="/learn-harmonium" className="hover:text-amber-300">
                    Learn Harmonium
                  </Link>
                  <span className="text-zinc-500">|</span>
                  <Link href="/ragas-library" className="hover:text-amber-300">
                    Ragas Library
                  </Link>
                  <span className="text-zinc-500">|</span>
                  <Link href="/blog" className="hover:text-amber-300">
                    Blog
                  </Link>
                </nav>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
