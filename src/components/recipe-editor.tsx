"use client";

// NOTE: dangerouslySetInnerHTML used only for admin-authored content (trusted source)

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { recipeCategories, difficulties } from "@/lib/recipe-types";
import { Save, Loader2, ArrowLeft, Plus, Trash2, ImageIcon, Eye, Bold, Italic, Heading2, ImagePlus, Clock, Users, X } from "lucide-react";

interface Ingredient { amount: string; unit: string; name: string; }
interface RecipeEditorProps { initialData?: { id: string; title: string; description: string; ingredients: Ingredient[]; instructions: string; coverImage: string | null; category: string; cuisine: string; difficulty: string; prepTime: number | null; cookTime: number | null; servings: number | null; tags: string[]; authorName: string; isPublished: boolean; }; }

export function RecipeEditor({ initialData }: RecipeEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialData?.ingredients || [{ amount: "", unit: "", name: "" }]);
  const [instructions, setInstructions] = useState(initialData?.instructions || "");
  const [coverImage, setCoverImage] = useState<string | null>(initialData?.coverImage || null);
  const [category, setCategory] = useState(initialData?.category || "hlavni-jidla");
  const [cuisine, setCuisine] = useState(initialData?.cuisine || "");
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || "stredni");
  const [prepTime, setPrepTime] = useState(initialData?.prepTime?.toString() || "");
  const [cookTime, setCookTime] = useState(initialData?.cookTime?.toString() || "");
  const [servings, setServings] = useState(initialData?.servings?.toString() || "4");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [authorName] = useState(initialData?.authorName || "Gastroo");
  const [isPublished, setIsPublished] = useState(initialData?.isPublished || false);
  const coverRef = useRef<HTMLInputElement>(null);
  const instrRef = useRef<HTMLTextAreaElement>(null);

  function addIngredient() { setIngredients([...ingredients, { amount: "", unit: "", name: "" }]); }
  function removeIngredient(i: number) { setIngredients(ingredients.filter((_, idx) => idx !== i)); }
  function updateIngredient(i: number, field: keyof Ingredient, v: string) { setIngredients(ingredients.map((ing, idx) => idx === i ? { ...ing, [field]: v } : ing)); }

  function insertMarkup(before: string, after: string = "") {
    const t = instrRef.current; if (!t) return;
    const s = t.selectionStart, e = t.selectionEnd, sel = instructions.substring(s, e);
    setInstructions(instructions.substring(0, s) + before + sel + after + instructions.substring(e));
  }

  async function uploadCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/admin/blog/upload", { method: "POST", body: fd });
    if (res.ok) { setCoverImage((await res.json()).url); toast.success("Nahrán"); } else toast.error("Chyba");
  }

  async function insertImage() {
    const input = document.createElement("input"); input.type = "file"; input.accept = "image/*";
    input.onchange = async (ev) => {
      const file = (ev.target as HTMLInputElement).files?.[0]; if (!file) return;
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/admin/blog/upload", { method: "POST", body: fd });
      if (res.ok) { insertMarkup(`<img src="${(await res.json()).url}" alt="" style="border-radius:12px;margin:16px 0;max-width:100%" />\n`); toast.success("Vložen"); }
    }; input.click();
  }

  async function handleSave() {
    if (!title.trim() || !instructions.trim()) { toast.error("Název a postup jsou povinné"); return; }
    setSaving(true);
    try {
      const body = { id: initialData?.id, title, description, ingredients: ingredients.filter((i) => i.name.trim()), instructions, coverImage, category, cuisine, difficulty, prepTime, cookTime, servings, tags, authorName, isPublished };
      const res = await fetch("/api/admin/recipes", { method: initialData ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) { toast.success(initialData ? "Aktualizován" : "Vytvořen"); router.push("/admin/kucharka"); } else toast.error("Chyba");
    } catch { toast.error("Chyba"); } finally { setSaving(false); }
  }

  function addTag() { const t = newTag.trim().toLowerCase(); if (t && !tags.includes(t)) { setTags([...tags, t]); setNewTag(""); } }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/admin/kucharka")} className="gap-2"><ArrowLeft className="h-4 w-4" />Zpět</Button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2"><Label htmlFor="pub-r" className="text-sm">Publikovat</Label><Switch id="pub-r" checked={isPublished} onCheckedChange={setIsPublished} /></div>
          <Button onClick={() => setPreview(!preview)} variant="outline" size="sm" className="gap-1.5"><Eye className="h-3.5 w-3.5" />{preview ? "Editor" : "Náhled"}</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Uložit</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Název receptu" className="h-14 text-2xl font-bold border-0 px-0 focus-visible:ring-0 shadow-none" />
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Krátký popis" className="text-muted-foreground border-0 px-0 focus-visible:ring-0 shadow-none" />

          {!preview ? (<>
            <Card><CardHeader><CardTitle className="text-base">Ingredience</CardTitle></CardHeader><CardContent className="space-y-2">
              {ingredients.map((ing, i) => (<div key={i} className="flex gap-2"><Input value={ing.amount} onChange={(e) => updateIngredient(i, "amount", e.target.value)} placeholder="Množ." className="w-20 h-9" /><Input value={ing.unit} onChange={(e) => updateIngredient(i, "unit", e.target.value)} placeholder="Jedn." className="w-20 h-9" /><Input value={ing.name} onChange={(e) => updateIngredient(i, "name", e.target.value)} placeholder="Ingredience" className="flex-1 h-9" />{ingredients.length > 1 && <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => removeIngredient(i)}><Trash2 className="h-3.5 w-3.5" /></Button>}</div>))}
              <Button variant="outline" size="sm" onClick={addIngredient} className="gap-1.5"><Plus className="h-3.5 w-3.5" />Přidat</Button>
            </CardContent></Card>

            <Card><CardHeader><CardTitle className="text-base">Postup přípravy</CardTitle></CardHeader><CardContent className="space-y-2">
              <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => insertMarkup("<strong>","</strong>")}><Bold className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => insertMarkup("<em>","</em>")}><Italic className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => insertMarkup("\n<h3>","</h3>\n")}><Heading2 className="h-3.5 w-3.5" /></Button>
                <div className="h-5 w-px bg-border mx-1" />
                <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={insertImage}><ImagePlus className="h-3.5 w-3.5" />Obrázek</Button>
              </div>
              <Textarea ref={instrRef} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Postup (HTML)..." className="min-h-[300px] font-mono text-sm" />
            </CardContent></Card>
          </>) : (
            <Card><CardContent className="pt-6">
              {coverImage && <img src={coverImage} alt="" className="w-full h-56 object-cover rounded-xl mb-6" />}
              <h1 className="text-3xl font-bold mb-2">{title}</h1>
              {description && <p className="text-muted-foreground mb-4">{description}</p>}
              <div className="flex gap-4 mb-6 text-sm text-muted-foreground">
                {prepTime && <span className="flex items-center gap-1"><Clock className="h-4 w-4" />Příprava: {prepTime} min</span>}
                {cookTime && <span className="flex items-center gap-1"><Clock className="h-4 w-4" />Vaření: {cookTime} min</span>}
                {servings && <span className="flex items-center gap-1"><Users className="h-4 w-4" />{servings} porcí</span>}
              </div>
              <h2 className="text-lg font-bold mb-3">Ingredience</h2>
              <ul className="mb-6 space-y-1 list-disc pl-5">{ingredients.filter((i) => i.name).map((i, idx) => <li key={idx} className="text-sm"><strong>{i.amount} {i.unit}</strong> {i.name}</li>)}</ul>
              <h2 className="text-lg font-bold mb-3">Postup</h2>
              <div className="[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-3 [&_p]:leading-relaxed [&_img]:rounded-xl [&_img]:my-4" dangerouslySetInnerHTML={{ __html: instructions }} />
            </CardContent></Card>
          )}
        </div>

        <div className="space-y-4">
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm">Obrázek</CardTitle></CardHeader><CardContent>
            <div className="flex h-28 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed hover:border-primary/50" onClick={() => coverRef.current?.click()}>
              {coverImage ? <img src={coverImage} alt="" className="h-full w-full object-cover" /> : <div className="text-center text-muted-foreground"><ImageIcon className="mx-auto h-6 w-6 mb-1" /><p className="text-xs">Nahrát</p></div>}
            </div>
            {coverImage && <Button variant="ghost" size="sm" className="mt-2 w-full text-xs" onClick={() => setCoverImage(null)}>Odebrat</Button>}
            <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={uploadCover} />
          </CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm">Kategorie</CardTitle></CardHeader><CardContent>
            <Select value={category} onValueChange={(v) => v && setCategory(v)}><SelectTrigger className="h-8"><SelectValue /></SelectTrigger><SelectContent>{recipeCategories.map((c) => <SelectItem key={c.value} value={c.value}>{c.emoji} {c.label}</SelectItem>)}</SelectContent></Select>
          </CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm">Obtížnost</CardTitle></CardHeader><CardContent>
            <div className="flex gap-2">{difficulties.map((d) => <button key={d.value} onClick={() => setDifficulty(d.value)} className={`flex-1 rounded-lg border-2 py-2 text-center text-xs font-medium transition-all ${difficulty === d.value ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>{d.emoji}<br/>{d.label}</button>)}</div>
          </CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm">Časy a porce</CardTitle></CardHeader><CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2"><div><Label className="text-xs">Příprava</Label><Input value={prepTime} onChange={(e) => setPrepTime(e.target.value)} type="number" className="h-8" placeholder="min" /></div><div><Label className="text-xs">Vaření</Label><Input value={cookTime} onChange={(e) => setCookTime(e.target.value)} type="number" className="h-8" placeholder="min" /></div></div>
            <div><Label className="text-xs">Porce</Label><Input value={servings} onChange={(e) => setServings(e.target.value)} type="number" className="h-8" /></div>
          </CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm">Kuchyně</CardTitle></CardHeader><CardContent><Input value={cuisine} onChange={(e) => setCuisine(e.target.value)} placeholder="Česká, Italská..." className="h-8" /></CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm">Štítky</CardTitle></CardHeader><CardContent>
            <div className="flex gap-2 mb-2"><Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Štítek" className="h-8" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); }}} /><Button variant="outline" size="sm" className="h-8" onClick={addTag}><Plus className="h-3 w-3" /></Button></div>
            {tags.length > 0 && <div className="flex flex-wrap gap-1.5">{tags.map((t) => <Badge key={t} variant="secondary" className="gap-1 pr-1">{t}<button onClick={() => setTags(tags.filter((x) => x !== t))} className="rounded-full p-0.5 hover:bg-destructive/20"><X className="h-2.5 w-2.5" /></button></Badge>)}</div>}
          </CardContent></Card>
        </div>
      </div>
    </div>
  );
}
