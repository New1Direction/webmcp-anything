// tools.ts — free lead-gen tools (engineering-as-marketing), localized into all
// 12 languages. The QuickCatch funnel rides along: free install + email capture
// (/api/v1/leads) + live Stripe Pro/Reseller (/api/v1/stripe/checkout).
// Routes: /tools, /tools/pokemon-resale-calculator, /tools/<lang>(/...).
//
// Shared UI/plan/message strings are reused from drops_i18n (T + PRICING);
// only the calculator-specific copy lives in CALC below.

import { type Lang, LANGS, LOCALIZED_LANGS, T, PRICING } from "./drops_i18n";

const STORE_URL = "https://chromewebstore.google.com/detail/quickcatch/dgbaaeengmgmkefpocdckkiahilbfdlk";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

interface Calc {
  h1: string; lede: string; title: string; desc: string;
  crumbTools: string; crumbCalc: string;
  productLabel: string; customOpt: string; qtyLabel: string; retailL: string; resaleL: string; resaleHint: string;
  outSave: string; outProfit: string; outMargin: string; outSpend: string; note: string;
  ctaH: string; ctaP: string; notReadyTool: string; alertDone: string;
  faqs: Array<{ q: string; a: string }>;
  idxTitle: string; idxDesc: string; idxH1: string; idxLede: string; toolBlurb: string;
}

