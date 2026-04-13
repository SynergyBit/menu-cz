"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Save,
  Loader2,
  ImagePlus,
  Eye,
  ArrowLeft,
  X,
  Plus,
  Bold,
  Italic,
  Heading2,
  List,
  Link2,
  ImageIcon,
} from "lucide-react";

const categories = [
  { value: "tipy", label: "Tipy" },
  { value: "recepty", label: "Recepty" },
  { value: "rozhovory", label: "Rozhovory" },
  { value: "novinky", label: "Novinky" },
  { value: "pruvodce", label: "Průvodce" },
];

interface BlogEditorProps {
  initialData?: {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    coverImage: string | null;
    category: string;
    tags: string[];
    authorName: string;
    isPublished: boolean;
  };
}

export function BlogEditor({ initialData }: BlogEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(initialData?.title || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [coverImage, setCoverImage] = useState<string | null>(initialData?.coverImage || null);
  const [category, setCategory] = useState(initialData?.category || "tipy");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [authorName, setAuthorName] = useState(initialData?.authorName || "Gastroo");
  const [isPublished, setIsPublished] = useState(initialData?.isPublished || false);
  const [preview, setPreview] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  function insertMarkup(before: string, after: string = "") {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const newContent = content.substring(0, start) + before + selected + after + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  }

  async function uploadImage() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/blog/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        insertMarkup(`<img src="${data.url}" alt="${file.name}" style="border-radius:12px;margin:16px 0;max-width:100%" />\n`);
        toast.success("Obrázek vložen");
      } else {
        toast.error("Chyba při nahrávání");
      }
    };
    input.click();
  }

  async function uploadCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/blog/upload", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      setCoverImage(data.url);
      toast.success("Cover nahrán");
    } else {
      toast.error("Chyba");
    }
  }

  function addTag() {
    const t = newTag.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setNewTag("");
    }
  }

  async function handleSave() {
    if (!title.trim() || !content.trim()) {
      toast.error("Název a obsah jsou povinné");
      return;
    }
    setSaving(true);
    try {
      const body = { id: initialData?.id, title, excerpt, content, coverImage, category, tags, authorName, isPublished };
      const res = await fetch("/api/admin/blog", {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(initialData ? "Článek aktualizován" : "Článek vytvořen");
        router.push("/admin/blog");
      } else {
        toast.error("Chyba při ukládání");
      }
    } catch {
      toast.error("Chyba připojení");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/admin/blog")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Zpět
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="pub-sw" className="text-sm">Publikovat</Label>
            <Switch id="pub-sw" checked={isPublished} onCheckedChange={setIsPublished} />
          </div>
          <Button onClick={() => setPreview(!preview)} variant="outline" size="sm" className="gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            {preview ? "Editor" : "Náhled"}
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Uložit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Název článku" className="h-14 text-2xl font-bold border-0 px-0 focus-visible:ring-0 shadow-none" />
          <Input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Krátký úvod — zobrazí se v náhledu na blogu" className="text-muted-foreground border-0 px-0 focus-visible:ring-0 shadow-none" />

          {!preview ? (
            <>
              <div className="flex items-center gap-1 rounded-lg border bg-card p-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertMarkup("<strong>", "</strong>")}><Bold className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertMarkup("<em>", "</em>")}><Italic className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertMarkup("\n<h2>", "</h2>\n")}><Heading2 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertMarkup("\n<ul>\n<li>", "</li>\n</ul>\n")}><List className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertMarkup('<a href="', '">odkaz</a>')}><Link2 className="h-4 w-4" /></Button>
                <div className="h-6 w-px bg-border mx-1" />
                <Button variant="ghost" size="sm" className="h-8 gap-1.5" onClick={uploadImage}>
                  <ImagePlus className="h-4 w-4" />
                  Obrázek
                </Button>
              </div>
              <Textarea ref={contentRef} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Obsah článku (HTML)..." className="min-h-[500px] font-mono text-sm leading-relaxed" />
            </>
          ) : (
            <Card>
              <CardContent className="pt-6 prose-content">
                {coverImage && <img src={coverImage} alt="Cover" className="w-full h-64 object-cover rounded-xl mb-6" />}
                <h1 className="text-3xl font-bold mb-4">{title || "Bez názvu"}</h1>
                {excerpt && <p className="text-lg text-muted-foreground mb-6">{excerpt}</p>}
                {/* Admin-only content — trusted source */}
                <div className="prose prose-sm max-w-none dark:prose-invert [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:mb-4 [&_ul]:pl-6 [&_li]:mb-1 [&_a]:text-primary [&_a]:underline [&_img]:rounded-xl [&_img]:my-4 [&_strong]:font-semibold [&_em]:italic [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground" dangerouslySetInnerHTML={{ __html: content }} />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Úvodní obrázek</CardTitle></CardHeader>
            <CardContent>
              <div className="flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed hover:border-primary/50 transition-colors" onClick={() => coverRef.current?.click()}>
                {coverImage ? <img src={coverImage} alt="Cover" className="h-full w-full object-cover" /> : <div className="text-center text-muted-foreground"><ImageIcon className="mx-auto h-6 w-6 mb-1" /><p className="text-xs">Nahrát</p></div>}
              </div>
              {coverImage && <Button variant="ghost" size="sm" className="mt-2 w-full text-xs" onClick={() => setCoverImage(null)}>Odebrat</Button>}
              <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={uploadCover} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Kategorie</CardTitle></CardHeader>
            <CardContent>
              <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Štítky</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-2">
                <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Nový štítek" className="h-8" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} />
                <Button variant="outline" size="sm" className="h-8 shrink-0" onClick={addTag}><Plus className="h-3 w-3" /></Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">{tags.map((t) => <Badge key={t} variant="secondary" className="gap-1 pr-1">{t}<button onClick={() => setTags(tags.filter((x) => x !== t))} className="rounded-full p-0.5 hover:bg-destructive/20"><X className="h-2.5 w-2.5" /></button></Badge>)}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Autor</CardTitle></CardHeader>
            <CardContent><Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="h-8" /></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
