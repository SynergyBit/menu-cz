"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  UtensilsCrossed,
  MapPin,
  Clock,
  QrCode,
  Star,
  ChefHat,
  Salad,
  Pizza,
  Soup,
  ArrowRight,
} from "lucide-react";

const cuisineTypes = [
  { label: "Česká", icon: Soup },
  { label: "Italská", icon: Pizza },
  { label: "Asijská", icon: ChefHat },
  { label: "Vegetariánská", icon: Salad },
  { label: "Mezinárodní", icon: UtensilsCrossed },
];

const features = [
  {
    icon: UtensilsCrossed,
    title: "Jídelní lístek online",
    description:
      "Kompletní menu restaurace na jednom místě. Ceny, popis jídel a alergeny.",
  },
  {
    icon: Clock,
    title: "Denní menu",
    description:
      "Aktuální polední nabídka restaurací ve vašem okolí. Každý den čerstvé.",
  },
  {
    icon: QrCode,
    title: "QR kód menu",
    description:
      "Naskenujte QR kód v restauraci a mějte menu přímo v mobilu. Bez aplikace.",
  },
  {
    icon: MapPin,
    title: "Najdi restauraci",
    description:
      "Vyhledávejte restaurace podle lokality, typu kuchyně nebo hodnocení.",
  },
];

export default function HomePage() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/restaurace?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/restaurace");
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-warm/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.55_0.18_30/0.12),transparent)]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
              <Star className="mr-1.5 h-3.5 w-3.5 text-primary" />
              Vyhledávač restaurací
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Najděte svou oblíbenou
              <span className="relative ml-2">
                <span className="text-primary">restauraci</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 12"
                  fill="none"
                >
                  <path
                    d="M2 8c40-6 80-6 120-2s56 4 76-2"
                    stroke="oklch(0.55 0.18 30)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.4"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              Prohlédněte si jídelní lístek, denní menu a otevírací dobu
              restaurací. Vše na jednom místě.
            </p>

            {/* Search bar */}
            <form
              onSubmit={handleSearch}
              className="mx-auto mt-10 flex max-w-xl gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Název restaurace, město, typ kuchyně..."
                  className="h-12 pl-10 text-base"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6">
                Hledat
              </Button>
            </form>

            {/* Cuisine chips */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Oblíbené:</span>
              {cuisineTypes.map((c) => (
                <Link
                  key={c.label}
                  href={`/restaurace?cuisine=${encodeURIComponent(c.label.toLowerCase())}`}
                >
                  <Badge
                    variant="outline"
                    className="cursor-pointer gap-1.5 px-3 py-1.5 transition-colors hover:bg-accent"
                  >
                    <c.icon className="h-3.5 w-3.5" />
                    {c.label}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Vše o restauraci na jednom místě
            </h2>
            <p className="mt-3 text-muted-foreground">
              Pro hosty i majitele restaurací
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group border-border/50 transition-all hover:border-primary/20 hover:shadow-md"
              >
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for restaurants */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-warm/5">
            <CardContent className="flex flex-col items-center gap-6 py-12 text-center sm:py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <ChefHat className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">
                  Máte restauraci?
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
                  Zaregistrujte se a spravujte svůj jídelní lístek, denní menu a
                  profil restaurace. Zdarma pro základní funkce.
                </p>
              </div>
              <Link href="/registrace">
                <Button size="lg" className="gap-2">
                  Zaregistrovat restauraci
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
