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
                Menu<span className="text-primary">CZ</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Interaktivní vyhledávač restaurací a jídelních lístků.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Pro hosty</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/restaurace" className="hover:text-foreground transition-colors">Najít restauraci</Link></li>
              <li><Link href="/restaurace" className="hover:text-foreground transition-colors">Denní menu</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Pro restaurace</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/registrace" className="hover:text-foreground transition-colors">Registrace restaurace</Link></li>
              <li><Link href="/cenik" className="hover:text-foreground transition-colors">Ceník</Link></li>
              <li><Link href="/prihlaseni" className="hover:text-foreground transition-colors">Přihlášení</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Pro hosty</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/registrace-host" className="hover:text-foreground transition-colors">Vytvořit účet</Link></li>
              <li><Link href="/oblibene" className="hover:text-foreground transition-colors">Oblíbené</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} MenuCZ. Všechna práva vyhrazena.
        </div>
      </div>
    </footer>
  );
}
