import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  QrCode,
  Smartphone,
  Zap,
  TrendingUp,
  Shield,
  Palette,
  Clock,
  Leaf,
  Globe,
  ArrowRight,
  Check,
  Star,
  DollarSign,
  Printer,
  Download,
  Users,
  ChefHat,
  Coffee,
  Hotel,
} from "lucide-react";

export const metadata: Metadata = {
  title: "QR Menu pro restaurace",
  description: "QR kódy pro restaurace — hosté naskenují a okamžitě vidí menu v mobilu. Bez aplikace, bez papíru, vždy aktuální.",
};

const benefits = [
  {
    icon: Zap,
    title: "Okamžitý přístup k menu",
    description: "Host naskenuje QR kód mobilem a za 2 sekundy má celý jídelní lístek v prohlížeči. Žádná aplikace ke stažení, žádné čekání.",
  },
  {
    icon: Clock,
    title: "Vždy aktuální menu",
    description: "Změníte cenu nebo přidáte jídlo? Změna se projeví okamžitě. Žádné přetisky, žádné staré papírové menu na stole.",
  },
  {
    icon: DollarSign,
    title: "Úspora nákladů na tisk",
    description: "Konec s tiskovými náklady při každé změně menu. QR kód vytisknete jednou a slouží navždy — obsah aktualizujete online.",
  },
  {
    icon: Leaf,
    title: "Ekologické řešení",
    description: "Méně papíru, méně plastových obalů na menu. Digitální menu je moderní a šetrné k životnímu prostředí.",
  },
  {
    icon: Shield,
    title: "Hygiena bez kontaktu",
    description: "Hosté nepotřebují sdílený jídelní lístek. Každý si prohlédne menu na svém vlastním telefonu — čistě a bezpečně.",
  },
  {
    icon: Globe,
    title: "Dostupné odkudkoliv",
    description: "Menu není jen na stole. Hosté si ho prohlédnou z domu, z ulice, nebo ze sociálních sítí. Jeden odkaz pro všechny.",
  },
  {
    icon: Globe,
    title: "Překlad do 20 jazyků",
    description: "Turista naskenuje QR kód a jedním klikem si přeloží celé menu do svého jazyka. Angličtina, němčina, čínština a dalších 17.",
  },
];

const features = [
  { text: "Kompletní jídelní lístek s cenami a popisem" },
  { text: "Denní menu — automaticky se aktualizuje každý den" },
  { text: "Alergeny s vizuální legendou (1-14)" },
  { text: "Otevírací doba a kontakt restaurace" },
  { text: "Fotogalerie jídel a interiéru" },
  { text: "Recenze od hostů" },
  { text: "Tlačítko zavolat a navigovat" },
  { text: "Funguje na jakémkoliv telefonu s fotoaparátem" },
  { text: "Žádná instalace aplikace" },
  { text: "Načtení do 2 sekund" },
  { text: "Překlad menu do 20 jazyků jedním klikem" },
];

const designFeatures = [
  { icon: Palette, title: "Vlastní barvy", desc: "8 přednastavených schémat + color picker pro vlastní kombinaci" },
  { icon: Printer, title: "Tisknutelné rámečky", desc: "5 stylů s textem: Naskenujte menu, Objednejte si, Denní menu, vlastní text" },
  { icon: Download, title: "PNG a SVG formáty", desc: "PNG s rámečkem pro stoly, SVG vektor pro velký tisk (bannery, plakáty)" },
  { icon: QrCode, title: "4 velikosti", desc: "256px až 1024px — od vizitek po plakáty A2" },
];

