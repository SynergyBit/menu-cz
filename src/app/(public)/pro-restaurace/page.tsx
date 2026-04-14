"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  QrCode,
  FileText,
  CalendarDays,
  Star,
  BarChart3,
  Zap,
  Users,
  ArrowRight,
  Check,
  X,
  Crown,
  Camera,
  Globe,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Clock,
  Phone,
} from "lucide-react";
import { plans } from "@/lib/plans";

const heroBenefits = [
  { icon: Clock, text: "Spuštění za 2 minuty" },
  { icon: ShieldCheck, text: "Bez platební karty" },
  { icon: Sparkles, text: "Základ zdarma napořád" },
];

const painPoints = [
  {
    before: "Každý týden přetisk papírového menu",
    after: "Změna ceny za 5 sekund z mobilu",
  },
  {
    before: "Hosté volají kvůli otevírací době a rezervacím",
    after: "Vše najdou online, rezervují přes profil",
  },
  {
    before: "Zahraniční turisté nerozumí jídelnímu lístku",
    after: "QR kód + překlad do 20 jazyků automaticky",
  },
  {
    before: "Nevíte kolik lidí si menu prohlédlo",
    after: "Statistiky skenů, zobrazení a hovorů v reálném čase",
  },
];

const outcomes = [
  {
    icon: TrendingUp,
    stat: "+32 %",
    label: "více návštěv profilu",
    desc: "po přidání QR kódů na stoly a do výlohy",
  },
  {
    icon: Users,
    stat: "0 Kč",
    label: "náklady na web",
    desc: "místo vývoje vlastních stránek od 30 000 Kč",
  },
  {
    icon: Clock,
    stat: "2 min",
    label: "změna menu",
    desc: "místo 2 dnů čekání na grafika a tiskárnu",
  },
];

const featureGroups = [
  {
    title: "Online menu a QR kódy",
    icon: QrCode,
    items: [
      "Kompletní jídelní lístek s cenami a alergeny",
      "QR kód s vlastním designem — PNG i SVG",
      "Denní a týdenní menu se šablonami",
      "Export menu jako PDF k tisku",
      "Překlad menu do 20 jazyků (Premium)",
    ],
  },
  {
    title: "Vizitka a prodej",
    icon: Camera,
    items: [
      "Profesionální profil s fotogalerií",
      "Online rezervace stolů bez telefonátů",
      "Akce, Happy Hours a slevové kupóny",
      "Sezónní menu (vánoční, letní gril)",
      "Widget pro vlastní web — iframe",
    ],
  },
  {
    title: "Zákazníci a růst",
    icon: BarChart3,
    items: [
      "Viditelnost na mapě a v agregátoru obědů",
      "Recenze a hvězdičkové hodnocení",
      "Zprávy a kontaktní formulář",
      "Statistiky zobrazení a QR skenů",
      "Zvýrazněná pozice ve výsledcích (Premium)",
    ],
  },
];

const comparison = [
  { feature: "Změna menu", gastroo: "2 minuty z mobilu", paper: "Přetisk, 1–2 dny" },
  { feature: "Měsíční cena", gastroo: "0 – 599 Kč", paper: "0 Kč + tisk" },
  { feature: "Vlastní web", gastroo: "Součást profilu", paper: "Od 30 000 Kč" },
  { feature: "Cizí jazyky", gastroo: "20 jazyků automaticky", paper: "Ruční překlad" },
  { feature: "Online rezervace", gastroo: "Ano, v profilu", paper: "Telefon" },
  { feature: "Statistiky", gastroo: "Skeny a zobrazení", paper: "Žádné" },
];

const testimonials = [
  {
    name: "Martin Kovář",
    role: "U Zlatého Lva, Plzeň",
    text: "Každé pondělí dřív 2 hodiny chystali denní menu na Facebook a cedulku. Teď to máme za 5 minut a navíc se nám ozývají lidi, co nás nikdy neznali.",
    rating: 5,
  },
  {
    name: "Petra Nováková",
    role: "Café Bohemia, Brno",
    text: "QR kódy na stolech byly strefa. Hosté si v klidu prohlédnou nápoje, my nemusíme být 5× za směnu u každého stolu s menu.",
    rating: 5,
  },
  {
    name: "Jakub Dvořák",
    role: "Bistro Na Rohu, Praha",
    text: "Mám alergiky v rodině, takže filtr podle alergenů byl pro mě klíčový. Hosté to ocení, vidím to v recenzích.",
    rating: 5,
  },
];

