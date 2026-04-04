"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { plans, features } from "@/lib/plans";
import {
  Check,
  X,
  Crown,
  ArrowRight,
  UtensilsCrossed,
} from "lucide-react";

export default function CenikPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      {/* Header */}
      <div className="mb-12 text-center">
        <Badge variant="outline" className="mb-4">Ceník</Badge>
        <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
          Vyberte si plán pro vaši restauraci
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-lg">
          Začněte zdarma a upgradujte kdykoliv. Žádný závazek, zrušte kdykoliv.
        </p>

        {/* Yearly toggle */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <Label htmlFor="yearly" className={!yearly ? "font-semibold" : "text-muted-foreground"}>
            Měsíčně
          </Label>
          <Switch id="yearly" checked={yearly} onCheckedChange={setYearly} />
          <Label htmlFor="yearly" className={yearly ? "font-semibold" : "text-muted-foreground"}>
            Ročně
          </Label>
          {yearly && (
            <Badge className="bg-green-500/10 text-green-700 border-green-500/20 ml-1">
              Ušetříte 2 měsíce
            </Badge>
          )}
        </div>
      </div>

      {/* Plan cards */}
      <div className="mb-16 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative overflow-hidden transition-all hover:shadow-lg ${
              plan.highlighted
                ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]"
                : "border-border/50"
            }`}
          >
            {plan.badge && (
              <div className="absolute right-4 top-4">
                <Badge className="bg-primary text-primary-foreground">
                  {plan.badge}
                </Badge>
              </div>
            )}
            {plan.highlighted && (
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary/60" />
            )}

            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                {plan.id !== "free" && (
                  <Crown className={`h-5 w-5 ${plan.id === "premium" ? "text-yellow-500" : "text-primary"}`} />
                )}
                <CardTitle className="text-xl">{plan.name}</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    {yearly
                      ? plan.yearlyPrice === 0
                        ? "0"
                        : Math.round(plan.yearlyPrice / 12)
                      : plan.price}
                  </span>
                  <span className="text-muted-foreground">
                    {plan.price === 0 ? "" : "Kč/měs"}
                  </span>
                </div>
                {yearly && plan.yearlyPrice > 0 && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.yearlyPrice} Kč/rok (ušetříte{" "}
                    {plan.price * 12 - plan.yearlyPrice} Kč)
                  </p>
                )}
              </div>

              <Link href={plan.id === "free" ? "/registrace" : "/registrace"}>
                <Button
                  className="w-full gap-2"
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  {plan.id === "free" ? "Začít zdarma" : "Vybrat plán"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <div className="space-y-3 pt-2">
                {features.map((feature) => {
                  const value = feature[plan.id];
                  const available = value === true || (typeof value === "string" && value !== "");
                  return (
                    <div key={feature.key} className="flex items-start gap-2.5">
                      {available ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      ) : (
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                      )}
                      <span
                        className={`text-sm ${
                          available ? "" : "text-muted-foreground/60"
                        }`}
                      >
                        {feature.label}
                        {typeof value === "string" && value !== "" && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({value})
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ mini */}
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold">Časté dotazy</h2>
        <div className="mt-8 space-y-6 text-left">
          {[
            {
              q: "Mohu kdykoliv změnit plán?",
              a: "Ano, plán můžete upgradovat nebo downgradujte kdykoliv. Změna se projeví okamžitě.",
            },
            {
              q: "Je potřeba platební karta pro free plán?",
              a: "Ne, free plán je zcela zdarma bez jakýchkoliv závazků.",
            },
            {
              q: "Jak funguje QR kód?",
              a: "Zákazník naskenuje QR kód mobilem a okamžitě se mu zobrazí vaše menu v prohlížeči. Žádná aplikace není potřeba.",
            },
            {
              q: "Mohu si přizpůsobit vizitku?",
              a: "Ano, v placených plánech si můžete nastavit barvy, přidat logo, fotky, sociální sítě a speciality.",
            },
          ].map((faq) => (
            <div key={faq.q} className="rounded-lg border p-4">
              <h3 className="font-semibold">{faq.q}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