const useCases = [
  { icon: ChefHat, title: "Na stolech", desc: "Kartička nebo stojánek s QR kódem na každém stole. Host naskenuje a objedná." },
  { icon: QrCode, title: "Na vstupních dveřích", desc: "Kolemjdoucí naskenuje a vidí menu ještě před vstupem. Rozhodne se a přijde." },
  { icon: Printer, title: "Na papírových menu", desc: "Přidejte QR kód na papírové menu jako odkaz na digitální verzi s alergeny." },
  { icon: Globe, title: "Na sociálních sítích", desc: "Sdílejte QR kód na Facebooku nebo Instagramu — fanoušci naskenují a uvidí menu." },
  { icon: Star, title: "Na vizitkách", desc: "QR kód na vizitce restaurace — kontakt, menu a rezervace na jednom místě." },
  { icon: Coffee, title: "Na obalech s sebou", desc: "QR kód na krabičkách a taškách — zákazník si příště objedná online." },
];

const steps = [
  { step: "1", title: "Zaregistrujte restauraci", desc: "2 minuty, zdarma. Vyplníte název a kontakt." },
  { step: "2", title: "Přidejte jídelní lístek", desc: "Kategorie, jídla, ceny, alergeny. Jednoduchý formulář." },
  { step: "3", title: "Stáhněte QR kód", desc: "Vyberte barvu, rámeček a velikost. Stáhněte PNG nebo SVG." },
  { step: "4", title: "Vytiskněte a dejte na stoly", desc: "Hotovo. Hosté skenují a vidí vaše menu v mobilu." },
];

