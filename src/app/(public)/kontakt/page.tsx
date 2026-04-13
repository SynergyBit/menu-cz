import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Mail, Phone, Building, Globe } from "lucide-react";

export const metadata: Metadata = { title: "Kontakt", description: "Kontaktujte tým Gastroo — SynergyBit s.r.o., Ostrava." };

export default function KontaktPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold mb-2">Kontakt</h1>
      <p className="text-muted-foreground mb-8">Máte dotaz, nápad nebo potřebujete pomoc? Ozvěte se nám.</p>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <Building className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold">SynergyBit s.r.o.</p>
                <p className="text-sm text-muted-foreground">IČO: 23229853</p>
                <p className="text-xs text-muted-foreground">Krajský soud v Ostravě (C 99298/KSOS)</p>
                <p className="text-xs text-muted-foreground">Nejsme plátci DPH</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm">Čujkovova 1714/21</p>
                <p className="text-sm">700 30, Ostrava</p>
                <p className="text-sm text-muted-foreground">Česká republika</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <a href="mailto:petr@synergybit.cz" className="text-sm text-primary hover:underline">petr@synergybit.cz</a>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary" />
              <a href="tel:+420603796010" className="text-sm text-primary hover:underline">+420 603 796 010</a>
            </div>

            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <a href="https://gastroo.cz" className="text-sm text-primary hover:underline">gastroo.cz</a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="font-semibold">Jak vám můžeme pomoci?</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-lg border p-3">
                <p className="font-medium text-foreground">Jsem restaurace</p>
                <p className="mt-1">Potřebujete pomoc s registrací, nastavením profilu nebo placeným plánem? Napište nám na email.</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="font-medium text-foreground">Jsem host</p>
                <p className="mt-1">Chcete nahlásit problém s restaurací, recenzí nebo svým účtem? Kontaktujte nás.</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="font-medium text-foreground">Spolupráce</p>
                <p className="mt-1">Máte zájem o partnerství nebo integraci? Rádi si promluvíme.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
