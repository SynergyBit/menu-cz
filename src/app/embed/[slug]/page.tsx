"use client";

import { useState, useEffect, use } from "react";
import { Soup, ChefHat, CakeSlice, Clock, UtensilsCrossed } from "lucide-react";

interface MenuItem { id: string; name: string; description: string | null; price: string; allergens: string | null; isAvailable: boolean; }
interface MenuCategory { id: string; name: string; items: MenuItem[]; }
interface DailyMenuItem { id: string; name: string; description: string | null; price: string; type: string; }

const typeIcons: Record<string, string> = { soup: "🍲", main: "🍽️", dessert: "🍰" };

export default function EmbedPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [data, setData] = useState<{
    restaurant: { name: string; slug: string };
    menu: MenuCategory[];
    dailyMenu: { items: DailyMenuItem[] } | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"daily" | "menu">("daily");

  // Read theme from URL params
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("theme") === "dark") setTheme("dark");

    fetch(`/api/restaurants/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setData(d);
        if (!d?.dailyMenu) setTab("menu");
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));

    // Track
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, viewType: "widget" }),
    }).catch(() => {});
  }, [slug]);

  const isDark = theme === "dark";
  const bg = isDark ? "#1a1a1a" : "#ffffff";
  const fg = isDark ? "#fafafa" : "#1a1a1a";
  const muted = isDark ? "#888" : "#666";
  const border = isDark ? "#333" : "#e5e5e5";
  const primary = "#c2410c";

  if (loading) {
    return (
      <div style={{ fontFamily: "system-ui, sans-serif", background: bg, color: fg, padding: 20, minHeight: 200 }}>
        <div style={{ background: border, borderRadius: 8, height: 24, width: "60%", marginBottom: 12 }} />
        <div style={{ background: border, borderRadius: 8, height: 16, width: "40%", marginBottom: 24 }} />
        <div style={{ background: border, borderRadius: 8, height: 16, width: "100%", marginBottom: 8 }} />
        <div style={{ background: border, borderRadius: 8, height: 16, width: "80%", marginBottom: 8 }} />
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ fontFamily: "system-ui, sans-serif", background: bg, color: muted, padding: 40, textAlign: "center" }}>
        Restaurace nenalezena
      </div>
    );
  }

  const { restaurant: r, menu, dailyMenu } = data;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: bg, color: fg, padding: 0, lineHeight: 1.5 }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{r.name}</div>
        </div>
        <a
          href={`https://gastroo.cz/restaurace/${r.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 11, color: primary, textDecoration: "none" }}
        >
          Gastroo.cz ↗
        </a>
      </div>

      {/* Tabs */}
      {dailyMenu && (
        <div style={{ display: "flex", borderBottom: `1px solid ${border}` }}>
          <button
            onClick={() => setTab("daily")}
            style={{
              flex: 1, padding: "10px 0", border: "none", background: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600, color: tab === "daily" ? primary : muted,
              borderBottom: tab === "daily" ? `2px solid ${primary}` : "2px solid transparent",
            }}
          >
            Denní menu
          </button>
          <button
            onClick={() => setTab("menu")}
            style={{
              flex: 1, padding: "10px 0", border: "none", background: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600, color: tab === "menu" ? primary : muted,
              borderBottom: tab === "menu" ? `2px solid ${primary}` : "2px solid transparent",
            }}
          >
            Jídelní lístek
          </button>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: "12px 20px" }}>
        {tab === "daily" && dailyMenu && (
          <div>
            <div style={{ fontSize: 12, color: muted, marginBottom: 12 }}>
              📅 {new Date().toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" })}
            </div>
            {dailyMenu.items.map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "8px 0", borderBottom: `1px dotted ${border}` }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 14 }}>{typeIcons[item.type] || "🍽️"}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</div>
                    {item.description && <div style={{ fontSize: 12, color: muted }}>{item.description}</div>}
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: primary, whiteSpace: "nowrap", marginLeft: 12 }}>{item.price} Kč</div>
              </div>
            ))}
          </div>
        )}

        {tab === "menu" && (
          <div>
            {menu.length === 0 ? (
              <div style={{ textAlign: "center", padding: 20, color: muted, fontSize: 14 }}>
                Jídelní lístek zatím nebyl přidán
              </div>
            ) : (
              menu.map((cat) => (
                <div key={cat.id} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: primary, marginBottom: 8, paddingBottom: 4, borderBottom: `1px solid ${primary}30` }}>
                    {cat.name}
                  </div>
                  {cat.items.filter((i) => i.isAvailable).map((item) => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px dotted ${border}` }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</div>
                        {item.description && <div style={{ fontSize: 12, color: muted }}>{item.description}</div>}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: primary, whiteSpace: "nowrap", marginLeft: 12 }}>{item.price} Kč</div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "10px 20px", borderTop: `1px solid ${border}`, textAlign: "center", fontSize: 10, color: muted }}>
        Powered by <a href="https://gastroo.cz" target="_blank" rel="noopener noreferrer" style={{ color: primary, textDecoration: "none", fontWeight: 600 }}>Gastroo</a>
      </div>
    </div>
  );
}
