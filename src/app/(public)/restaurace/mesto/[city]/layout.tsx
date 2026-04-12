import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const cityName = decodeURIComponent(city).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `Restaurace ${cityName}`,
    description: `Nejlepší restaurace v ${cityName}. Prohlédněte si jídelní lístky, denní menu, hodnocení a otevírací dobu restaurací v ${cityName}.`,
    openGraph: {
      title: `Restaurace v ${cityName} | Gastroo`,
      description: `Najděte restauraci v ${cityName} — jídelní lístky, denní menu a recenze.`,
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
