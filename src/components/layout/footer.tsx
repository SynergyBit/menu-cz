import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <UtensilsCrossed className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Gastr<span className="text-primary">oo</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Interaktivní vyhledávač restaurací a jídelních lístků.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Objevte</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/restaurace" className="hover:text-foreground transition-colors">Restaurace</Link></li>
              <li><Link href="/dnes" className="hover:text-foreground transition-colors">Denní menu dnes</Link></li>
              <li><Link href="/akce" className="hover:text-foreground transition-colors">Akce</Link></li>
              <li><Link href="/happy-hours" className="hover:text-foreground transition-colors">Happy Hours</Link></li>
              <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link href="/kucharka" className="hover:text-foreground transition-colors">Kuchařka</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Pro restaurace</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/pro-restaurace" className="hover:text-foreground transition-colors">Proč Gastroo</Link></li>
              <li><Link href="/cenik" className="hover:text-foreground transition-colors">Ceník</Link></li>
              <li><Link href="/registrace" className="hover:text-foreground transition-colors">Registrace restaurace</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Účet</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/registrace-host" className="hover:text-foreground transition-colors">Vytvořit účet</Link></li>
              <li><Link href="/prihlaseni" className="hover:text-foreground transition-colors">Přihlášení</Link></li>
              <li><Link href="/oblibene" className="hover:text-foreground transition-colors">Oblíbené</Link></li>
              <li><Link href="/novinky" className="hover:text-foreground transition-colors">Novinky</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground mb-3">
            <Link href="/podminky" className="hover:text-foreground transition-colors">Obchodní podmínky</Link>
            <Link href="/soukromi" className="hover:text-foreground transition-colors">Ochrana osobních údajů</Link>
            <Link href="/o-nas" className="hover:text-foreground transition-colors">O nás</Link>
            <Link href="/kontakt" className="hover:text-foreground transition-colors">Kontakt</Link>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Gastroo — SynergyBit s.r.o., IČO: 23229853
          </p>
        </div>
      </div>
    </footer>
  );
}