const CALC: Record<Lang, Calc> = {
  en: {
    h1: "Pokémon retail vs resale calculator", lede: "See what you save buying at retail, or what you profit reselling. Then catch the next restock at retail with QuickCatch.",
    title: "Pokémon Retail vs Resale Calculator | QuickCatch", desc: "Free calculator: see what you save buying Pokémon at retail, or what you profit reselling. Then catch the restock at retail with QuickCatch.",
    crumbTools: "Free tools", crumbCalc: "Retail vs resale",
    productLabel: "Product (optional)", customOpt: "— Custom —", qtyLabel: "Quantity", retailL: "Retail price ($)", resaleL: "Resale price ($)", resaleHint: "— edit to today's number",
    outSave: "You save (collecting)", outProfit: "Profit (reselling)", outMargin: "Margin", outSpend: "Retail spend",
    note: "Savings = (resale minus retail) × qty: the markup you skip by catching it at retail. Profit assumes you resell at that price. Resale prices move daily, so edit the field for an accurate result.",
    ctaH: "Want these at retail?", ctaP: "Install QuickCatch free and it carts the item the moment it restocks, at retail. Or get a free heads-up by email.",
    notReadyTool: "Not ready to install? Get a free alert when these restock at retail.", alertDone: "Done. We'll alert you when these restock at retail.",
    faqs: [
      { q: "How does the calculator work?", a: "Pick a product or enter a retail price, add a resale price and quantity, and it shows your savings if you collect or your profit if you resell, plus the margin." },
      { q: "Where do the resale numbers come from?", a: "Resale prices move daily, so the presets are rough starting points. Edit the resale field with the real number you see on a marketplace." },
      { q: "How do I actually buy at retail?", a: "Install QuickCatch, open the product page before the drop, and it adds the item to your cart the moment it restocks, at retail." },
    ],
    idxTitle: "Free Pokémon & TCG Tools | QuickCatch", idxDesc: "Free tools for Pokémon and TCG collectors and resellers, starting with the retail vs resale value calculator.",
    idxH1: "Free Pokémon & TCG tools", idxLede: "Useful, free, no signup. Built by QuickCatch, the extension that catches restocks at retail.", toolBlurb: "See what you save buying at retail, or what you profit reselling. Then catch the next restock at retail with QuickCatch.",
  },
  es: {
    h1: "Calculadora de precio de tienda vs reventa de Pokémon", lede: "Mira cuánto ahorras comprando a precio de tienda, o cuánto ganas revendiendo. Luego caza el próximo restock a precio de tienda con QuickCatch.",
    title: "Calculadora precio de tienda vs reventa Pokémon | QuickCatch", desc: "Calculadora gratis: mira cuánto ahorras comprando Pokémon a precio de tienda, o cuánto ganas revendiendo. Luego caza el restock con QuickCatch.",
    crumbTools: "Herramientas gratis", crumbCalc: "Tienda vs reventa",
    productLabel: "Producto (opcional)", customOpt: "— Personalizado —", qtyLabel: "Cantidad", retailL: "Precio de tienda ($)", resaleL: "Precio de reventa ($)", resaleHint: "— edítalo al número de hoy",
    outSave: "Ahorras (coleccionando)", outProfit: "Beneficio (revendiendo)", outMargin: "Margen", outSpend: "Gasto a precio de tienda",
    note: "Ahorro = (reventa menos tienda) × cantidad: el sobreprecio que evitas comprando a precio de tienda. El beneficio asume que revendes a ese precio. Los precios de reventa cambian a diario, así que edita el campo para un resultado exacto.",
    ctaH: "¿Los quieres a precio de tienda?", ctaP: "Instala QuickCatch gratis y lo añade al carrito en cuanto vuelve el stock, a precio de tienda. O recibe un aviso gratis por email.",
    notReadyTool: "¿No quieres instalarlo aún? Recibe un aviso gratis cuando vuelvan al stock a precio de tienda.", alertDone: "Listo. Te avisaremos cuando vuelvan al stock a precio de tienda.",
    faqs: [
      { q: "¿Cómo funciona la calculadora?", a: "Elige un producto o introduce un precio de tienda, añade un precio de reventa y la cantidad, y muestra tu ahorro si coleccionas o tu beneficio si revendes, más el margen." },
      { q: "¿De dónde salen los precios de reventa?", a: "Los precios de reventa cambian a diario, así que los valores predefinidos son orientativos. Edita el campo de reventa con el número real del mercado." },
      { q: "¿Cómo compro a precio de tienda?", a: "Instala QuickCatch, abre la página del producto antes del drop y lo añade al carrito en cuanto vuelve el stock, a precio de tienda." },
    ],
    idxTitle: "Herramientas gratis de Pokémon y TCG | QuickCatch", idxDesc: "Herramientas gratis para coleccionistas y revendedores de Pokémon y TCG, empezando por la calculadora de precio de tienda vs reventa.",
    idxH1: "Herramientas gratis de Pokémon y TCG", idxLede: "Útiles, gratis, sin registro. Creadas por QuickCatch, la extensión que caza restocks a precio de tienda.", toolBlurb: "Mira cuánto ahorras comprando a precio de tienda, o cuánto ganas revendiendo. Luego caza el próximo restock con QuickCatch.",
  },
  fr: {
    h1: "Calculateur prix boutique vs revente Pokémon", lede: "Voyez ce que vous économisez en achetant au prix boutique, ou ce que vous gagnez en revendant. Puis attrapez le prochain réassort au prix boutique avec QuickCatch.",
    title: "Calculateur prix boutique vs revente Pokémon | QuickCatch", desc: "Calculateur gratuit : voyez ce que vous économisez en achetant Pokémon au prix boutique, ou ce que vous gagnez en revendant. Puis attrapez le réassort avec QuickCatch.",
    crumbTools: "Outils gratuits", crumbCalc: "Boutique vs revente",
    productLabel: "Produit (optionnel)", customOpt: "— Personnalisé —", qtyLabel: "Quantité", retailL: "Prix boutique ($)", resaleL: "Prix de revente ($)", resaleHint: "— modifiez selon le prix du jour",
    outSave: "Vous économisez (collection)", outProfit: "Bénéfice (revente)", outMargin: "Marge", outSpend: "Dépense au prix boutique",
    note: "Économie = (revente moins boutique) × quantité : le surcoût évité en achetant au prix boutique. Le bénéfice suppose une revente à ce prix. Les prix de revente changent chaque jour, modifiez le champ pour un résultat exact.",
    ctaH: "Vous les voulez au prix boutique ?", ctaP: "Installez QuickCatch gratuitement et il l'ajoute au panier dès le retour du stock, au prix boutique. Ou recevez une alerte gratuite par email.",
    notReadyTool: "Pas encore prêt à l'installer ? Recevez une alerte gratuite quand le stock revient au prix boutique.", alertDone: "C'est fait. On vous alertera quand le stock revient au prix boutique.",
    faqs: [
      { q: "Comment fonctionne le calculateur ?", a: "Choisissez un produit ou entrez un prix boutique, ajoutez un prix de revente et la quantité, et il montre votre économie en collection ou votre bénéfice en revente, plus la marge." },
      { q: "D'où viennent les prix de revente ?", a: "Les prix de revente changent chaque jour, les valeurs par défaut sont indicatives. Modifiez le champ revente avec le vrai prix du marché." },
      { q: "Comment acheter au prix boutique ?", a: "Installez QuickCatch, ouvrez la page produit avant le drop, et il l'ajoute au panier dès le retour du stock, au prix boutique." },
    ],
    idxTitle: "Outils gratuits Pokémon et TCG | QuickCatch", idxDesc: "Outils gratuits pour collectionneurs et revendeurs Pokémon et TCG, à commencer par le calculateur prix boutique vs revente.",
    idxH1: "Outils gratuits Pokémon et TCG", idxLede: "Utiles, gratuits, sans inscription. Créés par QuickCatch, l'extension qui attrape les réassorts au prix boutique.", toolBlurb: "Voyez ce que vous économisez au prix boutique, ou ce que vous gagnez en revendant. Puis attrapez le prochain réassort avec QuickCatch.",
  },
  de: {
    h1: "Pokémon Ladenpreis-vs-Resale-Rechner", lede: "Sieh, was du beim Kauf zum Ladenpreis sparst oder beim Resale verdienst. Dann schnapp dir den nächsten Restock zum Ladenpreis mit QuickCatch.",
    title: "Pokémon Ladenpreis vs Resale Rechner | QuickCatch", desc: "Kostenloser Rechner: sieh, was du beim Kauf von Pokémon zum Ladenpreis sparst oder beim Resale verdienst. Dann schnapp dir den Restock mit QuickCatch.",
    crumbTools: "Kostenlose Tools", crumbCalc: "Ladenpreis vs Resale",
    productLabel: "Produkt (optional)", customOpt: "— Eigene —", qtyLabel: "Menge", retailL: "Ladenpreis ($)", resaleL: "Resale-Preis ($)", resaleHint: "— auf den heutigen Wert ändern",
    outSave: "Du sparst (sammeln)", outProfit: "Gewinn (Resale)", outMargin: "Marge", outSpend: "Ausgabe zum Ladenpreis",
    note: "Ersparnis = (Resale minus Laden) × Menge: der Aufpreis, den du beim Kauf zum Ladenpreis sparst. Der Gewinn nimmt Resale zu diesem Preis an. Resale-Preise ändern sich täglich, ändere das Feld für ein genaues Ergebnis.",
    ctaH: "Willst du sie zum Ladenpreis?", ctaP: "Installiere QuickCatch kostenlos, es legt es beim Restock zum Ladenpreis in den Warenkorb. Oder hol dir eine kostenlose E-Mail-Info.",
    notReadyTool: "Noch nicht bereit zu installieren? Erhalte eine kostenlose Info, wenn der Bestand zum Ladenpreis zurück ist.", alertDone: "Erledigt. Wir melden uns, wenn der Bestand zum Ladenpreis zurück ist.",
    faqs: [
      { q: "Wie funktioniert der Rechner?", a: "Wähle ein Produkt oder gib einen Ladenpreis ein, ergänze Resale-Preis und Menge, und er zeigt deine Ersparnis beim Sammeln oder deinen Gewinn beim Resale plus die Marge." },
      { q: "Woher kommen die Resale-Preise?", a: "Resale-Preise ändern sich täglich, die Vorgaben sind grobe Startwerte. Ändere das Resale-Feld mit dem echten Marktpreis." },
      { q: "Wie kaufe ich zum Ladenpreis?", a: "Installiere QuickCatch, öffne die Produktseite vor dem Drop, und es legt es beim Restock zum Ladenpreis in den Warenkorb." },
    ],
    idxTitle: "Kostenlose Pokémon- & TCG-Tools | QuickCatch", idxDesc: "Kostenlose Tools für Pokémon- und TCG-Sammler und Reseller, beginnend mit dem Ladenpreis-vs-Resale-Rechner.",
    idxH1: "Kostenlose Pokémon- & TCG-Tools", idxLede: "Nützlich, kostenlos, ohne Anmeldung. Von QuickCatch, der Erweiterung, die Restocks zum Ladenpreis schnappt.", toolBlurb: "Sieh, was du zum Ladenpreis sparst oder beim Resale verdienst. Dann schnapp dir den nächsten Restock mit QuickCatch.",
  },
  pt: {
    h1: "Calculadora preço de loja vs revenda de Pokémon", lede: "Veja quanto você economiza comprando no preço de loja, ou quanto lucra revendendo. Depois garanta o próximo restock no preço de loja com o QuickCatch.",
    title: "Calculadora preço de loja vs revenda Pokémon | QuickCatch", desc: "Calculadora grátis: veja quanto economiza comprando Pokémon no preço de loja, ou quanto lucra revendendo. Depois garanta o restock com o QuickCatch.",
    crumbTools: "Ferramentas grátis", crumbCalc: "Loja vs revenda",
    productLabel: "Produto (opcional)", customOpt: "— Personalizado —", qtyLabel: "Quantidade", retailL: "Preço de loja ($)", resaleL: "Preço de revenda ($)", resaleHint: "— edite para o número de hoje",
    outSave: "Você economiza (colecionando)", outProfit: "Lucro (revendendo)", outMargin: "Margem", outSpend: "Gasto no preço de loja",
    note: "Economia = (revenda menos loja) × quantidade: o ágio que você evita comprando no preço de loja. O lucro assume revenda nesse preço. Os preços de revenda mudam todo dia, edite o campo para um resultado exato.",
    ctaH: "Quer no preço de loja?", ctaP: "Instale o QuickCatch grátis e ele adiciona ao carrinho no restock, no preço de loja. Ou receba um aviso grátis por e-mail.",
    notReadyTool: "Ainda não quer instalar? Receba um aviso grátis quando voltarem ao estoque no preço de loja.", alertDone: "Pronto. Vamos avisar quando voltarem ao estoque no preço de loja.",
    faqs: [
      { q: "Como a calculadora funciona?", a: "Escolha um produto ou digite um preço de loja, some um preço de revenda e a quantidade, e ela mostra sua economia se colecionar ou seu lucro se revender, mais a margem." },
      { q: "De onde vêm os preços de revenda?", a: "Os preços de revenda mudam todo dia, então os padrões são pontos de partida. Edite o campo de revenda com o número real do mercado." },
      { q: "Como compro no preço de loja?", a: "Instale o QuickCatch, abra a página do produto antes do drop, e ele adiciona ao carrinho no restock, no preço de loja." },
    ],
    idxTitle: "Ferramentas grátis de Pokémon e TCG | QuickCatch", idxDesc: "Ferramentas grátis para colecionadores e revendedores de Pokémon e TCG, a começar pela calculadora preço de loja vs revenda.",
    idxH1: "Ferramentas grátis de Pokémon e TCG", idxLede: "Úteis, grátis, sem cadastro. Feitas pelo QuickCatch, a extensão que garante restocks no preço de loja.", toolBlurb: "Veja quanto economiza no preço de loja, ou quanto lucra revendendo. Depois garanta o próximo restock com o QuickCatch.",
  },
  it: {
    h1: "Calcolatore prezzo di negozio vs rivendita Pokémon", lede: "Scopri quanto risparmi comprando al prezzo di negozio, o quanto guadagni rivendendo. Poi prendi il prossimo restock al prezzo di negozio con QuickCatch.",
    title: "Calcolatore prezzo negozio vs rivendita Pokémon | QuickCatch", desc: "Calcolatore gratis: scopri quanto risparmi comprando Pokémon al prezzo di negozio, o quanto guadagni rivendendo. Poi prendi il restock con QuickCatch.",
    crumbTools: "Strumenti gratis", crumbCalc: "Negozio vs rivendita",
    productLabel: "Prodotto (facoltativo)", customOpt: "— Personalizzato —", qtyLabel: "Quantità", retailL: "Prezzo di negozio ($)", resaleL: "Prezzo di rivendita ($)", resaleHint: "— modifica al valore di oggi",
    outSave: "Risparmi (collezionando)", outProfit: "Profitto (rivendendo)", outMargin: "Margine", outSpend: "Spesa al prezzo di negozio",
    note: "Risparmio = (rivendita meno negozio) × quantità: il sovrapprezzo che eviti comprando al prezzo di negozio. Il profitto presume la rivendita a quel prezzo. I prezzi di rivendita cambiano ogni giorno, modifica il campo per un risultato preciso.",
    ctaH: "Li vuoi al prezzo di negozio?", ctaP: "Installa QuickCatch gratis e lo mette nel carrello al restock, al prezzo di negozio. Oppure ricevi un avviso gratis via email.",
    notReadyTool: "Non vuoi ancora installarlo? Ricevi un avviso gratis quando tornano disponibili al prezzo di negozio.", alertDone: "Fatto. Ti avviseremo quando tornano disponibili al prezzo di negozio.",
    faqs: [
      { q: "Come funziona il calcolatore?", a: "Scegli un prodotto o inserisci un prezzo di negozio, aggiungi un prezzo di rivendita e la quantità, e mostra il risparmio se collezioni o il profitto se rivendi, più il margine." },
      { q: "Da dove vengono i prezzi di rivendita?", a: "I prezzi di rivendita cambiano ogni giorno, quindi i valori predefiniti sono indicativi. Modifica il campo rivendita col prezzo reale del mercato." },
      { q: "Come compro al prezzo di negozio?", a: "Installa QuickCatch, apri la pagina del prodotto prima del drop, e lo mette nel carrello al restock, al prezzo di negozio." },
    ],
    idxTitle: "Strumenti gratis Pokémon e TCG | QuickCatch", idxDesc: "Strumenti gratis per collezionisti e rivenditori Pokémon e TCG, a partire dal calcolatore prezzo di negozio vs rivendita.",
    idxH1: "Strumenti gratis Pokémon e TCG", idxLede: "Utili, gratis, senza registrazione. Creati da QuickCatch, l'estensione che prende i restock al prezzo di negozio.", toolBlurb: "Scopri quanto risparmi al prezzo di negozio, o quanto guadagni rivendendo. Poi prendi il prossimo restock con QuickCatch.",
  },
  nl: {
    h1: "Pokémon winkelprijs vs resale calculator", lede: "Zie wat je bespaart bij kopen op winkelprijs, of wat je verdient met doorverkopen. Pak dan de volgende restock op winkelprijs met QuickCatch.",
    title: "Pokémon winkelprijs vs resale calculator | QuickCatch", desc: "Gratis calculator: zie wat je bespaart bij Pokémon op winkelprijs, of wat je verdient met doorverkopen. Pak dan de restock met QuickCatch.",
    crumbTools: "Gratis tools", crumbCalc: "Winkelprijs vs resale",
    productLabel: "Product (optioneel)", customOpt: "— Aangepast —", qtyLabel: "Aantal", retailL: "Winkelprijs ($)", resaleL: "Resale-prijs ($)", resaleHint: "— pas aan naar de prijs van vandaag",
    outSave: "Je bespaart (verzamelen)", outProfit: "Winst (doorverkopen)", outMargin: "Marge", outSpend: "Uitgave op winkelprijs",
    note: "Besparing = (resale min winkel) × aantal: de meerprijs die je vermijdt door op winkelprijs te kopen. Winst gaat uit van doorverkoop tegen die prijs. Resale-prijzen veranderen dagelijks, pas het veld aan voor een nauwkeurig resultaat.",
    ctaH: "Wil je ze op winkelprijs?", ctaP: "Installeer QuickCatch gratis en het legt het bij de restock in je mandje, op winkelprijs. Of krijg een gratis seintje per e-mail.",
    notReadyTool: "Nog niet klaar om te installeren? Krijg een gratis melding als ze weer op voorraad zijn op winkelprijs.", alertDone: "Klaar. We waarschuwen je als ze weer op voorraad zijn op winkelprijs.",
    faqs: [
      { q: "Hoe werkt de calculator?", a: "Kies een product of vul een winkelprijs in, voeg een resale-prijs en aantal toe, en het toont je besparing bij verzamelen of je winst bij doorverkopen, plus de marge." },
      { q: "Waar komen de resale-prijzen vandaan?", a: "Resale-prijzen veranderen dagelijks, dus de presets zijn ruwe startpunten. Pas het resale-veld aan met de echte marktprijs." },
      { q: "Hoe koop ik op winkelprijs?", a: "Installeer QuickCatch, open de productpagina vóór de drop, en het legt het bij de restock in je mandje, op winkelprijs." },
    ],
    idxTitle: "Gratis Pokémon- & TCG-tools | QuickCatch", idxDesc: "Gratis tools voor Pokémon- en TCG-verzamelaars en verkopers, te beginnen met de winkelprijs-vs-resale calculator.",
    idxH1: "Gratis Pokémon- & TCG-tools", idxLede: "Nuttig, gratis, geen signup. Gemaakt door QuickCatch, de extensie die restocks op winkelprijs pakt.", toolBlurb: "Zie wat je bespaart op winkelprijs, of wat je verdient met doorverkopen. Pak dan de volgende restock met QuickCatch.",
  },
  pl: {
    h1: "Kalkulator cena sklepowa vs odsprzedaż Pokémon", lede: "Zobacz, ile oszczędzasz kupując w cenie sklepowej, albo ile zarabiasz na odsprzedaży. Potem złap następny restock w cenie sklepowej z QuickCatch.",
    title: "Kalkulator cena sklepowa vs odsprzedaż Pokémon | QuickCatch", desc: "Darmowy kalkulator: zobacz, ile oszczędzasz kupując Pokémon w cenie sklepowej, albo ile zarabiasz na odsprzedaży. Potem złap restock z QuickCatch.",
    crumbTools: "Darmowe narzędzia", crumbCalc: "Sklep vs odsprzedaż",
    productLabel: "Produkt (opcjonalnie)", customOpt: "— Własne —", qtyLabel: "Ilość", retailL: "Cena sklepowa ($)", resaleL: "Cena odsprzedaży ($)", resaleHint: "— wpisz dzisiejszą kwotę",
    outSave: "Oszczędzasz (kolekcja)", outProfit: "Zysk (odsprzedaż)", outMargin: "Marża", outSpend: "Wydatek w cenie sklepowej",
    note: "Oszczędność = (odsprzedaż minus sklep) × ilość: narzut, którego unikasz kupując w cenie sklepowej. Zysk zakłada odsprzedaż po tej cenie. Ceny odsprzedaży zmieniają się codziennie, edytuj pole dla dokładnego wyniku.",
    ctaH: "Chcesz je w cenie sklepowej?", ctaP: "Zainstaluj QuickCatch za darmo, a doda do koszyka przy restocku, w cenie sklepowej. Albo odbierz darmowe powiadomienie e-mailem.",
    notReadyTool: "Nie chcesz jeszcze instalować? Otrzymaj darmowe powiadomienie, gdy wrócą do sprzedaży w cenie sklepowej.", alertDone: "Gotowe. Powiadomimy Cię, gdy wrócą do sprzedaży w cenie sklepowej.",
    faqs: [
      { q: "Jak działa kalkulator?", a: "Wybierz produkt lub wpisz cenę sklepową, dodaj cenę odsprzedaży i ilość, a pokaże oszczędność przy kolekcji lub zysk przy odsprzedaży, plus marżę." },
      { q: "Skąd pochodzą ceny odsprzedaży?", a: "Ceny odsprzedaży zmieniają się codziennie, więc wartości domyślne to punkty wyjścia. Wpisz w pole odsprzedaży realną cenę z rynku." },
      { q: "Jak kupić w cenie sklepowej?", a: "Zainstaluj QuickCatch, otwórz stronę produktu przed dropem, a doda do koszyka przy restocku, w cenie sklepowej." },
    ],
    idxTitle: "Darmowe narzędzia Pokémon i TCG | QuickCatch", idxDesc: "Darmowe narzędzia dla kolekcjonerów i odsprzedawców Pokémon i TCG, zaczynając od kalkulatora cena sklepowa vs odsprzedaż.",
    idxH1: "Darmowe narzędzia Pokémon i TCG", idxLede: "Przydatne, darmowe, bez rejestracji. Od QuickCatch, rozszerzenia, które łapie restocki w cenie sklepowej.", toolBlurb: "Zobacz, ile oszczędzasz w cenie sklepowej, albo ile zarabiasz na odsprzedaży. Potem złap następny restock z QuickCatch.",
  },
  ja: {
    h1: "ポケモン 定価vs転売 計算機", lede: "定価で買うといくら得か、転売するといくら儲かるかを確認。あとはQuickCatchで次の再入荷を定価で狙いましょう。",
    title: "ポケモン 定価vs転売 計算機 | QuickCatch", desc: "無料の計算機：ポケモンを定価で買うといくら得か、転売するといくら儲かるかを確認。あとはQuickCatchで再入荷を狙えます。",
    crumbTools: "無料ツール", crumbCalc: "定価vs転売",
    productLabel: "商品（任意）", customOpt: "— カスタム —", qtyLabel: "数量", retailL: "定価（$）", resaleL: "転売価格（$）", resaleHint: "— 今日の価格に編集",
    outSave: "節約額（集める場合）", outProfit: "利益（転売の場合）", outMargin: "利益率", outSpend: "定価での支出",
    note: "節約額 =（転売 − 定価）× 数量。定価で買うことで避けられる上乗せ分です。利益はその価格で転売した場合の想定です。転売価格は毎日変わるので、正確な結果には項目を編集してください。",
    ctaH: "定価で欲しいですか？", ctaP: "QuickCatchを無料で入れれば、再入荷時に定価でカートへ入れます。または無料でメール通知を受け取れます。",
    notReadyTool: "まだインストールしない？ 定価で再入荷したら無料でお知らせします。", alertDone: "完了。定価で再入荷したらお知らせします。",
    faqs: [
      { q: "計算機の使い方は？", a: "商品を選ぶか定価を入力し、転売価格と数量を加えると、集める場合の節約額または転売の利益、利益率を表示します。" },
      { q: "転売価格はどこから？", a: "転売価格は毎日変わるため、初期値は目安です。市場で見た実際の数字を転売の欄に入力してください。" },
      { q: "定価で買うには？", a: "QuickCatchを入れ、ドロップ前に商品ページを開けば、再入荷時に定価でカートへ入れます。" },
    ],
    idxTitle: "ポケモン＆TCGの無料ツール | QuickCatch", idxDesc: "ポケモンとTCGのコレクター・転売者向けの無料ツール。まずは定価vs転売の計算機から。",
    idxH1: "ポケモン＆TCGの無料ツール", idxLede: "便利で無料、登録不要。再入荷を定価で狙う拡張機能QuickCatch製。", toolBlurb: "定価で買うといくら得か、転売するといくら儲かるかを確認。あとはQuickCatchで次の再入荷を狙いましょう。",
  },
  ko: {
    h1: "포켓몬 정가 vs 리셀 계산기", lede: "정가로 살 때 얼마 아끼는지, 리셀할 때 얼마 버는지 확인하세요. 그다음 QuickCatch로 다음 재입고를 정가에 잡으세요.",
    title: "포켓몬 정가 vs 리셀 계산기 | QuickCatch", desc: "무료 계산기: 포켓몬을 정가로 살 때 얼마 아끼는지, 리셀할 때 얼마 버는지 확인하고, QuickCatch로 재입고를 잡으세요.",
    crumbTools: "무료 도구", crumbCalc: "정가 vs 리셀",
    productLabel: "상품 (선택)", customOpt: "— 직접 입력 —", qtyLabel: "수량", retailL: "정가 ($)", resaleL: "리셀 가격 ($)", resaleHint: "— 오늘 가격으로 수정",
    outSave: "절약액 (수집 시)", outProfit: "수익 (리셀 시)", outMargin: "마진", outSpend: "정가 지출",
    note: "절약액 = (리셀 − 정가) × 수량. 정가로 사서 피하는 웃돈입니다. 수익은 그 가격에 리셀한다고 가정합니다. 리셀 가격은 매일 바뀌니 정확한 결과를 위해 값을 수정하세요.",
    ctaH: "정가로 원하세요?", ctaP: "QuickCatch를 무료로 설치하면 재입고 시 정가로 장바구니에 담습니다. 또는 무료 이메일 알림을 받으세요.",
    notReadyTool: "아직 설치하기 어렵나요? 정가로 재입고되면 무료로 알려드려요.", alertDone: "완료. 정가로 재입고되면 알려드릴게요.",
    faqs: [
      { q: "계산기는 어떻게 작동하나요?", a: "상품을 고르거나 정가를 입력하고 리셀 가격과 수량을 더하면, 수집 시 절약액 또는 리셀 시 수익과 마진을 보여줍니다." },
      { q: "리셀 가격은 어디서 오나요?", a: "리셀 가격은 매일 바뀌므로 기본값은 대략적인 출발점입니다. 리셀 칸에 시장의 실제 숫자를 입력하세요." },
      { q: "정가로 어떻게 사나요?", a: "QuickCatch를 설치하고 드롭 전에 상품 페이지를 열면, 재입고 시 정가로 장바구니에 담습니다." },
    ],
    idxTitle: "포켓몬 & TCG 무료 도구 | QuickCatch", idxDesc: "포켓몬과 TCG 컬렉터·리셀러를 위한 무료 도구, 정가 vs 리셀 계산기부터.",
    idxH1: "포켓몬 & TCG 무료 도구", idxLede: "유용하고 무료, 가입 불필요. 재입고를 정가에 잡는 확장 프로그램 QuickCatch 제작.", toolBlurb: "정가로 살 때 얼마 아끼는지, 리셀할 때 얼마 버는지 확인하고, QuickCatch로 다음 재입고를 잡으세요.",
  },
  zh: {
    h1: "宝可梦原价 vs 转售计算器", lede: "看看按原价买能省多少，转售能赚多少。然后用 QuickCatch 以原价抢下一次补货。",
    title: "宝可梦原价 vs 转售计算器 | QuickCatch", desc: "免费计算器：看看按原价买宝可梦能省多少、转售能赚多少，然后用 QuickCatch 抢补货。",
    crumbTools: "免费工具", crumbCalc: "原价 vs 转售",
    productLabel: "商品（可选）", customOpt: "— 自定义 —", qtyLabel: "数量", retailL: "原价（$）", resaleL: "转售价（$）", resaleHint: "— 改成今天的价格",
    outSave: "省下（收藏）", outProfit: "利润（转售）", outMargin: "利润率", outSpend: "原价支出",
    note: "省下 =（转售 − 原价）× 数量，即按原价买所避免的溢价。利润假设你以该价转售。转售价每天变动，请编辑该字段以获得准确结果。",
    ctaH: "想按原价拿下吗？", ctaP: "免费安装 QuickCatch，补货时以原价加入购物车。或免费接收邮件提醒。",
    notReadyTool: "还不想安装？当它们以原价补货时免费提醒你。", alertDone: "完成。它们以原价补货时我们会提醒你。",
    faqs: [
      { q: "计算器怎么用？", a: "选择商品或输入原价，加上转售价和数量，它会显示收藏时省下的金额或转售的利润，以及利润率。" },
      { q: "转售价从哪来？", a: "转售价每天变动，所以预设只是大致起点。请在转售栏填入市场上的真实数字。" },
      { q: "怎么按原价买到？", a: "安装 QuickCatch，在 drop 前打开商品页面，补货时就以原价加入购物车。" },
    ],
    idxTitle: "宝可梦与 TCG 免费工具 | QuickCatch", idxDesc: "面向宝可梦和 TCG 收藏者与转卖者的免费工具，从原价 vs 转售计算器开始。",
    idxH1: "宝可梦与 TCG 免费工具", idxLede: "实用、免费、免注册。由 QuickCatch 制作，能以原价抢补货的扩展。", toolBlurb: "看看按原价买能省多少，转售能赚多少。然后用 QuickCatch 抢下一次补货。",
  },
  "zh-Hant": {
    h1: "寶可夢原價 vs 轉售計算器", lede: "看看按原價買能省多少，轉售能賺多少。然後用 QuickCatch 以原價搶下一次補貨。",
    title: "寶可夢原價 vs 轉售計算器 | QuickCatch", desc: "免費計算器：看看按原價買寶可夢能省多少、轉售能賺多少，然後用 QuickCatch 搶補貨。",
    crumbTools: "免費工具", crumbCalc: "原價 vs 轉售",
    productLabel: "商品（可選）", customOpt: "— 自訂 —", qtyLabel: "數量", retailL: "原價（$）", resaleL: "轉售價（$）", resaleHint: "— 改成今天的價格",
    outSave: "省下（收藏）", outProfit: "利潤（轉售）", outMargin: "利潤率", outSpend: "原價支出",
    note: "省下 =（轉售 − 原價）× 數量，即按原價買所避免的溢價。利潤假設你以該價轉售。轉售價每天變動，請編輯該欄位以獲得準確結果。",
    ctaH: "想按原價拿下嗎？", ctaP: "免費安裝 QuickCatch，補貨時以原價加入購物車。或免費接收電子郵件提醒。",
    notReadyTool: "還不想安裝？當它們以原價補貨時免費提醒你。", alertDone: "完成。它們以原價補貨時我們會提醒你。",
    faqs: [
      { q: "計算器怎麼用？", a: "選擇商品或輸入原價，加上轉售價和數量，它會顯示收藏時省下的金額或轉售的利潤，以及利潤率。" },
      { q: "轉售價從哪來？", a: "轉售價每天變動，所以預設只是大致起點。請在轉售欄填入市場上的真實數字。" },
      { q: "怎麼按原價買到？", a: "安裝 QuickCatch，在 drop 前打開商品頁面，補貨時就以原價加入購物車。" },
    ],
    idxTitle: "寶可夢與 TCG 免費工具 | QuickCatch", idxDesc: "面向寶可夢和 TCG 收藏家與轉賣者的免費工具，從原價 vs 轉售計算器開始。",
    idxH1: "寶可夢與 TCG 免費工具", idxLede: "實用、免費、免註冊。由 QuickCatch 製作，能以原價搶補貨的擴充。", toolBlurb: "看看按原價買能省多少，轉售能賺多少。然後用 QuickCatch 搶下一次補貨。",
  },
};

