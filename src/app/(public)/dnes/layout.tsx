import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Denní menu dnes",
  description: "Všechna dnešní polední menu na jednom místě. Najděte kam na oběd ve vašem městě.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
