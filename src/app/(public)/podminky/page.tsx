import type { Metadata } from "next";

export const metadata: Metadata = { title: "Obchodní podmínky" };

export default function PodminkyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold mb-8">Obchodní podmínky</h1>
      <div className="prose prose-sm max-w-none dark:prose-invert [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:mb-4 [&_ul]:pl-6 [&_ul]:list-disc [&_li]:mb-1.5 [&_ol]:mb-4 [&_ol]:pl-6 [&_ol]:list-decimal">

        <p className="text-muted-foreground">Poslední aktualizace: 13. dubna 2026</p>

        <h2>1. Provozovatel</h2>
        <p>
          Provozovatelem platformy Gastroo.cz (dále jen &bdquo;Gastroo&ldquo; nebo &bdquo;platforma&ldquo;) je:
        </p>
        <p>
          <strong>SynergyBit s.r.o.</strong><br />
          Čujkovova 1714/21, 700 30 Ostrava<br />
          IČO: 23229853<br />
          Společnost vedena u Krajského soudu v Ostravě (C 99298/KSOS)<br />
          Nejsme plátci DPH<br />
          Email: petr@synergybit.cz<br />
          Tel: +420 603 796 010
        </p>

        <h2>2. Definice pojmů</h2>
        <ul>
          <li><strong>Platforma</strong> — webová aplikace Gastroo.cz včetně všech podstránek a API</li>
          <li><strong>Restaurace</strong> — podnikatelský subjekt registrovaný na platformě za účelem prezentace svých služeb</li>
          <li><strong>Uživatel</strong> — fyzická osoba využívající platformu k vyhledávání restaurací a dalším funkcím</li>
          <li><strong>Služba</strong> — online služby poskytované provozovatelem prostřednictvím platformy</li>
        </ul>

        <h2>3. Předmět podmínek</h2>
        <p>
          Tyto obchodní podmínky upravují práva a povinnosti mezi provozovatelem a uživateli/restauracemi při
          využívání platformy Gastroo. Registrací nebo použitím platformy vyjadřujete souhlas s těmito podmínkami.
        </p>

        <h2>4. Služby pro restaurace</h2>
        <h3>4.1 Bezplatné služby (plán Zdarma)</h3>
        <ul>
          <li>Základní profil restaurace (název, adresa, telefon)</li>
          <li>Jídelní lístek (max. 5 položek)</li>
          <li>Otevírací doba</li>
          <li>Základní vizitka</li>
        </ul>

        <h3>4.2 Placené služby (plány Standard a Premium)</h3>
        <p>
          Placené služby zahrnují rozšířené funkce dle aktuálního ceníku na stránce /cenik.
          Ceny jsou uvedeny včetně všech poplatků (provozovatel není plátce DPH).
        </p>
        <ul>
          <li><strong>Standard</strong> — 299 Kč/měsíc nebo 2 990 Kč/rok</li>
          <li><strong>Premium</strong> — 599 Kč/měsíc nebo 5 990 Kč/rok</li>
        </ul>

        <h3>4.3 Platební podmínky</h3>
        <ul>
          <li>Platba probíhá předem za zvolené období (měsíc nebo rok)</li>
          <li>Provozovatel vystaví daňový doklad (fakturu) po přijetí platby</li>
          <li>Předplatné se automaticky obnovuje, pokud není zrušeno nejpozději 24 hodin před koncem období</li>
        </ul>

        <h3>4.4 Zrušení a vrácení peněz</h3>
        <ul>
          <li>Předplatné lze kdykoliv zrušit s platností do konce aktuálního období</li>
          <li>Vrácení peněz je možné do 14 dnů od zakoupení, pokud služba nebyla podstatně využita</li>
          <li>Po uplynutí 14denní lhůty se peníze nevracejí</li>
        </ul>

        <h2>5. Služby pro uživatele</h2>
        <p>
          Registrace a používání platformy je pro uživatele (hosty) zcela bezplatné.
          Uživatel může vytvářet recenze, ukládat oblíbené restaurace a nastavovat preference.
        </p>

        <h2>6. Obsah a odpovědnost</h2>
        <h3>6.1 Obsah restaurací</h3>
        <p>
          Restaurace odpovídají za správnost a aktuálnost svého profilu, jídelního lístku,
          cen, otevírací doby a dalších údajů. Provozovatel neodpovídá za nepřesnosti v údajích
          zadaných restauracemi.
        </p>

        <h3>6.2 Recenze uživatelů</h3>
        <p>
          Uživatelé se zavazují psát pravdivé a věcné recenze. Provozovatel si vyhrazuje právo
          odstranit recenze, které porušují tyto podmínky, obsahují vulgarismy, nepravdivé údaje
          nebo jsou zjevně šikanózní.
        </p>

        <h3>6.3 Zakázaný obsah</h3>
        <p>Na platformě je zakázáno publikovat obsah, který:</p>
        <ul>
          <li>Porušuje zákony České republiky</li>
          <li>Obsahuje diskriminaci, nenávist nebo podněcování k násilí</li>
          <li>Porušuje práva duševního vlastnictví třetích osob</li>
          <li>Obsahuje spam, podvodný nebo zavádějící obsah</li>
        </ul>

        <h2>7. Ochrana osobních údajů</h2>
        <p>
          Zpracování osobních údajů se řídí samostatným dokumentem — <a href="/soukromi" className="text-primary hover:underline">Zásady ochrany osobních údajů</a>.
        </p>

        <h2>8. Dostupnost služby</h2>
        <p>
          Provozovatel se snaží zajistit nepřetržitou dostupnost platformy, ale nezaručuje
          100% dostupnost. Provozovatel neodpovídá za škody způsobené výpadkem služby,
          údržbou nebo okolnostmi mimo jeho kontrolu.
        </p>

        <h2>9. Změny podmínek</h2>
        <p>
          Provozovatel si vyhrazuje právo tyto podmínky změnit. O změnách bude informovat
          prostřednictvím platformy. Pokračováním v užívání platformy po změně podmínek
          vyjadřujete souhlas s jejich novým zněním.
        </p>

        <h2>10. Rozhodné právo</h2>
        <p>
          Tyto podmínky se řídí právním řádem České republiky. Případné spory budou řešeny
          příslušnými soudy České republiky.
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
