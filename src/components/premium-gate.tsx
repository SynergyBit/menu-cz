"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PremiumGateProps {
  feature: string;
  requiredPlan: "standard" | "premium";
  currentPlan: string;
  children: React.ReactNode;
}

export function PremiumGate({
  feature,
  requiredPlan,
  currentPlan,
  children,
}: PremiumGateProps) {
  const planOrder = { free: 0, standard: 1, premium: 2 };
  const hasAccess =
    (planOrder[currentPlan as keyof typeof planOrder] ?? 0) >=
    (planOrder[requiredPlan] ?? 0);

  if (hasAccess) return <>{children}</>;

  const planLabel = requiredPlan === "standard" ? "Standard" : "Premium";

  return (
    <Card className="relative overflow-hidden border-dashed border-border/50">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-10" />
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <div className="text-center space-y-3 p-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{feature}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tato funkce je dostupná od plánu{" "}
              <Badge variant="outline" className="gap-1">
                <Crown className="h-3 w-3" />
                {planLabel}
              </Badge>
            </p>
          </div>
          <Link href="/cenik">
            <Button size="sm" className="gap-2">
              Upgradovat
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
      {/* Blurred preview of content */}
      <div className="pointer-events-none select-none opacity-30">
        {children}
      </div>
    </Card>
  );
}

export function PlanBadge({ plan }: { plan: string }) {
  if (plan === "premium") {
    return (
      <Badge className="gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
        <Crown className="h-3 w-3" />
        Premium
      </Badge>
    );
  }
  if (plan === "standard") {
    return (
      <Badge className="gap-1 bg-primary text-primary-foreground">
        <Crown className="h-3 w-3" />
        Standard
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1">
      Zdarma
    </Badge>
  );
}
