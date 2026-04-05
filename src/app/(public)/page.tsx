"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/search-bar";
import { FeaturedRestaurants } from "@/components/featured-restaurants";
import { CityLinks } from "@/components/city-links";
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
  Smartphone,
  Shield,
  Zap,
  Users,
  FileText,
  CalendarDays,
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
    icon: CalendarDays,
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
    title: "Mapa restaurací",
    description:
      "Interaktivní mapa s restauracemi. Najděte nejbližší podnik ve vašem okolí.",
  },
];

const benefits = [
  {
    icon: Smartphone,
    title: "Mobilní přístup",
    description: "Vaše menu vypadá perfektně na každém zařízení",
  },
  {
    icon: Zap,
    title: "Okamžité úpravy",
    description: "Změňte cenu nebo přidejte jídlo během pár sekund",
  },
  {
    icon: Shield,
    title: "Jednoduché ovládání",
    description: "Žádné technické znalosti nejsou potřeba",
  },
];

function AnimatedCounter({ end, label }: { end: number; label: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = end / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [end]);

  return (
    <div className="text-center">
      <p className="text-4xl font-bold text-primary sm:text-5xl">{count}+</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export default function HomePage() {
  const [stats, setStats] = useState({ restaurants: 0, menuItems: 0, reviews: 0, users: 0 });

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-warm/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.55_0.18_30/0.15),transparent)]" />
        <div className="absolute right-0 top-0 -mr-40 -mt-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-40 -ml-40 h-80 w-80 rounded-full bg-warm/10 blur-3xl" />

        {/* Floating food icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[10%] text-primary/10 animate-bounce" style={{ animationDelay: "0s", animationDuration: "3s" }}>
            <Soup className="h-8 w-8" />
          </div>
          <div className="absolute top-32 right-[15%] text-primary/10 animate-bounce" style={{ animationDelay: "1s", animationDuration: "4s" }}>
            <Pizza className="h-10 w-10" />
          </div>
          <div className="absolute bottom-24 left-[20%] text-primary/10 animate-bounce" style={{ animationDelay: "0.5s", animationDuration: "3.5s" }}>
            <ChefHat className="h-7 w-7" />
          </div>
          <div className="absolute bottom-32 right-[25%] text-primary/10 animate-bounce" style={{ animationDelay: "1.5s", animationDuration: "4.5s" }}>
            <UtensilsCrossed className="h-9 w-9" />
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 sm:pt-36">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm shadow-sm">
              <Star className="mr-1.5 h-3.5 w-3.5 text-primary" />
              Vyhledávač restaurací a jídelních lístků
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
              Objevte chuť
              <br />
              <span className="relative inline-block mt-1">
                <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                  vašeho města
                </span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 300 12"
                  fill="none"
                >
                  <path
                    d="M2 8c60-6 120-6 180-2s84 4 116-2"
                    stroke="oklch(0.55 0.18 30)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.3"
                  />
                </svg>
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
              Procházejte jídelní lístky, sledujte denní menu a najděte svou
              oblíbenou restauraci. Vše přehledně na jednom místě.
            </p>

            {/* Search bar with autocomplete */}
            <SearchBar
              className="mx-auto mt-10 max-w-xl"
              inputClassName="h-14 rounded-xl pl-12 text-base shadow-lg shadow-primary/5 border-border/50 focus:border-primary/30"
            />

            {/* Cuisine chips */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground mr-1">Oblíbené:</span>
              {cuisineTypes.map((c) => (
                <Link
                  key={c.label}
                  href={`/restaurace?cuisine=${encodeURIComponent(c.label.toLowerCase())}`}
                >
                  <Badge
                    variant="outline"
                    className="cursor-pointer gap-1.5 px-3 py-1.5 transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-sm"
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

      {/* Stats */}
      <section className="border-t border-b bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <AnimatedCounter end={stats.restaurants || 0} label="Restaurací" />
            <AnimatedCounter end={stats.menuItems || 0} label="Položek v menu" />
            <AnimatedCounter end={stats.reviews || 0} label="Recenzí" />
            <AnimatedCounter end={stats.users || 0} label="Registrovaných hostů" />
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="mb-3 text-center text-sm text-muted-foreground">Restaurace podle města</p>
          <CityLinks />
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-4">Pro hosty</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Vše o restauraci na jednom místě
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Najděte restauraci, podívejte se na menu a zjistěte otevírací dobu. Bez stahování aplikace.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border-border/50 transition-all hover:border-primary/20 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="absolute right-0 top-0 h-24 w-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-3xl" />
                <CardContent className="relative pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured restaurants */}
      <section className="border-t py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Objevte restaurace</h2>
            <p className="mt-3 text-muted-foreground">Nejlépe hodnocené, s denním menu a nově přidané</p>
          </div>
          <FeaturedRestaurants />
        </div>
      </section>

      {/* How it works — for restaurants */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-4">Pro restaurace</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Začněte za 3 minuty
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Jednoduché kroky k online přítomnosti vaší restaurace
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "1",
                icon: Users,
                title: "Zaregistrujte se",
                description:
                  "Vytvořte si účet, pojmenujte restauraci a máte hotovo. Základní funkce jsou zdarma.",
              },
              {
                step: "2",
                icon: FileText,
                title: "Přidejte menu",
                description:
                  "Přidejte kategorie, jídla s cenami, denní menu a nastavte otevírací dobu.",
              },
              {
                step: "3",
                icon: QrCode,
                title: "Sdílejte QR kód",
                description:
                  "Stáhněte QR kód a dejte ho na stoly. Hosté naskenují a uvidí vaše menu.",
              },
            ].map((item) => (
              <Card key={item.step} className="relative overflow-hidden border-border/50 transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {item.step}
                </div>
                <CardContent className="pt-16 pb-8 text-center">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20">
                    <item.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge variant="outline" className="mb-4">Proč MenuCZ?</Badge>
              <h2 className="text-3xl font-bold sm:text-4xl">
                Moderní menu pro moderní restaurace
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Konec s papírovými menu, které nikdo nečte. Dejte svým hostům interaktivní
                zážitek s aktuálními cenami, denním menu a alergeny. Vše dostupné přes QR kód.
              </p>

              <div className="mt-8 space-y-6">
                {benefits.map((b) => (
                  <div key={b.title} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <b.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{b.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {b.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual card */}
            <div className="relative">
              <div className="absolute inset-0 -m-4 rounded-3xl bg-gradient-to-br from-primary/5 to-warm/10 blur-2xl" />
              <Card className="relative overflow-hidden border-primary/10">
                <CardContent className="p-0">
                  {/* Mock restaurant card */}
                  <div className="h-40 bg-gradient-to-br from-primary/20 via-primary/10 to-warm/20 flex items-center justify-center">
                    <UtensilsCrossed className="h-16 w-16 text-primary/30" />
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">U Zlatého lva</h3>
                        <p className="text-sm text-muted-foreground">Tradiční česká kuchyně</p>
                      </div>
                      <Badge className="bg-green-500/90 text-white gap-1">
                        <Clock className="h-3 w-3" />
                        Otevřeno
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="gap-1 text-xs">
                        <MapPin className="h-3 w-3" />
                        Praha 1
                      </Badge>
                      <Badge variant="outline" className="text-xs">Česká</Badge>
                      <Badge variant="outline" className="gap-1 text-xs border-green-500/30 text-green-700">
                        <CalendarDays className="h-3 w-3" />
                        Denní menu
                      </Badge>
                    </div>
                    <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                      <p className="text-xs font-medium text-muted-foreground">Dnešní polední menu:</p>
                      <div className="flex justify-between text-sm">
                        <span>Svíčková na smetaně</span>
                        <span className="font-semibold text-primary">155 Kč</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Kuřecí řízek</span>
                        <span className="font-semibold text-primary">145 Kč</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA for restaurants */}
      <section className="border-t py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-2xl shadow-primary/20">
            <CardContent className="flex flex-col items-center gap-6 py-14 text-center sm:py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <ChefHat className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold sm:text-4xl">
                  Máte restauraci?
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-primary-foreground/80 text-lg">
                  Zaregistrujte se a dejte vašemu menu moderní podobu.
                  QR kódy, denní menu a správa profilu zdarma.
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/pro-restaurace">
                  <Button size="lg" variant="secondary" className="gap-2 shadow-lg">
                    Zjistit více
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/registrace">
                  <Button size="lg" variant="ghost" className="gap-2 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
                    Zaregistrovat restauraci
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
