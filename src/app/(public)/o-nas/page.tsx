import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Building,
  Shield,
  Globe,
  Code2,
  BarChart3,
  MapPin,
  ArrowRight,
  ExternalLink,
  UtensilsCrossed,
  CreditCard,
  Lock,
  Monitor,
  ChefHat,
} from "lucide-react";

export const metadata: Metadata = {
  title: "O nás",
  description: "Gastroo je projekt společnosti SynergyBit s.r.o. — kybernetická bezpečnost, vývoj softwaru a webových aplikací na míru.",
};

const locations = [
  { city: "Valašské Meziříčí", type: "Hlavní kancelář" },
  { city: "Zubří", type: "Pobočka" },
  { city: "Olomouc", type: "Pobočka" },
  { city: "Ostrava", type: "Sídlo společnosti" },
];

const expertise = [
  { icon: Shield, title: "Kybernetická bezpečnost", desc: "Penetrační testy, bezpečnostní audity, ochrana dat a sítí" },
  { icon: Lock, title: "Informační bezpečnost", desc: "NIS2 compliance, ISMS, analýza rizik, bezpečnostní politiky" },
  { icon: Code2, title: "Vývoj softwaru na míru", desc: "Webové a mobilní aplikace, API, databáze, cloud řešení" },
  { icon: Globe, title: "Tvorba webových stránek", desc: "Moderní weby, e-shopy, landing pages, SEO optimalizace" },
  { icon: BarChart3, title: "Datová analytika", desc: "Business intelligence, dashboardy, reporting, automatizace" },
];

const gastroServices = [
  { icon: Globe, title: "Webové stránky pro restaurace", desc: "Moderní web s online menu, rezervacemi a galerií" },
  { icon: CreditCard, title: "Pokladny a platební brány", desc: "POS systémy, online platby, integrace platebních terminálů" },
  { icon: Monitor, title: "EET a pokladní systémy", desc: "Elektronická evidence tržeb, fiskální řešení" },
  { icon: Shield, title: "Kybernetická bezpečnost", desc: "Zabezpečení restauračních systémů, WiFi sítí a dat zákazníků" },
  { icon: Lock, title: "Informační bezpečnost", desc: "GDPR compliance, ochrana osobních údajů hostů, bezpečnostní audit" },
];

const projects = [
  {
    name: "SynergyBit.cz",
    url: "https://synergybit.cz",
    desc: "Naše společnost — kybernetická bezpečnost a vývoj softwaru",
    badge: "Společnost",
    color: "bg-primary/10 text-primary",
  },
  {
    name: "SynergyBit.eu",
    url: "https://synergybit.eu",
    desc: "Anglická prezentace společnosti pro mezinárodní klienty",
    badge: "EN",
    color: "bg-blue-500/10 text-blue-700",
  },
  {
    name: "Gastroo.cz",
    url: "https://gastroo.cz",
    desc: "Vyhledávač restaurací s online menu, QR kódy a rezervacemi",
    badge: "Gastro",
    color: "bg-orange-500/10 text-orange-700",
  },
  {
    name: "BezLepko.cz",
    url: "https://bezlepko.cz",
    desc: "Aplikace pro sken potravin, bezlepková komunita a průvodce",
    badge: "Zdraví",
    color: "bg-green-500/10 text-green-700",
  },
  {
    name: "IVFKliniky.cz",
    url: "https://ivfkliniky.cz",
    desc: "Srovnávač IVF klinik, průvodce léčbou neplodnosti, komunita k mateřství",
    badge: "Zdraví",
    color: "bg-pink-500/10 text-pink-700",
  },
  {
    name: "Promovize.cz",
    url: "https://promovize.cz",
    desc: "Profesionální tvorba webových stránek a e-shopů",
    badge: "Weby",
    color: "bg-purple-500/10 text-purple-700",
  },
  {
    name: "NIS2Expert.cz",
    url: "https://nis2expert.cz",
    desc: "NIS2 compliance, implementace směrnice, bezpečnostní poradenství",
    badge: "Bezpečnost",
    color: "bg-red-500/10 text-red-700",
  },
  {
    name: "SexyZone.cz",
    url: "https://sexyzone.cz",
    desc: "Seznamka a erotická komunitní platforma",
    badge: "Komunita",
    color: "bg-rose-500/10 text-rose-700",
  },
];

