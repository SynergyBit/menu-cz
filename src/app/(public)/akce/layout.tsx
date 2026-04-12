import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Akce a události",
  description: "Nadcházející akce v restauracích — degustace, živá hudba, tematické večery a speciální menu.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
