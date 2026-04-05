"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  UtensilsCrossed,
  QrCode,
  FileText,
  CalendarDays,
  MapPin,
  Star,
  BarChart3,
  Smartphone,
  Clock,
  Shield,
  Zap,
  Users,
  ChefHat,
  Coffee,
  Hotel,
  ArrowRight,
  Check,
  Crown,
  MessageSquare,
  Camera,
  Globe,
  TrendingUp,
} from "lucide-react";

const heroStats = [
  { label: "Minut na registraci", value: "2" },
  { label: "Zdarma pro start", value: "0 Kč" },
  { label: "Potřeba technických znalostí", value: "Žádná" },
];

const targetAudience = [
  {
    icon: ChefHat,
    title: "Restaurace",
    description: "Tradiční i moderní kuchyně, bistra, hospody",
  },
  {
    icon: Coffee,
    title: "Kavárny a cukrárny",
    description: "Nápojové lístky, dezerty, snídaňová menu",
  },
  {
    icon: Hotel,
    title: "Hotely a penziony",
    description: "Hotelové restaurace, snídaňové buffety, room service",
  },
];

const features = [
  {
    icon: FileText,
    title: "Online jídelní lístek",
    description: "Kompletní menu s cenami, popisy, alergeny. Zákazníci si prohlédnou vaši nabídku ještě před návštěvou.",
    highlight: true,
  },
  {
    icon: QrCode,
    title: "QR kód na stůl",
    description: "Vytiskněte QR kód a dejte ho na každý stůl. Hosté naskenují mobilem a okamžitě vidí menu — žádná aplikace.",
  },
  {
    icon: CalendarDays,
    title: "Denní menu",
    description: "Přidejte polední nabídku každý den. Hosté z okolí najdou vaše obědy při hledání kam na oběd.",
    highlight: true,
  },
  {
    icon: MapPin,
    title: "Viditelnost na mapě",
    description: "Vaše restaurace se zobrazí na interaktivní mapě. Turisté i místní vás snadno najdou.",
  },
  {
    icon: Star,
    title: "Recenze a hodnocení",
    description: "Hosté hodnotí vaši restauraci. Dobré hodnocení přitahuje nové zákazníky.",
  },
  {
    icon: Smartphone,
    title: "Mobilní vizitka",
    description: "Krásná stránka vaší restaurace — kontakty, sociální sítě, speciality, fotky. Vše na jednom místě.",
  },
  {
    icon: MessageSquare,
    title: "Zprávy od hostů",
    description: "Přijímejte rezervace a dotazy přímo přes formulář na vaší stránce. Žádné telefonáty navíc.",
  },
  {
    icon: Camera,
    title: "Fotogalerie",
    description: "Ukažte interiér, jídla a atmosféru. Fotky prodávají víc než slova.",
  },
  {
    icon: BarChart3,
    title: "Statistiky návštěvnosti",
    description: "Sledujte kolik lidí si prohlíží vaše menu, kolik skenuje QR kód. Rozhodujte se na základě dat.",
  },
  {
    icon: Globe,
    title: "SEO a Google",
    description: "Vaše restaurace se zobrazí ve výsledcích vyhledávání. Více návštěvníků bez placené reklamy.",
  },
];

const benefits = [
  {
    title: "Konec zastaralých papírových menu",
    description: "Změna cen, přidání nového jídla — vše za pár sekund z mobilu nebo počítače. Žádné přetisky.",
    icon: Zap,
  },
  {
    title: "Zákazníci vás najdou online",
    description: "80 % lidí hledá restaurace na internetu. Buďte tam, kde vás hledají — s kompletním menu a kontaktem.",
    icon: TrendingUp,
  },
  {
    title: "Profesionální dojem bez nákladů",
    description: "Moderní online vizitka s fotkami, mapou a recenzemi. Vypadáte profesionálně bez investice do vlastního webu.",
    icon: Shield,
  },
  {
    title: "Obědy z okolí přicházejí k vám",
    description: "Denní menu agregátor MenuCZ je první místo, kam lidé koukají při hledání oběda. Buďte v něm.",
    icon: Users,
  },
];

const testimonials = [
  {
    name: "Martin K.",
    role: "Majitel restaurace",
    text: "Konečně nemusím každý den fotit cedulku s denním menu a dávat na Facebook. Stačí vyplnit formulář a je to.",
  },
  {
    name: "Petra N.",
    role: "Provozní kavárny",
    text: "QR kódy na stolech jsou skvělé. Hosté si sami prohlédnou nápojový lístek, my máme víc času na přípravu.",
  },
  {
    name: "Jakub D.",
    role: "Šéfkuchař",
    text: "Líbí se mi, jak jednoduché je přidat nové jídlo. Žádné složité systémy — prostě vyplním a hotovo.",
  },
];