function calcUrl(origin: string, lang: Lang): string {
  return lang === "en" ? `${origin}/tools/pokemon-resale-calculator` : `${origin}/tools/${lang}/pokemon-resale-calculator`;
}
function toolsUrl(origin: string, lang: Lang): string {
  return lang === "en" ? `${origin}/tools` : `${origin}/tools/${lang}`;
}
function alternates(origin: string, kind: "calc" | "index"): string {
  const u = (l: Lang) => (kind === "calc" ? calcUrl(origin, l) : toolsUrl(origin, l));
  return LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${u(l)}" />`).join("\n") +
    `\n<link rel="alternate" hreflang="x-default" href="${u("en")}" />`;
}

function css(): string {
  return `
  :root { --bg:#07070d;--card:#16161f;--bg2:#11111c;--border:#26263a;--text:#ececf5;--muted:#9a9ab0;--accent:#ff9e2c;--accent2:#ffcf7a;--green:#4ade80;--red:#ff5470; }
  * { box-sizing:border-box; }
  html { scroll-behavior:smooth; }
  body { margin:0; color:var(--text); background:var(--bg); line-height:1.6;
    font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;
    background-image:radial-gradient(ellipse 900px 600px at 12% -5%,rgba(255,158,44,.16),transparent 60%); }
  .wrap { max-width:760px; margin:0 auto; padding:0 22px; }
  nav { display:flex; justify-content:space-between; align-items:center; padding:20px 22px; max-width:1080px; margin:0 auto; }
  nav .brand { font-weight:800; display:flex; align-items:center; gap:8px; text-decoration:none; color:var(--text); }
  nav .coin { width:22px;height:22px;border-radius:50%;background:#f97316;border:2px solid #2a1500;position:relative; }
  nav .coin::after{content:"$";position:absolute;inset:0;display:grid;place-items:center;color:#2a1500;font-size:11px;font-weight:900;}
  nav .get { background:linear-gradient(135deg,var(--accent),var(--accent2)); color:#2a1500; padding:8px 15px; border-radius:9px; font-weight:800; text-decoration:none; font-size:.9rem; }
  .crumbs { padding-top:10px; color:var(--muted); font-size:.85rem; } .crumbs a { color:var(--accent2); text-decoration:none; }
  .langs { margin:10px 0 0; color:var(--muted); font-size:.82rem; } .langs a { color:var(--accent2); text-decoration:none; } .langs strong { color:var(--accent2); }
  header.hero { padding:30px 0 10px; }
  h1 { font-size:clamp(1.9rem,4.2vw,2.6rem); margin:0 0 12px; line-height:1.1; letter-spacing:-.02em; }
  .lede { color:var(--muted); font-size:1.1rem; margin:0 0 20px; }
  section { padding:22px 0; }
  h2 { font-size:1.4rem; margin:0 0 14px; }
  .calc { background:var(--card); border:1px solid var(--border); border-radius:18px; padding:22px; }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  @media (max-width:560px){ .grid{ grid-template-columns:1fr; } }
  label { display:flex; flex-direction:column; gap:5px; font-size:.85rem; color:var(--muted); }
  input, select { background:var(--bg2); border:1px solid var(--border); color:var(--text); border-radius:10px; padding:12px 14px; font-size:1rem; font-family:inherit; }
  input:focus, select:focus { outline:none; border-color:var(--accent); }
  .out { margin-top:18px; display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  @media (max-width:560px){ .out{ grid-template-columns:1fr; } }
  .stat { background:var(--bg2); border:1px solid var(--border); border-radius:14px; padding:16px; }
  .stat .k { color:var(--muted); font-size:.8rem; text-transform:uppercase; letter-spacing:.06em; }
  .stat .v { font-size:1.7rem; font-weight:900; letter-spacing:-.02em; margin-top:4px; }
  .stat.good .v { color:var(--green); } .stat.accent .v { color:var(--accent2); }
  .row { display:flex; gap:10px; flex-wrap:wrap; }
  .btn { display:inline-flex; align-items:center; gap:8px; padding:13px 20px; border-radius:11px; font-weight:800; text-decoration:none; border:none; cursor:pointer; font-size:.95rem; font-family:inherit; }
  .btn-primary { background:linear-gradient(135deg,var(--accent),var(--accent2)); color:#2a1500; }
  .btn-ghost { background:var(--bg2); color:var(--text); border:1px solid var(--border); }
  .cta { background:linear-gradient(135deg,var(--card),rgba(255,158,44,.07)); border:1px solid var(--accent); border-radius:18px; padding:24px; margin:14px 0; }
  .cta h2 { margin:0 0 6px; } .cta p { color:var(--muted); margin:0 0 16px; }
  .capture .f { display:flex; gap:8px; flex-wrap:wrap; margin-top:8px; }
  .capture input { flex:1; min-width:200px; }
  .capture .hp { position:absolute; left:-9999px; }
  .msg { color:var(--green); font-size:.9rem; margin-top:8px; min-height:1em; }
  .plans { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:6px; }
  @media (max-width:560px){ .plans{ grid-template-columns:1fr; } }
  .plan { position:relative; background:var(--card); border:1px solid var(--border); border-radius:16px; padding:20px; display:flex; flex-direction:column; gap:8px; }
  .plan.featured { border-color:var(--accent); box-shadow:0 0 0 1px var(--accent) inset; }
  .plan .pname { font-weight:800; } .plan .pprice { font-size:2rem; font-weight:900; } .plan .pprice span { font-size:.9rem; color:var(--muted); font-weight:600; }
  .plan .pdesc { color:var(--muted); font-size:.92rem; flex:1; margin:0; }
  .plan .buy { width:100%; justify-content:center; }
  .plan .badge2 { position:absolute; top:-10px; right:14px; background:linear-gradient(135deg,var(--accent),var(--accent2)); color:#2a1500; font-size:.7rem; font-weight:800; padding:3px 10px; border-radius:999px; text-transform:uppercase; letter-spacing:.06em; }
  details { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px 18px; margin-bottom:10px; }
  details summary { font-weight:700; cursor:pointer; list-style:none; } details .a { color:var(--muted); margin-top:10px; }
  footer { border-top:1px solid var(--border); margin-top:34px; padding:26px 0; color:var(--muted); font-size:.85rem; }
  footer a { color:var(--accent2); text-decoration:none; }`;
}