const faqs = [
  {
    q: "Kolik to stojí?",
    a: "Základní plán je ZDARMA napořád — profil, menu do 5 položek, mapa. Standard 299 Kč/měsíc odemyká neomezené menu, QR kódy, rezervace a denní menu. Premium 599 Kč/měsíc přidá statistiky, překlad do 20 jazyků a zvýrazněnou pozici.",
  },
  {
    q: "Musím mít technické znalosti?",
    a: "Ne. Registrace trvá 2 minuty, menu přidáte jako v Excelu. Dashboard je v češtině a máme český support, když se zaseknete.",
  },
  {
    q: "Jak rychle začnu dostávat zákazníky?",
    a: "Profil je veřejný hned po publikaci. První návštěvy typicky přichází do 48 hodin — díky mapě, agregátoru obědů a SEO na gastroo.cz.",
  },
  {
    q: "Co s QR kódy? Musím si kupovat tiskárnu?",
    a: "QR kód si stáhnete v PNG nebo SVG, vytisknete na běžné tiskárně nebo si necháte udělat stojánky v copy centru za pár korun.",
  },
  {
    q: "Můžu zrušit kdykoliv?",
    a: "Ano, bez vázání. Standard a Premium se platí měsíčně nebo ročně se slevou. Zrušení znamená návrat na Free plán, data zůstávají.",
  },
  {
    q: "Funguje to pro hotely a kavárny?",
    a: "Ano. Gastroo používají restaurace, bistra, hospody, kavárny, cukrárny i hotelové restaurace. Profil přizpůsobíte svému provozu.",
  },
];