export default function QRMenuPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-warm/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,oklch(0.55_0.18_30/0.1),transparent)]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-6 px-4 py-1.5">
              <QrCode className="mr-1.5 h-3.5 w-3.5" />
              QR Menu pro restaurace
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Menu v mobilu hosta
              <br />
              <span className="bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">
                za 2 sekundy
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
              Host naskenuje QR kód na stole a okamžitě vidí váš kompletní jídelní lístek,
              denní menu a kontakt. Bez aplikace, bez čekání, vždy aktuální.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/registrace">
                <Button size="lg" className="gap-2 h-14 px-8 text-base shadow-lg shadow-primary/20">
                  Vytvořit QR menu zdarma
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/cenik">
                <Button size="lg" variant="outline" className="gap-2 h-14 px-8 text-base">
                  Zobrazit ceník
                </Button>
              </Link>
            </div>

            {/* Trust */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-600" />Zdarma pro start</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-600" />Bez aplikace</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-600" />Funguje na všech telefonech</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works - visual */}
      <section className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Jak QR menu funguje?</h2>
          </div>
          <div className="mx-auto max-w-3xl">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold shadow-lg shadow-primary/20">1</div>
                <div className="text-4xl mb-2">📱</div>
                <p className="text-sm font-semibold">Host otevře fotoaparát</p>
                <p className="mt-1 text-xs text-muted-foreground">Žádná aplikace, stačí kamera</p>
              </div>
              <div>
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold shadow-lg shadow-primary/20">2</div>
                <div className="text-4xl mb-2">📷</div>
                <p className="text-sm font-semibold">Naskenuje QR kód</p>
                <p className="mt-1 text-xs text-muted-foreground">Na stole, dveřích nebo vizitce</p>
              </div>
              <div>
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold shadow-lg shadow-primary/20">3</div>
                <div className="text-4xl mb-2">🍽️</div>
                <p className="text-sm font-semibold">Vidí celé menu</p>
                <p className="mt-1 text-xs text-muted-foreground">Jídla, ceny, alergeny, denní menu</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-4">Výhody</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">Proč QR menu?</h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              6 důvodů, proč restaurace přecházejí na digitální menu
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.title} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <b.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{b.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What guests see */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge variant="outline" className="mb-4">Co host uvidí</Badge>
              <h2 className="text-3xl font-bold sm:text-4xl">Kompletní menu v dlani</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Po naskenování QR kódu se hostovi otevře mobilní stránka vaší restaurace
                s veškerými informacemi, které potřebuje.
              </p>
              <ul className="mt-6 space-y-3">
                {features.map((f) => (
                  <li key={f.text} className="flex items-center gap-3">
                    <Check className="h-4 w-4 shrink-0 text-green-600" />
                    <span className="text-sm">{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mock phone */}
            <div className="flex justify-center">
              <div className="relative w-64">
                <div className="rounded-[2.5rem] border-[6px] border-foreground/10 bg-card p-4 shadow-2xl">
                  <div className="mx-auto mb-3 h-5 w-20 rounded-full bg-foreground/10" />
                  <div className="space-y-3 rounded-2xl bg-muted/50 p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/20" />
                      <div>
                        <div className="h-3 w-24 rounded bg-foreground/20" />
                        <div className="mt-1 h-2 w-16 rounded bg-foreground/10" />
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="h-2.5 w-20 rounded bg-primary/30 text-[8px]" />
                      {["Svíčková na smetaně", "Kuřecí řízek", "Hovězí guláš"].map((j) => (
                        <div key={j} className="flex justify-between">
                          <span className="text-[10px] text-muted-foreground">{j}</span>
                          <span className="text-[10px] font-bold text-primary">Kč</span>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="flex gap-2">
                      <div className="flex-1 rounded-lg bg-green-500/20 py-1.5 text-center text-[9px] font-bold text-green-700">Zavolat</div>
                      <div className="flex-1 rounded-lg bg-primary/20 py-1.5 text-center text-[9px] font-bold text-primary">Navigovat</div>
                    </div>
                  </div>
                  <div className="mt-3 text-center text-[8px] text-muted-foreground">Powered by Gastroo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QR Design */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-4">
              <Palette className="mr-1.5 h-3 w-3" />
              Premium
            </Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">QR kód ve vašich barvách</h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Přizpůsobte QR kód firemnímu stylu vaší restaurace
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {designFeatures.map((f) => (
              <Card key={f.title} className="group transition-all hover:shadow-lg hover:-translate-y-1">
                <CardContent className="pt-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Kde QR kód umístit?</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((u) => (
              <Card key={u.title} className="transition-all hover:shadow-md">
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <u.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{u.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{u.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For whom */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Pro koho je QR menu?</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: ChefHat, title: "Restaurace a bistra", desc: "Jídelní lístek, denní menu, alergeny — vše digitálně" },
              { icon: Coffee, title: "Kavárny a bary", desc: "Nápojový lístek, koktejly, sezónní nabídky" },
              { icon: Hotel, title: "Hotely a penziony", desc: "Room service, snídaňový buffet, restaurace" },
            ].map((t) => (
              <Card key={t.title} className="text-center transition-all hover:shadow-lg hover:-translate-y-1">
                <CardContent className="pt-8 pb-6">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <t.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold">{t.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Jak začít?</h2>
            <p className="mt-3 text-muted-foreground">4 kroky a máte QR menu na stolech</p>
          </div>
          <div className="mx-auto max-w-2xl space-y-6">
            {steps.map((s) => (
              <div key={s.step} className="flex gap-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-lg shadow-primary/20">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-2xl shadow-primary/20">
            <CardContent className="flex flex-col items-center gap-6 py-14 text-center sm:py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <QrCode className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold sm:text-4xl">Začněte ještě dnes</h2>
                <p className="mx-auto mt-4 max-w-lg text-primary-foreground/80 text-lg">
                  Vytvořte si QR menu zdarma. Registrace zabere 2 minuty.
                  Žádná platební karta, žádný závazek.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/registrace">
                  <Button size="lg" variant="secondary" className="gap-2 h-14 px-8 text-base shadow-lg">
                    Zaregistrovat zdarma
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pro-restaurace">
                  <Button size="lg" variant="ghost" className="gap-2 h-14 px-8 text-base text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
                    Více o Gastroo
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-sm text-primary-foreground/70">
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4" />Bez platební karty</span>
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4" />Zrušení kdykoliv</span>
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4" />Český support</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