function funnelScript(lang: Lang, alertDone: string): string {
  const m = T[lang].msg, p = PRICING[lang];
  const MSG = { invalidEmail: m.invalidEmail, retry: m.retry, netErr: m.netErr, emailPrompt: p.emailPrompt, checkoutErr: p.checkoutErr, alertDone };
  return `<script>
(function(){
  var MSG = ${JSON.stringify(MSG)};
  function buy(plan){
    var ein = document.querySelector("input[type=email]");
    var email = (ein && ein.value.trim()) || "";
    if (!email || email.indexOf("@") < 0) { email = (window.prompt(MSG.emailPrompt) || "").trim(); }
    if (!email || email.indexOf("@") < 0) return;
    fetch("/api/v1/stripe/checkout", { method:"POST", headers:{"content-type":"application/json"},
      body: JSON.stringify({ email: email, plan: plan, origin: location.origin }) })
      .then(function(r){ return r.json(); })
      .then(function(j){ if (j && j.url) location.href = j.url; else alert(MSG.checkoutErr); })
      .catch(function(){ alert(MSG.checkoutErr); });
  }
  document.querySelectorAll("button.buy").forEach(function(b){ b.addEventListener("click", function(){ buy(b.getAttribute("data-plan")); }); });
  document.querySelectorAll("form.lead").forEach(function(f){
    f.addEventListener("submit", async function(e){
      e.preventDefault();
      var email = f.querySelector("input[type=email]").value.trim();
      var msg = f.querySelector(".msg");
      if (!email || email.indexOf("@") < 0) { msg.style.color="#ff5470"; msg.textContent=MSG.invalidEmail; return; }
      if (f.querySelector(".hp") && f.querySelector(".hp").value) { msg.textContent="✓"; return; }
      try {
        var r = await fetch("/api/v1/leads", { method:"POST", headers:{"content-type":"application/json"},
          body: JSON.stringify({ name: email.split("@")[0], email: email, site_url: location.href, package: "alerts", use_case: "QuickCatch resale calculator" }) });
        if (r.ok) { msg.style.color="#4ade80"; msg.textContent=MSG.alertDone; f.querySelector("input[type=email]").value=""; }
        else { msg.style.color="#ff5470"; msg.textContent=MSG.retry; }
      } catch(err){ msg.style.color="#ff5470"; msg.textContent=MSG.netErr; }
    });
  });
})();
</script>`;
}