export default function ONasPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* Hero */}
      <div className="mb-12 text-center">
        <Badge variant="outline" className="mb-4">O nás</Badge>
        <h1 className="text-3xl font-bold sm:text-4xl">
          Za Gastroo stojí <span className="text-primary">SynergyBit</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground leading-relaxed">
          Jsme česká technologická společnost specializující se na kybernetickou bezpečnost,
          vývoj softwaru a webových aplikací na míru.
        </p>
      </div>

      {/* Company info */}
      <Card className="mb-12">
        <CardContent className="flex flex-col items-center gap-6 py-10 text-center sm:flex-row sm:text-left sm:gap-8">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <Building className="h-10 w-10 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">SynergyBit s.r.o.</h2>
            <p className="mt-1 text-muted-foreground">Kybernetická bezpečnost | Vývoj softwaru | Datová analytika | Webové aplikace</p>
            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>IČO: 23229853</span>
              <span>KS Ostrava (C 99298/KSOS)</span>
              <span>Neplátce DPH</span>
            </div>
          </div>
          <a href="https://synergybit.cz" target="_blank" rel="noopener noreferrer" className="shrink-0">
            <Button variant="outline" className="gap-2">
              synergybit.cz
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </CardContent>
      </Card>

      {/* Our expertise */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Naše odbornosti</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {expertise.map((e) => (
            <Card key={e.title} className="group transition-all hover:shadow-lg hover:-translate-y-0.5">
              <CardContent className="pt-6">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                  <e.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-1">{e.title}</h3>
                <p className="text-sm text-muted-foreground">{e.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Gastro services */}
      <div className="mb-12">
        <div className="text-center mb-6">
          <Badge variant="outline" className="mb-3">
            <ChefHat className="mr-1.5 h-3 w-3" />
            Pro gastro
          </Badge>
          <h2 className="text-2xl font-bold">Služby pro gastronomii</h2>
          <p className="mt-2 text-muted-foreground">Kromě Gastroo nabízíme restauracím a hotelům další IT služby</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gastroServices.map((s) => (
            <Card key={s.title} className="transition-all hover:shadow-md hover:border-primary/20">
              <CardContent className="flex items-start gap-4 pt-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{s.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Locations */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Kde nás najdete</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {locations.map((l) => (
            <Card key={l.city} className="text-center transition-all hover:shadow-md">
              <CardContent className="pt-6">
                <MapPin className="mx-auto h-6 w-6 text-primary mb-2" />
                <h3 className="font-semibold">{l.city}</h3>
                <p className="text-xs text-muted-foreground">{l.type}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Our projects */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Naše projekty</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((p) => (
            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer">
              <Card className="group h-full transition-all hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5">
                <CardContent className="flex items-center gap-4 pt-5 pb-5">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${p.color}`}>
                    <Globe className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{p.name}</h3>
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0">{p.badge}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{p.desc}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Card className="border-primary/10 bg-gradient-to-br from-primary/5 via-card to-warm/5">
        <CardContent className="flex flex-col items-center gap-5 py-10 text-center">
          <UtensilsCrossed className="h-10 w-10 text-primary" />
          <div>
            <h2 className="text-xl font-bold">Potřebujete IT řešení pro vaši restauraci?</h2>
            <p className="mt-2 text-muted-foreground">
              Webové stránky, pokladny, bezpečnost — rádi vám pomůžeme.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/kontakt">
              <Button className="gap-2">
                Kontaktujte nás
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="https://synergybit.cz" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">
                synergybit.cz
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
