import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registrace",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