function langSwitcher(origin: string, kind: "calc" | "index", current: Lang): string {
  const u = (l: Lang) => (kind === "calc" ? calcUrl(origin, l) : toolsUrl(origin, l));
  const labels: Record<Lang, string> = { en: "EN", es: "ES", fr: "FR", de: "DE", pt: "PT", it: "IT", nl: "NL", pl: "PL", ja: "日本語", ko: "한국어", zh: "简体", "zh-Hant": "繁體" };
  return `<p class="langs">${LANGS.map((l) => l === current ? `<strong>${labels[l]}</strong>` : `<a href="${u(l)}">${labels[l]}</a>`).join(" · ")}</p>`;
}

function pricingBlock(lang: Lang): string {
  const P = PRICING[lang];
  return `
  <section id="pro">
    <h2>${esc(P.pricingH)}</h2>
    <div class="plans">
      <div class="plan featured">
        <div class="badge2">${esc(P.popular)}</div>
        <div class="pname">QuickCatch Pro</div>
        <div class="pprice">$99<span>${esc(P.perMo)}</span></div>
        <p class="pdesc">${esc(P.proDesc)}</p>
        <button class="btn btn-primary buy" type="button" data-plan="pro">${esc(P.proCta)}</button>
      </div>
      <div class="plan">
        <div class="pname">QuickCatch Reseller</div>
        <div class="pprice">$299<span>${esc(P.perMo)}</span></div>
        <p class="pdesc">${esc(P.resellerDesc)}</p>
        <button class="btn btn-primary buy" type="button" data-plan="reseller">${esc(P.resellerCta)}</button>
      </div>
    </div>
    <p style="color:var(--muted);font-size:.82rem;margin-top:10px;text-align:center">${esc(P.planFoot)}</p>
  </section>`;
}

