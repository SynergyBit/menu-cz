import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Happy Hours",
  description: "Aktuální happy hours a akční nabídky restaurací. Slevy na jídlo a pití ve vašem okolí.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
