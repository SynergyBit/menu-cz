import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pro restaurace, hotely a kavárny",
  description: "Online jídelní lístek, QR kódy, denní menu a profil vaší restaurace. Získejte nové zákazníky a zmodernizujte vaše menu.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
