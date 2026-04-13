import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ochrana osobních údajů" };

export default function SoukromiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold mb-8">Zásady ochrany osobních údajů</h1>
      <div className="prose prose-sm max-w-none dark:prose-invert [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:mb-4 [&_ul]:pl-6 [&_ul]:list-disc [&_li]:mb-1.5 [&_ol]:mb-4 [&_ol]:pl-6 [&_ol]:list-decimal">

        <p className="text-muted-foreground">Poslední aktualizace: 13. dubna 2026</p>

        <h2>1. Správce osobních údajů</h2>
        <p>
          <strong>SynergyBit s.r.o.</strong><br />
          Čujkovova 1714/21, 700 30 Ostrava<br />
          IČO: 23229853<br />
          Email: petr@synergybit.cz<br />
          Tel: +420 603 796 010
        </p>

        <h2>2. Jaké údaje zpracováváme</h2>

        <h3>2.1 Registrace restaurace</h3>
        <ul>
          <li>Jméno kontaktní osoby, email, heslo (hashované)</li>
          <li>Název restaurace, adresa, telefon, webové stránky</li>
          <li>GPS souřadnice (z adresy), fotografie, logo</li>
        </ul>

        <h3>2.2 Registrace uživatele (hosta)</h3>
        <ul>
          <li>Jméno, email, heslo (hashované)</li>
          <li>Stravovací preference, oblíbené kuchyně, výchozí město</li>
        </ul>

        <h3>2.3 Recenze</h3>
        <ul>
          <li>Jméno autora, hodnocení, text recenze</li>
        </ul>

        <h3>2.4 Rezervace</h3>
        <ul>
          <li>Jméno, telefon, email, datum, čas, počet osob, poznámka</li>
        </ul>

        <h3>2.5 Kontaktní formuláře a zprávy</h3>
        <ul>
          <li>Jméno, email, telefon, text zprávy</li>
        </ul>

        <h3>2.6 Technické údaje</h3>
        <ul>
          <li>IP adresa (pro rate limiting a bezpečnost)</li>
          <li>Cookies pro autentizaci (session cookie)</li>
          <li>Anonymní statistiky zobrazení stránek</li>
        </ul>

        <h2>3. Účel zpracování</h2>
        <ul>
          <li><strong>Poskytování služby</strong> — provoz platformy, zobrazení restaurací, správa účtů</li>
          <li><strong>Komunikace</strong> — zasílání zpráv mezi hosty a restauracemi, potvrzení rezervací</li>
          <li><strong>Bezpečnost</strong> — ochrana proti zneužití, rate limiting, detekce podezřelé aktivity</li>
          <li><strong>Zlepšování služby</strong> — anonymní statistiky návštěvnosti pro restaurace</li>
        </ul>

        <h2>4. Právní základ zpracování</h2>
        <ul>
          <li><strong>Plnění smlouvy</strong> (čl. 6 odst. 1 písm. b GDPR) — pro registrované uživatele a restaurace</li>
          <li><strong>Oprávněný zájem</strong> (čl. 6 odst. 1 písm. f GDPR) — bezpečnost, prevence zneužití</li>
          <li><strong>Souhlas</strong> (čl. 6 odst. 1 písm. a GDPR) — pro cookies a volitelné funkce</li>
        </ul>

        <h2>5. Doba uchování</h2>
        <ul>
          <li>Údaje účtu — po dobu existence účtu + 30 dní po smazání</li>
          <li>Recenze — po dobu existence restaurace</li>
          <li>Rezervace — 12 měsíců od data rezervace</li>
          <li>Zprávy — 12 měsíců od odeslání</li>
          <li>Technické logy — 30 dní</li>
        </ul>

        <h2>6. Sdílení údajů</h2>
        <p>Vaše osobní údaje nesdílíme s třetími stranami, s výjimkou:</p>
        <ul>
          <li><strong>Hosting</strong> — Railway (server a databáze, EU/US)</li>
          <li><strong>Zákonná povinnost</strong> — pokud to vyžaduje zákon nebo soudní příkaz</li>
        </ul>
        <p>Údaje neprodáváme a nepoužíváme pro reklamní účely třetích stran.</p>

        <h2>7. Vaše práva</h2>
        <p>Jako subjekt údajů máte právo na:</p>
        <ul>
          <li><strong>Přístup</strong> — získat informace o svých zpracovávaných údajích</li>
          <li><strong>Opravu</strong> — požádat o opravu nepřesných údajů</li>
          <li><strong>Výmaz</strong> — požádat o smazání účtu a souvisejících údajů</li>
          <li><strong>Přenositelnost</strong> — získat své údaje ve strukturovaném formátu</li>
          <li><strong>Námitku</strong> — vznést námitku proti zpracování</li>
          <li><strong>Odvolání souhlasu</strong> — kdykoliv odvolat udělený souhlas</li>
        </ul>
        <p>
          Pro uplatnění svých práv nás kontaktujte na <strong>petr@synergybit.cz</strong>.
          Na vaši žádost odpovíme do 30 dnů.
        </p>

        <h2>8. Cookies</h2>

        <h3>8.1 Nezbytné cookies</h3>
        <p>
          Používáme session cookie (<code>__session</code>) pro přihlášení uživatelů.
          Tento cookie je nezbytný pro fungování platformy a nelze ho odmítnout.
        </p>
        <ul>
          <li><strong>__session</strong> — JWT token pro autentizaci, HttpOnly, platnost 7 dní</li>
        </ul>

        <h3>8.2 Analytické cookies</h3>
        <p>
          Nepoužíváme žádné analytické cookies třetích stran (Google Analytics, Facebook Pixel apod.).
          Statistiky sbíráme vlastním řešením a jsou plně anonymní.
        </p>

        <h3>8.3 Funkční cookies</h3>
        <ul>
          <li><strong>gastroo_favorites</strong> — localStorage pro oblíbené restaurace (nepřihlášení uživatelé)</li>
          <li><strong>theme</strong> — preference tmavého/světlého režimu</li>
        </ul>

        <h2>9. Zabezpečení</h2>
        <ul>
          <li>Hesla jsou hashována algoritmem bcrypt (12 rounds)</li>
          <li>Session cookies mají příznaky HttpOnly, Secure a SameSite</li>
          <li>Veškerá komunikace probíhá přes HTTPS</li>
          <li>Rate limiting na citlivé API endpointy</li>
          <li>Security headers (X-Frame-Options, X-Content-Type-Options)</li>
        </ul>

        <h2>10. Dozorový úřad</h2>
        <p>
          Máte právo podat stížnost u Úřadu pro ochranu osobních údajů (ÚOOÚ):<br />
          Pplk. Sochora 27, 170 00 Praha 7<br />
          Web: <a href="https://www.uoou.cz" target="_blank" rel="noopener noreferrer" className="text-primary">www.uoou.cz</a>
        </p>

        <h2>11. Kontakt</h2>
        <p>
          SynergyBit s.r.o.<br />
          Čujkovova 1714/21, 700 30 Ostrava<br />
          Email: petr@synergybit.cz<br />
          Tel: +420 603 796 010
        </p>
      </div>
    </div>
  );
}
