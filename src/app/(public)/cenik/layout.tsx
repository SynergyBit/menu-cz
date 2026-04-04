import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ceník",
  description: "Plány pro restaurace — od zdarma po Premium. QR kódy, denní menu, fotogalerie a další.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