function CheckRow({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Check className="h-3 w-3" strokeWidth={3} />
      </div>
      <span className="text-sm leading-relaxed text-foreground/85">{children}</span>
    </li>
  );
}

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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-warm/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.55_0.18_30/0.18),transparent)]" />
        <div className="absolute -top-24 right-1/3 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pt-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: Copy */}
            <div>
              <Badge variant="outline" className="mb-5 gap-1.5 border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium">
                <Sparkles className="h-3 w-3 text-primary" />
                Už přes {statsData.restaurants || 100}+ restaurací v ČR
              </Badge>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-[1.05]">
                Získejte nové hosty.{" "}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Zapomeňte na papírové menu.
                </span>
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Online jídelní lístek, QR kódy, denní menu, rezervace a profil restaurace.
                Vše na jednom místě. Změníte cenu za 5 sekund, turista si menu přeloží do svého jazyka.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/registrace" className="sm:flex-initial">
                  <Button size="lg" className="w-full gap-2 h-14 px-8 text-base shadow-xl shadow-primary/25">
                    Zaregistrovat zdarma
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#ceny" className="sm:flex-initial">
                  <Button size="lg" variant="outline" className="w-full h-14 px-8 text-base">
                    Ukázat ceny
                  </Button>
                </Link>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                {heroBenefits.map((b) => (
                  <li key={b.text} className="flex items-center gap-2">
                    <b.icon className="h-4 w-4 text-primary" />
                    {b.text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Visual mockup */}
            <div className="relative lg:pl-8">
              <div className="relative mx-auto max-w-md">
                {/* Phone frame */}
                <div className="relative rounded-[2.5rem] border-8 border-foreground/90 bg-foreground/90 shadow-2xl shadow-primary/10">
                  <div className="overflow-hidden rounded-[2rem] bg-background">
                    {/* Status bar */}
                    <div className="flex items-center justify-between bg-muted/50 px-6 py-2 text-xs font-medium">
                      <span>9:41</span>
                      <span>gastroo.cz</span>
                    </div>
                    {/* App content */}
                    <div className="space-y-4 p-5">
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60" />
                          <div>
                            <p className="text-sm font-bold">U Zlatého Lva</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              4.8 · Plzeň
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-xl border bg-primary/5 p-3">
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
                          <CalendarDays className="h-3 w-3" />
                          DENNÍ MENU · PONDĚLÍ
                        </div>
                        <ul className="space-y-1.5 text-xs">
                          <li className="flex justify-between">
                            <span>Gulášová polévka</span>
                            <span className="font-semibold">45 Kč</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Svíčková s knedlíkem</span>
                            <span className="font-semibold">189 Kč</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Smažený sýr, hranolky</span>
                            <span className="font-semibold">165 Kč</span>
                          </li>
                        </ul>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg bg-muted/50 p-2">
                          <QrCode className="mx-auto h-4 w-4 text-primary" />
                          <p className="mt-1 text-[10px]">QR menu</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-2">
                          <CalendarDays className="mx-auto h-4 w-4 text-primary" />
                          <p className="mt-1 text-[10px]">Rezervace</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-2">
                          <Phone className="mx-auto h-4 w-4 text-primary" />
                          <p className="mt-1 text-[10px]">Zavolat</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating QR card */}
                <div className="absolute -bottom-6 -left-8 hidden rounded-2xl border bg-background p-3 shadow-xl sm:block">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <QrCode className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">QR na stole</p>
                      <p className="text-[10px] text-muted-foreground">Stáhnout PNG / SVG</p>
                    </div>
                  </div>
                </div>

                {/* Floating stat card */}
                <div className="absolute -right-6 top-8 hidden rounded-2xl border bg-background p-3 shadow-xl sm:block">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">+32 %</p>
                      <p className="text-[10px] text-muted-foreground">návštěv za měsíc</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof bar */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary sm:text-3xl">{statsData.restaurants || 0}+</p>
              <p className="mt-1 text-xs text-muted-foreground">Restaurací</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary sm:text-3xl">{statsData.menuItems || 0}+</p>
              <p className="mt-1 text-xs text-muted-foreground">Položek v menu</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary sm:text-3xl">{statsData.reviews || 0}+</p>
              <p className="mt-1 text-xs text-muted-foreground">Hodnocení</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary sm:text-3xl">4.8★</p>
              <p className="mt-1 text-xs text-muted-foreground">Průměrná spokojenost</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem → Solution */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-4">Před a potom</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Co se změní, když si pořídíte Gastroo
            </h2>
          </div>

          <div className="mx-auto grid max-w-4xl gap-4">
            {painPoints.map((p) => (
              <Card key={p.before} className="overflow-hidden">
                <CardContent className="grid divide-y p-0 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                  <div className="flex items-start gap-3 bg-muted/30 p-5">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                      <X className="h-3.5 w-3.5" strokeWidth={3} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bez Gastroo</p>
                      <p className="mt-1 text-sm text-foreground/80">{p.before}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-5">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">S Gastroo</p>
                      <p className="mt-1 text-sm font-medium">{p.after}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="border-y bg-gradient-to-b from-muted/30 to-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Konkrétní výsledky</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Co restauracím Gastroo přineslo během prvních 90 dní.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {outcomes.map((o) => (
              <Card key={o.label} className="relative overflow-hidden border-primary/10">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary/40" />
                <CardContent className="pt-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <o.icon className="h-6 w-6" />
                  </div>
                  <p className="text-4xl font-bold text-primary">{o.stat}</p>
                  <p className="mt-1 text-sm font-semibold">{o.label}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{o.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature groups */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-4">Funkce</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Vše co restaurace potřebuje
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Žádné napojování 5 různých systémů. Jeden dashboard, vše se navzájem doplňuje.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {featureGroups.map((g) => (
              <Card key={g.title} className="group relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/40" />
                <CardContent className="pt-8">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                    <g.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">{g.title}</h3>
                  <ul className="mt-5 space-y-3">
                    {g.items.map((item) => (
                      <CheckRow key={item}>{item}</CheckRow>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Gastroo vs. papírové menu</h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Přehledné srovnání — ať víte, co získáte.
            </p>
          </div>
          <Card className="mx-auto max-w-4xl overflow-hidden">
            <div className="grid grid-cols-3 border-b bg-background">
              <div className="p-4 sm:p-6" />
              <div className="border-l bg-primary/5 p-4 text-center sm:p-6">
                <p className="text-sm font-bold text-primary">Gastroo</p>
              </div>
              <div className="border-l p-4 text-center sm:p-6">
                <p className="text-sm font-bold text-muted-foreground">Papír + FB</p>
              </div>
            </div>
            {comparison.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 ${i !== comparison.length - 1 ? "border-b" : ""}`}
              >
                <div className="p-4 text-sm font-medium sm:p-6">{row.feature}</div>
                <div className="border-l bg-primary/5 p-4 text-center text-sm font-semibold text-primary sm:p-6">
                  {row.gastroo}
                </div>
                <div className="border-l p-4 text-center text-sm text-muted-foreground sm:p-6">
                  {row.paper}
                </div>
              </div>
            ))}
          </Card>
        </div>
      </section>

      {/* Pricing preview */}
      <section id="ceny" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-4">Ceny</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">Jednoduchý ceník</h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Začněte zdarma. Platíte jen za to, co skutečně využíváte.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {plans.map((p) => (
              <Card
                key={p.id}
                className={`relative flex flex-col ${
                  p.highlighted
                    ? "border-primary shadow-xl shadow-primary/10 md:scale-105"
                    : ""
                }`}
              >
                {p.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary px-3 py-1 text-xs shadow-lg">
                      {p.badge}
                    </Badge>
                  </div>
                )}
                <CardContent className="flex flex-1 flex-col pt-8">
                  <h3 className="text-xl font-bold">{p.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                  <div className="mt-6">
                    <p className="text-4xl font-bold">
                      {p.price === 0 ? "0 Kč" : `${p.price} Kč`}
                      <span className="text-base font-normal text-muted-foreground">
                        /měsíc
                      </span>
                    </p>
                    {p.yearlyPrice > 0 && p.yearlyPrice < p.price * 12 && (
                      <p className="mt-1 text-xs text-primary">
                        Ročně jen {p.yearlyPrice} Kč (ušetříte {p.price * 12 - p.yearlyPrice} Kč)
                      </p>
                    )}
                  </div>
                  <Separator className="my-6" />
                  <ul className="flex-1 space-y-2.5">
                    {p.id === "free" && (
                      <>
                        <CheckRow>Základní profil a mapa</CheckRow>
                        <CheckRow>Menu do 5 položek</CheckRow>
                        <CheckRow>Otevírací doba a kontakty</CheckRow>
                      </>
                    )}
                    {p.id === "standard" && (
                      <>
                        <CheckRow>Vše ze Zdarma plus:</CheckRow>
                        <CheckRow>Neomezené menu + kategorie</CheckRow>
                        <CheckRow>QR kódy, denní menu, PDF export</CheckRow>
                        <CheckRow>Fotogalerie, rezervace, akce</CheckRow>
                        <CheckRow>Alergeny, Happy Hours, kupóny</CheckRow>
                      </>
                    )}
                    {p.id === "premium" && (
                      <>
                        <CheckRow>Vše ze Standard plus:</CheckRow>
                        <CheckRow>Statistiky a analytika</CheckRow>
                        <CheckRow>Překlad menu do 20 jazyků</CheckRow>
                        <CheckRow>Widget pro vlastní web</CheckRow>
                        <CheckRow>Zvýraznění ve výsledcích</CheckRow>
                      </>
                    )}
                  </ul>
                  <Link href="/registrace" className="mt-6">
                    <Button
                      className="w-full"
                      variant={p.highlighted ? "default" : "outline"}
                    >
                      {p.id === "free" ? "Začít zdarma" : `Vyzkoušet ${p.name}`}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/cenik" className="underline underline-offset-4 hover:text-primary">
              Kompletní srovnání funkcí →
            </Link>
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Říkají o nás restauratéři</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="relative transition-all hover:shadow-xl">
                <CardContent className="pt-6">
                  <div className="mb-4 flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/85">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <Separator className="my-5" />
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-sm font-bold text-primary-foreground">
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Od registrace k prvním zákazníkům</h2>
            <p className="mt-3 text-muted-foreground">3 kroky · průměr 15 minut</p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Registrace",
                time: "2 min",
                description: "Název restaurace, email, heslo. Žádná platební karta.",
              },
              {
                step: "2",
                title: "Vyplnění profilu",
                time: "10 min",
                description: "Logo, adresa, otevírací doba, menu. Nebo importujte z PDF.",
              },
              {
                step: "3",
                title: "Sdílení QR",
                time: "3 min",
                description: "Stáhněte QR kód, vytiskněte a dejte na stoly. Hotovo.",
              },
            ].map((item) => (
              <div key={item.step} className="relative rounded-2xl border bg-background p-6 transition-all hover:shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    {item.time}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <Badge variant="outline" className="mb-4">Časté dotazy</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">Na co se restaurace ptají</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group overflow-hidden rounded-xl border bg-background transition-all [&[open]]:shadow-md"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 font-medium">
                  <span>{f.q}</span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t px-5 pb-5 pt-4 text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary via-primary/95 to-primary/75 text-primary-foreground shadow-2xl shadow-primary/30">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,255,255,0.15),transparent)]" />
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <CardContent className="relative flex flex-col items-center gap-8 py-16 text-center sm:py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Crown className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
                  Za 2 minuty máte hotovo
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-primary-foreground/85 text-lg">
                  Registrace zdarma, bez platební karty. Vyzkoušejte Gastroo a rozhodněte se za pár dní.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/registrace">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="gap-2 h-14 px-10 text-base font-semibold shadow-xl"
                  >
                    Zaregistrovat zdarma
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/kontakt">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="gap-2 h-14 px-8 text-base text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
                  >
                    Chci telefonickou ukázku
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-sm text-primary-foreground/80">
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
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4" />
                  Data zůstávají vaše
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
