"use client";

import { useState, useEffect } from "react";
import { SearchBar } from "@/components/search-bar";
import { FeaturedRestaurants } from "@/components/featured-restaurants";
import { CityLinks } from "@/components/city-links";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  Heart,
  Filter,
  CalendarDays,
  Map,
  UserPlus,
  SlidersHorizontal,
  BookOpen,
  Utensils,
  Coffee,
} from "lucide-react";

const cuisineTypes = [
  { label: "Česká", emoji: "🇨🇿" },
  { label: "Italská", emoji: "🇮🇹" },
  { label: "Asijská", emoji: "🥢" },
  { label: "Vegetariánská", emoji: "🥬" },
  { label: "Bezlepková", emoji: "🌾" },
  { label: "Fast food", emoji: "🍔" },
  { label: "Kavárna", emoji: "☕" },
];

function AnimatedCounter({ end, label }: { end: number; label: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (end === 0) return;
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
      <p className="text-3xl font-bold text-primary sm:text-4xl">{count > 0 ? `${count}+` : "..."}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export default function HomePage() {
  const [stats, setStats] = useState({ restaurants: 0, menuItems: 0, reviews: 0, users: 0 });

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then(setStats).catch(() => {});
  }, []);

  return (
    <div>
      {/* ======= HERO ======= */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-warm/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.55_0.18_30/0.12),transparent)]" />
        <div className="absolute right-0 top-0 -mr-40 -mt-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-40 -ml-40 h-80 w-80 rounded-full bg-warm/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm shadow-sm">
              <Star className="mr-1.5 h-3.5 w-3.5 text-primary" />
              Vyhledávač restaurací a jídelních lístků
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Kam dnes na jídlo?
              <br />
              <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                Najděte to za vteřinu
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
              Prohlédněte si menu restaurací, zjistěte co dnes vaří k obědu
              a najděte nové oblíbené podniky ve vašem městě.
            </p>

            <SearchBar
              className="mx-auto mt-8 max-w-xl"
              inputClassName="h-14 rounded-xl pl-12 text-base shadow-lg shadow-primary/5 border-border/50 focus:border-primary/30"
            />

            {/* Cuisine chips */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {cuisineTypes.map((c) => (
                <Link
                  key={c.label}
                  href={`/restaurace?cuisine=${encodeURIComponent(c.label.toLowerCase())}`}
                >
                  <Badge
                    variant="outline"
                    className="cursor-pointer gap-1.5 px-3 py-1.5 transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-sm"
                  >
                    <span>{c.emoji}</span>
                    {c.label}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======= STATS ======= */}
      <section className="border-y bg-card py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <AnimatedCounter end={stats.restaurants} label="Restaurací" />
            <AnimatedCounter end={stats.menuItems} label="Jídel v menu" />
            <AnimatedCounter end={stats.reviews} label="Recenzí" />
            <AnimatedCounter end={stats.users} label="Uživatelů" />
          </div>
        </div>
      </section>

      {/* ======= JAK TO FUNGUJE — PRO NÁVŠTĚVNÍKY ======= */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-4">Jak to funguje</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Najděte restauraci ve 3 krocích
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Žádná registrace, žádná aplikace ke stažení. Stačí otevřít prohlížeč.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {[
              {
                step: "1",
                icon: Search,
                title: "Hledejte nebo procházejte",
                description: "Zadejte název restaurace, město nebo typ kuchyně. Nebo si prohlédněte restaurace na mapě a filtrujte podle vašich preferencí.",
                color: "from-blue-500 to-blue-600",
              },
              {
                step: "2",
                icon: BookOpen,
                title: "Prohlédněte si menu a denní nabídku",
                description: "U každé restaurace najdete kompletní jídelní lístek s cenami, dnešní denní menu, otevírací dobu, fotky a recenze.",
                color: "from-primary to-primary/80",
              },
              {
                step: "3",
                icon: Heart,
                title: "Uložte si oblíbené",
                description: "Vytvořte si účet zdarma a ukládejte oblíbené restaurace. Nastavte si stravovací preference a dostanete personalizovaná doporučení.",
                color: "from-pink-500 to-rose-500",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="mb-5 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white text-sm font-bold shadow-lg`}>
                    {item.step}
                  </div>
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======= CO NAJDETE NA MENUCZ ======= */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-4">Funkce pro vás</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Vše co potřebujete vědět o restauraci
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Utensils,
                title: "Jídelní lístky online",
                desc: "Kompletní menu s cenami, popisem jídel a alergeny. Vyberte si ještě před příchodem.",
                href: "/restaurace",
              },
              {
                icon: CalendarDays,
                title: "Denní menu na jednom místě",
                desc: "Podívejte se co dnes vaří restaurace ve vašem městě. Aktualizováno každý den.",
                href: "/dnes",
              },
              {
                icon: Map,
                title: "Interaktivní mapa",
                desc: "Najděte restaurace ve vašem okolí na mapě. Zobrazte si které právě mají otevřeno.",
                href: "/restaurace",
              },
              {
                icon: SlidersHorizontal,
                title: "Pokročilé filtry",
                desc: "Filtrujte podle kuchyně, stravování (bezlepkové, veganské), cenové úrovně, služeb a dalšího.",
                href: "/restaurace",
              },
              {
                icon: Star,
                title: "Recenze a hodnocení",
                desc: "Přečtěte si recenze od ostatních hostů. Sdílejte svou zkušenost a pomozte ostatním.",
                href: "/restaurace",
              },
              {
                icon: QrCode,
                title: "QR kód v restauraci",
                desc: "Naskenujte QR kód na stole a menu se vám zobrazí přímo v mobilu. Žádná aplikace.",
                href: "/restaurace",
              },
              {
                icon: Heart,
                title: "Oblíbené restaurace",
                desc: "Ukládejte si restaurace do oblíbených a mějte je vždy po ruce.",
                href: "/oblibene",
              },
              {
                icon: UserPlus,
                title: "Vlastní účet",
                desc: "Zaregistrujte se a získejte přehled o oblíbených, recenzích a personalizovaná doporučení.",
                href: "/registrace-host",
              },
              {
                icon: Smartphone,
                title: "Funguje na mobilu",
                desc: "Celá aplikace je optimalizovaná pro telefon. Najděte restauraci cestou z práce.",
                href: "/restaurace",
              },
            ].map((f) => (
              <Link key={f.title} href={f.href}>
                <Card className="group h-full border-border/50 transition-all hover:border-primary/20 hover:shadow-lg hover:-translate-y-0.5">
                  <CardContent className="pt-6">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-1.5 font-semibold group-hover:text-primary transition-colors">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ======= RESTAURACE PODLE MĚSTA ======= */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h3 className="mb-4 text-center text-lg font-semibold">Restaurace podle města</h3>
          <CityLinks />
        </div>
      </section>

      {/* ======= FEATURED RESTAURANTS ======= */}
      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Objevte restaurace</h2>
            <p className="mt-3 text-muted-foreground">Nejlépe hodnocené, s denním menu a nově přidané</p>
          </div>
          <FeaturedRestaurants />
          <div className="mt-8 text-center">
            <Link href="/restaurace">
              <Button variant="outline" className="gap-2">
                Zobrazit všechny restaurace
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ======= JAK SE ORIENTOVAT ======= */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-4">Průvodce aplikací</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Jak se v MenuCZ orientovat
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Rychlý přehled sekcí, kde co najdete
            </p>
          </div>

          <div className="mx-auto max-w-3xl space-y-4">
            {[
              {
                icon: Search,
                title: "Restaurace",
                desc: "Hlavní vyhledávání — hledejte podle názvu, filtrujte kuchyni, stravování, město, cenovou kategorii. Přepněte na zobrazení mapy.",
                href: "/restaurace",
                badge: "Hlavní sekce",
              },
              {
                icon: CalendarDays,
                title: "Denní menu dnes",
                desc: "Přehled všech restaurací, které dnes nabízí polední menu. Filtrujte podle města. Ideální pro obědy.",
                href: "/dnes",
                badge: "Každý den aktuální",
              },
              {
                icon: Heart,
                title: "Oblíbené",
                desc: "Vaše uložené restaurace. Funguje i bez přihlášení (ukládá do prohlížeče). S účtem se synchronizuje napříč zařízeními.",
                href: "/oblibene",
                badge: null,
              },
              {
                icon: UserPlus,
                title: "Uživatelský účet",
                desc: "Zaregistrujte se a získejte: oblíbené v cloudu, historii recenzí, stravovací preference (bezlepkové, veganské...) a výchozí město.",
                href: "/registrace-host",
                badge: "Zdarma",
              },
              {
                icon: QrCode,
                title: "QR kód v restauraci",
                desc: "Naskenujte QR kód na stole — otevře se vám menu v mobilu. Uvidíte jídelní lístek, denní menu, otevírací dobu i kontakt. Žádná instalace.",
                href: null,
                badge: "Bez aplikace",
              },
            ].map((item) => (
              <Card key={item.title} className="transition-all hover:shadow-md">
                <CardContent className="flex items-start gap-4 pt-5 pb-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      {item.badge && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{item.badge}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                  {item.href && (
                    <Link href={item.href} className="shrink-0">
                      <Button variant="ghost" size="sm" className="gap-1 text-xs">
                        Otevřít
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ======= CTA PRO HOSTY ======= */}
      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Card className="border-primary/10 bg-gradient-to-br from-primary/5 via-card to-warm/5">
            <CardContent className="flex flex-col items-center gap-5 py-12 text-center sm:flex-row sm:text-left sm:py-10 sm:gap-8">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UserPlus className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold">Vytvořte si účet zdarma</h3>
                <p className="mt-2 text-muted-foreground">
                  Ukládejte oblíbené restaurace, pište recenze, nastavte si stravovací preference
                  a výchozí město. Vše zdarma, bez závazků.
                </p>
              </div>
              <Link href="/registrace-host" className="shrink-0">
                <Button size="lg" className="gap-2">
                  Registrovat se
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ======= CTA PRO RESTAURACE ======= */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-2xl shadow-primary/20">
            <CardContent className="flex flex-col items-center gap-6 py-12 text-center sm:py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <ChefHat className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">
                  Provozujete restauraci?
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-primary-foreground/80">
                  Dejte vašemu menu moderní podobu. QR kódy, denní menu, profil restaurace
                  a statistiky — začněte zdarma.
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
                    Zaregistrovat
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
