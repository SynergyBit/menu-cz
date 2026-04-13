import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Novinky",
  description: "Co je nového v restauracích — nové podniky, akce, happy hours, denní menu a recenze.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
