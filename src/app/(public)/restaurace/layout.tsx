import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Restaurace",
  description: "Prohlédněte si restaurace, jídelní lístky a denní menu ve vašem okolí.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
