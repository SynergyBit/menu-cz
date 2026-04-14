import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { CookieConsent } from "@/components/cookie-consent";
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
    default: "Gastroo — Restaurace a kavárny v ČR a SR",
    template: "%s | Gastroo",
  },
  description:
    "Vyhledávač restaurací a kaváren v České republice a na Slovensku. Jídelní lístky, denní menu, káva, dezerty, rezervace a recenze na jednom místě.",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    alternateLocale: ["sk_SK"],
    siteName: "Gastroo",
    title: "Gastroo — Restaurace a kavárny v ČR a SR",
    description:
      "Menu, denní nabídky, káva i dezerty — restaurace a kavárny ve vašem okolí v ČR i na Slovensku.",
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
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
