import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
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
  title: {
    default: "MenuCZ — Najdi restauraci, prohlédni si menu",
    template: "%s | MenuCZ",
  },
  description:
    "Interaktivní vyhledávač restaurací. Prohlédni si jídelní lístek, denní menu a otevírací dobu restaurací ve tvém okolí.",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    siteName: "MenuCZ",
    title: "MenuCZ — Vyhledávač restaurací",
    description: "Prohlédněte si jídelní lístek, denní menu a najděte svou oblíbenou restauraci.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="cs"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster position="bottom-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