export default function ProRestauracePage() {
  const [statsData, setStatsData] = useState({ restaurants: 0, menuItems: 0, reviews: 0 });

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStatsData)
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-warm/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.55_0.18_30/0.12),transparent)]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm">
              Pro restaurace, hotely a kavárny
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Vaše menu patří
              <br />
              <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                do 21. století
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
              Online jídelní lístek, QR kódy na stoly, denní menu a profil vaší restaurace.
              Začněte zdarma a získejte nové zákazníky.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/registrace">
                <Button size="lg" className="gap-2 h-14 px-8 text-base shadow-lg shadow-primary/20">
                  Zaregistrovat restauraci zdarma
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/cenik">
                <Button size="lg" variant="outline" className="gap-2 h-14 px-8 text-base">
                  Zobrazit ceník
                </Button>
              </Link>
            </div>

            {/* Quick stats */}
            <div className="mx-auto mt-12 grid max-w-md grid-cols-3 gap-6">
              {heroStats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-bold text-primary">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* For whom */}
      <section className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Pro koho je MenuCZ?</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {targetAudience.map((t) => (
              <Card key={t.title} className="text-center transition-all hover:shadow-lg hover:-translate-y-1">
                <CardContent className="pt-8 pb-6">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <t.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold">{t.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-4">Funkce</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Vše co potřebujete na jednom místě
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Žádné složité systémy. Jednoduché nástroje, které fungují.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card
                key={f.title}
                className={`group relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 ${
                  f.highlight ? "border-primary/20 bg-primary/[0.02]" : ""
                }`}
              >
                {f.highlight && (
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary to-primary/50" />
                )}
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-4">Výhody</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Proč restaurace volí MenuCZ
            </h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {benefits.map((b, i) => (
              <div key={b.title} className="flex gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <b.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{b.title}</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Jak začít?</h2>
            <p className="mt-3 text-muted-foreground">3 kroky a máte hotovo</p>
          </div>

          <div className="mx-auto max-w-3xl">
            <div className="space-y-8">
              {[
                {
                  step: "1",
                  title: "Zaregistrujte se zdarma",
                  description: "Vyplňte název restaurace, email a heslo. Zabere to 2 minuty. Žádná platební karta.",
                },
                {
                  step: "2",
                  title: "Vyplňte profil a přidejte menu",
                  description: "Nahrajte logo, adresu, otevírací dobu. Přidejte kategorie a jídla s cenami. Nastavte denní menu.",
                },
                {
                  step: "3",
                  title: "Sdílejte QR kód a sbírejte zákazníky",
                  description: "Stáhněte QR kód, vytiskněte a dejte na stoly. Hosté naskenují a uvidí vaše menu. Hotovo.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-1 text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Co říkají naši uživatelé</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="transition-all hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-primary sm:text-4xl">{statsData.restaurants || 0}+</p>
              <p className="mt-1 text-sm text-muted-foreground">Registrovaných restaurací</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary sm:text-4xl">{statsData.menuItems || 0}+</p>
              <p className="mt-1 text-sm text-muted-foreground">Položek v menu</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary sm:text-4xl">{statsData.reviews || 0}+</p>
              <p className="mt-1 text-sm text-muted-foreground">Recenzí od hostů</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-2xl shadow-primary/20">
            <CardContent className="flex flex-col items-center gap-8 py-14 text-center sm:py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Crown className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold sm:text-4xl">
                  Začněte zdarma, upgradujte kdykoliv
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-primary-foreground/80 text-lg">
                  Základní funkce jsou navždy zdarma. Potřebujete více?
                  Plány Standard a Premium odemykají denní menu, QR kódy, fotogalerii a další.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/registrace">
                  <Button size="lg" variant="secondary" className="gap-2 h-14 px-8 text-base shadow-lg">
                    Zaregistrovat zdarma
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/cenik">
                  <Button size="lg" variant="ghost" className="gap-2 h-14 px-8 text-base text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
                    Zobrazit ceník plánů
                  </Button>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-primary-foreground/70">
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4" />
                  Bez platební karty
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4" />
                  Zrušení kdykoliv
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4" />
                  Český support
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
