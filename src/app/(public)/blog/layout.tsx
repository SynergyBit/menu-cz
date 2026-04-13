import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Tipy, recepty, rozhovory a průvodce světem gastronomie. Čtěte na blogu Gastroo.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
