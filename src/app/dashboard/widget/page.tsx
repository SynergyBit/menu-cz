"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PremiumGate, PlanBadge } from "@/components/premium-gate";
import { toast } from "sonner";
import { Code2, Copy, Check, Eye, ExternalLink, Monitor } from "lucide-react";

export default function WidgetPage() {
  const [restaurant, setRestaurant] = useState<{ slug: string; name: string; plan: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Config
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [width, setWidth] = useState("100%");
  const [height, setHeight] = useState("500");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => { if (data.restaurant) setRestaurant(data.restaurant); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-96" /></div>;

  const plan = restaurant?.plan || "free";
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://gastroo.cz";
  const embedUrl = `${baseUrl}/embed/${restaurant?.slug}?theme=${theme}`;

  const iframeCode = `<iframe src="${embedUrl}" width="${width}" height="${height}" style="border:1px solid #e5e5e5;border-radius:12px;overflow:hidden;" frameborder="0" loading="lazy" title="Menu ${restaurant?.name || ""}"></iframe>`;

  const scriptCode = `<!-- Gastroo Widget: ${restaurant?.name || ""} -->
<div id="gastroo-widget"></div>
<script>
(function() {
  var d = document.getElementById('gastroo-widget');
  var f = document.createElement('iframe');
  f.src = '${embedUrl}';
  f.width = '${width}';
  f.height = '${height}';
  f.style.border = '1px solid #e5e5e5';
  f.style.borderRadius = '12px';
  f.style.overflow = 'hidden';
  f.frameBorder = '0';
  f.loading = 'lazy';
  f.title = 'Menu ${restaurant?.name || ""}';
  d.appendChild(f);
})();
</script>`;

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Kód zkopírován");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Widget pro web</h1>
          <p className="text-sm text-muted-foreground">Vložte menu na vlastní webové stránky</p>
        </div>
        <PlanBadge plan={plan} />
      </div>

      <PremiumGate feature="Widget embed" requiredPlan="premium" currentPlan={plan}>
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Preview */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    Náhled widgetu
                  </CardTitle>
                  <a href={embedUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                      <ExternalLink className="h-3 w-3" />
                      Otevřít
                    </Button>
                  </a>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border overflow-hidden" style={{ height: `${Math.min(parseInt(height), 600)}px` }}>
                  <iframe
                    src={embedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: "none" }}
                    title="Widget preview"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Embed codes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-primary" />
                  Kód pro vložení
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs font-semibold">Iframe (jednoduchý)</Label>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7" onClick={() => copyCode(iframeCode)}>
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      Kopírovat
                    </Button>
                  </div>
                  <pre className="rounded-lg bg-muted p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
                    {iframeCode}
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs font-semibold">JavaScript (pokročilý)</Label>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7" onClick={() => copyCode(scriptCode)}>
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      Kopírovat
                    </Button>
                  </div>
                  <pre className="rounded-lg bg-muted p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
                    {scriptCode}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Vzhled</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Motiv</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setTheme("light")}
                      className={`flex items-center justify-center gap-2 rounded-lg border-2 py-2.5 text-xs font-medium transition-all ${
                        theme === "light" ? "border-primary bg-primary/10 text-primary" : "border-border"
                      }`}
                    >
                      <div className="h-4 w-4 rounded-full bg-white border" />
                      Světlý
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={`flex items-center justify-center gap-2 rounded-lg border-2 py-2.5 text-xs font-medium transition-all ${
                        theme === "dark" ? "border-primary bg-primary/10 text-primary" : "border-border"
                      }`}
                    >
                      <div className="h-4 w-4 rounded-full bg-gray-900 border" />
                      Tmavý
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Rozměry</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Šířka</Label>
                  <Select value={width} onValueChange={(v) => v && setWidth(v)}>
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100%">100% (celá šířka)</SelectItem>
                      <SelectItem value="400">400px</SelectItem>
                      <SelectItem value="500">500px</SelectItem>
                      <SelectItem value="600">600px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Výška</Label>
                  <Select value={height} onValueChange={(v) => v && setHeight(v)}>
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="400">400px</SelectItem>
                      <SelectItem value="500">500px</SelectItem>
                      <SelectItem value="600">600px</SelectItem>
                      <SelectItem value="700">700px</SelectItem>
                      <SelectItem value="800">800px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Jak použít</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <p><strong>1.</strong> Nastavte vzhled a rozměry</p>
                <p><strong>2.</strong> Zkopírujte kód (iframe nebo JS)</p>
                <p><strong>3.</strong> Vložte na svůj web do HTML stránky</p>
                <p className="pt-2">Widget zobrazuje denní menu a jídelní lístek v reálném čase. Když změníte menu v Gastroo, změní se i na vašem webu.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </PremiumGate>
    </div>
  );
}