function shell(origin: string, head: string, body: string, lang: Lang, scriptTag: string): string {
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
${head}
<style>${css()}</style>
</head>
<body>
<nav>
  <a class="brand" href="${origin}/"><span class="coin"></span> QuickCatch</a>
  <a class="get" href="${STORE_URL}" target="_blank" rel="noopener">${esc(T[lang].ui.getFree)}</a>
</nav>
<div class="wrap">
${body}
</div>
${scriptTag}
</body>
</html>`;
}

export function resaleCalculatorHtml(origin: string, lang: Lang = "en"): string {
  const c = CALC[lang], ui = T[lang].ui;
  const url = calcUrl(origin, lang);
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", inLanguage: lang, mainEntity: c.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  const appLd = {
    "@context": "https://schema.org", "@type": "WebApplication", name: c.title.replace(" | QuickCatch", ""),
    applicationCategory: "FinanceApplication", operatingSystem: "Any", url, inLanguage: lang, browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, publisher: { "@type": "Organization", name: "QuickCatch", url: origin },
  };
  const crumbLd = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "QuickCatch", item: `${origin}/` },
    { "@type": "ListItem", position: 2, name: c.crumbTools, item: toolsUrl(origin, lang) },
    { "@type": "ListItem", position: 3, name: c.crumbCalc, item: url },
  ] };
  const head = `<title>${esc(c.title)}</title>
<meta name="description" content="${esc(c.desc)}" />
<link rel="canonical" href="${url}" />
${alternates(origin, "calc")}
<meta property="og:title" content="${esc(c.h1)}" />
<meta property="og:description" content="${esc(c.desc)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${origin}/og.png" />
<meta name="twitter:card" content="summary_large_image" />
<script type="application/ld+json">${JSON.stringify(appLd)}</script>
<script type="application/ld+json">${JSON.stringify(faqLd)}</script>
<script type="application/ld+json">${JSON.stringify(crumbLd)}</script>`;

  const presets = [
    { name: "Prismatic Evolutions ETB", retail: 49.99, resale: 120 },
    { name: "Scarlet & Violet 151 UPC", retail: 119.99, resale: 250 },
    { name: "Surging Sparks ETB", retail: 59.99, resale: 90 },
    { name: "Charizard ex Super Premium Collection", retail: 119.99, resale: 200 },
    { name: "Booster Box", retail: 161.99, resale: 260 },
  ];

  const body = `
  <nav class="crumbs"><a href="${origin}/">QuickCatch</a> › <a href="${toolsUrl(origin, lang)}">${esc(c.crumbTools)}</a> › <span style="color:var(--accent2)">${esc(c.crumbCalc)}</span></nav>
  <header class="hero">
    <h1>${esc(c.h1)}</h1>
    <p class="lede">${esc(c.lede)}</p>
    ${langSwitcher(origin, "calc", lang)}
  </header>

  <section>
    <div class="calc">
      <div class="grid">
        <label>${esc(c.productLabel)}
          <select id="preset">
            <option value="">${esc(c.customOpt)}</option>
            ${presets.map((p, i) => `<option value="${i}">${esc(p.name)}</option>`).join("")}
          </select>
        </label>
        <label>${esc(c.qtyLabel)}
          <input id="qty" type="number" min="1" value="1" />
        </label>
        <label>${esc(c.retailL)}
          <input id="retail" type="number" min="0" step="0.01" value="49.99" />
        </label>
        <label>${esc(c.resaleL)} <span style="color:var(--accent2)">${esc(c.resaleHint)}</span>
          <input id="resale" type="number" min="0" step="0.01" value="120" />
        </label>
      </div>
      <div class="out">
        <div class="stat good"><div class="k">${esc(c.outSave)}</div><div class="v" id="o-save">$70.01</div></div>
        <div class="stat accent"><div class="k">${esc(c.outProfit)}</div><div class="v" id="o-profit">$70.01</div></div>
        <div class="stat"><div class="k">${esc(c.outMargin)}</div><div class="v" id="o-margin">140%</div></div>
        <div class="stat"><div class="k">${esc(c.outSpend)}</div><div class="v" id="o-spend">$49.99</div></div>
      </div>
      <p style="color:var(--muted);font-size:.82rem;margin-top:12px">${esc(c.note)}</p>
    </div>
  </section>

  <div class="cta">
    <h2>${esc(c.ctaH)}</h2>
    <p>${esc(c.ctaP)}</p>
    <div class="row">
      <a class="btn btn-primary" href="${STORE_URL}" target="_blank" rel="noopener">🛒 ${esc(ui.getFree)}</a>
      <a class="btn btn-ghost" href="#pro">⚡ ${esc(ui.proBtn)}</a>
    </div>
    <form class="lead capture" id="alerts">
      <p style="color:var(--muted);margin:14px 0 0">${esc(c.notReadyTool)}</p>
      <div class="f">
        <input type="email" placeholder="${esc(ui.emailPh)}" aria-label="email" />
        <input class="hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
        <button class="btn btn-primary" type="submit">${esc(ui.getAlerts)}</button>
      </div>
      <div class="msg"></div>
    </form>
  </div>

  ${pricingBlock(lang)}

  <section>
    <h2>${esc(ui.faqH)}</h2>
    ${c.faqs.map((f) => `<details><summary>${esc(f.q)}</summary><div class="a">${esc(f.a)}</div></details>`).join("\n    ")}
  </section>

  <footer>
    <p><a href="${toolsUrl(origin, lang)}">${esc(c.crumbTools)}</a> · <a href="${lang === "en" ? origin + "/drops" : origin + "/drops/" + lang}">${esc(ui.allDropGuides)}</a> · <a href="${origin}/">QuickCatch</a> · <a href="${origin}/privacy">${esc(ui.privacy)}</a></p>
  </footer>

  <script>
  (function(){
    var PRESETS = ${JSON.stringify(presets)};
    var preset = document.getElementById("preset"), qty = document.getElementById("qty"),
        retail = document.getElementById("retail"), resale = document.getElementById("resale");
    function money(n){ return "$" + (Math.round(n*100)/100).toLocaleString("en-US", {minimumFractionDigits:2, maximumFractionDigits:2}); }
    function calc(){
      var r = parseFloat(retail.value)||0, s = parseFloat(resale.value)||0, q = Math.max(1, parseInt(qty.value)||1);
      var per = s - r, save = per * q;
      document.getElementById("o-save").textContent = money(save);
      document.getElementById("o-profit").textContent = money(save);
      document.getElementById("o-margin").textContent = r > 0 ? Math.round((per/r)*100) + "%" : "—";
      document.getElementById("o-spend").textContent = money(r * q);
    }
    preset.addEventListener("change", function(){ var p = PRESETS[preset.value]; if (p){ retail.value = p.retail; resale.value = p.resale; } calc(); });
    [qty, retail, resale].forEach(function(el){ el.addEventListener("input", calc); });
    calc();
  })();
  </script>`;

  return shell(origin, head, body, lang, funnelScript(lang, c.alertDone));
}

export function toolsIndexHtml(origin: string, lang: Lang = "en"): string {
  const c = CALC[lang], ui = T[lang].ui;
  const url = toolsUrl(origin, lang);
  const head = `<title>${esc(c.idxTitle)}</title>
<meta name="description" content="${esc(c.idxDesc)}" />
<link rel="canonical" href="${url}" />
${alternates(origin, "index")}
<meta property="og:title" content="${esc(c.idxH1)}" />
<meta property="og:image" content="${origin}/og.png" />`;
  const card = `<a class="plan" style="text-decoration:none;color:inherit;display:block" href="${calcUrl(origin, lang)}"><div class="pname" style="color:var(--accent2)">${esc(c.h1)}</div><p class="pdesc" style="margin-top:6px">${esc(c.toolBlurb)}</p></a>`;
  const body = `
  <header class="hero">
    <h1>${esc(c.idxH1)}</h1>
    <p class="lede">${esc(c.idxLede)}</p>
    <div class="row"><a class="btn btn-primary" href="${STORE_URL}" target="_blank" rel="noopener">🛒 ${esc(ui.getFree)}</a></div>
    ${langSwitcher(origin, "index", lang)}
  </header>
  <section><div class="plans">
    ${card}
  </div></section>
  <footer><p><a href="${lang === "en" ? origin + "/drops" : origin + "/drops/" + lang}">${esc(ui.allDropGuides)}</a> · <a href="${origin}/">QuickCatch</a> · <a href="${origin}/privacy">${esc(ui.privacy)}</a></p></footer>`;
  return shell(origin, head, body, lang, funnelScript(lang, c.alertDone));
}

export const TOOL_SLUGS = ["pokemon-resale-calculator"];
export { LOCALIZED_LANGS };
