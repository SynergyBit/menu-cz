import type { Metadata } from "next";
export const metadata: Metadata = { title: "Kuchařka", description: "Recepty od Gastroo — předkrmy, hlavní jídla, polévky, dezerty a další. Krok za krokem s ingrediencemi." };
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
