// drops_i18n_content.ts — per-locale content for the glossary ("what is X") and
// best-of (curation listicle) clusters. English lives in drops_seo.ts; these
// maps cover the 11 localized languages. Keyed by slug, then language.
//
// Glossary ledes are tight definition/answer blocks (AEO: AI engines extract
// these). Best-of items are standalone localized bullets.

import type { Lang, FaqT } from "./drops_i18n";

type NEn = Exclude<Lang, "en">;

export interface GlossLoc { def: string; faqs: FaqT[]; }
export interface BestLoc { h1: string; intro: string; items: string[]; faqs: FaqT[]; }

export const WHAT_IS: Record<Lang, string> = {
  en: "What is {term}?", es: "¿Qué es {term}?", fr: "Qu'est-ce que {term} ?",
  de: "Was ist {term}?", pt: "O que é {term}?", it: "Cos'è {term}?",
  nl: "Wat is {term}?", pl: "Czym jest {term}?", ja: "{term}とは？",
  ko: "{term}란?", zh: "什么是{term}？", "zh-Hant": "什麼是{term}？",
};

export const SHORT_LIST: Record<Lang, string> = {
  en: "The short list", es: "La lista corta", fr: "La liste courte",
  de: "Die Kurzliste", pt: "A lista curta", it: "La lista breve",
  nl: "De korte lijst", pl: "Krótka lista", ja: "要点リスト",
  ko: "핵심 목록", zh: "精选清单", "zh-Hant": "精選清單",
};

// ---------------------------------------------------------------------------
// GLOSSARY
// ---------------------------------------------------------------------------
export const GLOSS_I18N: Record<string, Record<NEn, GlossLoc>> = {
  "what-is-an-elite-trainer-box": {
    es: { def: "Una Elite Trainer Box (ETB) incluye ocho o nueve sobres con fundas, dados, energías y una caja. Las ETB son el producto sellado más buscado y se agotan rápido.", faqs: [
      { q: "¿Cuántos sobres trae una ETB?", a: "La mayoría trae ocho o nueve sobres, además de fundas, dados y una caja." },
      { q: "¿Cómo cazo un restock de ETB?", a: "Abre la página del producto y activa QuickCatch. La añade al carrito en cuanto vuelve el stock." } ] },
    fr: { def: "Une Elite Trainer Box (ETB) réunit huit ou neuf boosters avec des protège-cartes, des dés, des énergies et une boîte. Les ETB sont le produit scellé le plus recherché et partent vite.", faqs: [
      { q: "Combien de boosters dans une ETB ?", a: "La plupart en contiennent huit ou neuf, plus des protège-cartes, des dés et une boîte." },
      { q: "Comment attraper un réassort d'ETB ?", a: "Ouvrez la page produit et activez QuickCatch. Il l'ajoute au panier dès le retour du stock." } ] },
    de: { def: "Eine Elite Trainer Box (ETB) bündelt acht oder neun Booster mit Sleeves, Würfeln, Energien und einer Box. ETBs sind das meistgesuchte versiegelte Produkt und schnell ausverkauft.", faqs: [
      { q: "Wie viele Booster sind in einer ETB?", a: "Meist acht oder neun Booster, dazu Sleeves, Würfel und eine Box." },
      { q: "Wie schnappe ich einen ETB-Restock?", a: "Öffne die Produktseite und stell QuickCatch scharf. Es legt sie beim Restock in den Warenkorb." } ] },
    pt: { def: "Uma Elite Trainer Box (ETB) reúne oito ou nove boosters com sleeves, dados, energias e uma caixa. As ETBs são o produto selado mais procurado e esgotam rápido.", faqs: [
      { q: "Quantos boosters tem uma ETB?", a: "A maioria tem oito ou nove boosters, além de sleeves, dados e uma caixa." },
      { q: "Como garanto um restock de ETB?", a: "Abra a página do produto e ative o QuickCatch. Ele adiciona ao carrinho assim que o estoque volta." } ] },
    it: { def: "Una Elite Trainer Box (ETB) riunisce otto o nove buste con bustine protettive, dadi, energie e una scatola. Le ETB sono il prodotto sigillato più cercato e si esauriscono in fretta.", faqs: [
      { q: "Quante buste ci sono in una ETB?", a: "La maggior parte ne ha otto o nove, più bustine, dadi e una scatola." },
      { q: "Come prendo un restock di ETB?", a: "Apri la pagina del prodotto e attiva QuickCatch. La mette nel carrello appena torna lo stock." } ] },
    nl: { def: "Een Elite Trainer Box (ETB) bundelt acht of negen boosters met sleeves, dobbelstenen, energy en een opbergdoos. ETB's zijn het meest gevolgde sealed product en snel uitverkocht.", faqs: [
      { q: "Hoeveel boosters zitten er in een ETB?", a: "Meestal acht of negen boosters, plus sleeves, dobbelstenen en een doos." },
      { q: "Hoe pak ik een ETB-restock?", a: "Open de productpagina en activeer QuickCatch. Het legt hem bij de restock in je mandje." } ] },
    pl: { def: "Elite Trainer Box (ETB) łączy osiem lub dziewięć boosterów z koszulkami, kośćmi, energiami i pudełkiem. ETB to najczęściej śledzony produkt sealed i szybko się wyprzedaje.", faqs: [
      { q: "Ile boosterów jest w ETB?", a: "Zwykle osiem lub dziewięć boosterów, plus koszulki, kości i pudełko." },
      { q: "Jak złapać restock ETB?", a: "Otwórz stronę produktu i uzbrój QuickCatch. Doda go do koszyka, gdy wróci towar." } ] },
    ja: { def: "エリートトレーナーボックス（ETB）は8〜9パックに、スリーブ、ダイス、エネルギー、収納ボックスが付きます。ETBは最も注目される未開封商品で、すぐ売り切れます。", faqs: [
      { q: "ETBには何パック入っていますか？", a: "通常8〜9パックに、スリーブ、ダイス、収納ボックスが付きます。" },
      { q: "ETBの再入荷を狙うには？", a: "商品ページを開いてQuickCatchをセットすれば、在庫が戻った瞬間にカートへ入れます。" } ] },
    ko: { def: "엘리트 트레이너 박스(ETB)는 부스터 8~9팩에 슬리브, 주사위, 에너지, 보관 박스를 더한 제품입니다. ETB는 가장 주목받는 미개봉 상품으로 금방 품절됩니다.", faqs: [
      { q: "ETB에는 부스터가 몇 팩 들어 있나요?", a: "보통 8~9팩에 슬리브, 주사위, 보관 박스가 들어 있습니다." },
      { q: "ETB 재입고를 잡으려면?", a: "상품 페이지를 열고 QuickCatch를 설정하면 재고가 돌아오는 순간 장바구니에 담습니다." } ] },
    zh: { def: "训练家强化盒（ETB）包含八到九个补充包，外加卡套、骰子、能量卡和收纳盒。ETB 是最受关注的未拆封商品，很快售罄。", faqs: [
      { q: "一个 ETB 里有几个补充包？", a: "通常是八到九个补充包，外加卡套、骰子和收纳盒。" },
      { q: "怎么抢 ETB 补货？", a: "打开商品页面并设置 QuickCatch，补货的那一刻就加入购物车。" } ] },
    "zh-Hant": { def: "訓練家強化盒（ETB）包含八到九個補充包，外加卡套、骰子、能量卡和收納盒。ETB 是最受關注的未拆封商品，很快售罄。", faqs: [
      { q: "一個 ETB 裡有幾個補充包？", a: "通常是八到九個補充包，外加卡套、骰子和收納盒。" },
      { q: "怎麼搶 ETB 補貨？", a: "打開商品頁面並設定 QuickCatch，補貨的那一刻就加入購物車。" } ] },
  },
  "what-is-a-booster-box": {
    es: { def: "Una booster box es una caja sellada de sobres de un mismo set, normalmente treinta y seis. Da las mejores probabilidades para las cartas chase, por eso se agota en tienda.", faqs: [
      { q: "¿Cuántos sobres trae una booster box?", a: "Una booster box moderna de Pokémon suele traer treinta y seis sobres de un set." },
      { q: "¿Cómo cazo un restock de booster box?", a: "Activa QuickCatch en la página y la añade al carrito en cuanto vuelve el stock." } ] },
    fr: { def: "Une booster box est une caisse scellée de boosters d'un même set, généralement trente-six. Elle offre les meilleures chances pour les cartes chase, d'où sa rupture rapide.", faqs: [
      { q: "Combien de boosters dans une booster box ?", a: "Une booster box Pokémon moderne contient généralement trente-six boosters d'un set." },
      { q: "Comment attraper un réassort de booster box ?", a: "Activez QuickCatch sur la page et il l'ajoute au panier dès le retour du stock." } ] },
    de: { def: "Eine Booster Box ist ein versiegeltes Display mit Boostern eines Sets, meist sechsunddreißig. Sie bietet die besten Chancen auf Chase-Karten, daher ist sie schnell ausverkauft.", faqs: [
      { q: "Wie viele Booster sind in einer Booster Box?", a: "Eine moderne Pokémon-Booster-Box enthält meist sechsunddreißig Booster eines Sets." },
      { q: "Wie schnappe ich einen Booster-Box-Restock?", a: "Stell QuickCatch auf der Seite scharf, es legt sie beim Restock in den Warenkorb." } ] },
    pt: { def: "Uma booster box é uma caixa selada de boosters de um mesmo set, normalmente trinta e seis. Dá as melhores chances de cartas chase, por isso esgota na loja.", faqs: [
      { q: "Quantos boosters tem uma booster box?", a: "Uma booster box moderna de Pokémon costuma ter trinta e seis boosters de um set." },
      { q: "Como garanto um restock de booster box?", a: "Ative o QuickCatch na página e ele adiciona ao carrinho assim que o estoque volta." } ] },
    it: { def: "Una booster box è una scatola sigillata di buste di un set, di solito trentasei. Offre le migliori probabilità per le carte chase, perciò va esaurita in fretta.", faqs: [
      { q: "Quante buste ci sono in una booster box?", a: "Una booster box Pokémon moderna ne ha di solito trentasei di un set." },
      { q: "Come prendo un restock di booster box?", a: "Attiva QuickCatch sulla pagina e la mette nel carrello appena torna lo stock." } ] },
    nl: { def: "Een booster box is een verzegelde doos met boosters van één set, meestal zesendertig. Het geeft de beste kans op chase-kaarten, dus het is snel uitverkocht.", faqs: [
      { q: "Hoeveel boosters zitten er in een booster box?", a: "Een moderne Pokémon-booster-box bevat meestal zesendertig boosters van één set." },
      { q: "Hoe pak ik een booster-box-restock?", a: "Activeer QuickCatch op de pagina en het legt hem bij de restock in je mandje." } ] },
    pl: { def: "Booster box to zapieczętowane pudło boosterów z jednego setu, zwykle trzydzieści sześć. Daje najlepsze szanse na karty chase, dlatego szybko się wyprzedaje.", faqs: [
      { q: "Ile boosterów jest w booster boxie?", a: "Nowoczesny booster box Pokémon ma zwykle trzydzieści sześć boosterów z jednego setu." },
      { q: "Jak złapać restock booster boxa?", a: "Uzbrój QuickCatch na stronie, a doda go do koszyka, gdy wróci towar." } ] },
    ja: { def: "ブースターボックスは1つのセットのパックをまとめた未開封の箱で、通常36パックです。チェイスカードを狙う最良の方法なので、店頭ですぐ売り切れます。", faqs: [
      { q: "ブースターボックスには何パック入っていますか？", a: "現行のポケモンのブースターボックスは通常36パックです。" },
      { q: "ブースターボックスの再入荷を狙うには？", a: "ページでQuickCatchをセットすれば、在庫が戻った瞬間にカートへ入れます。" } ] },
    ko: { def: "부스터 박스는 한 세트의 부스터를 모은 미개봉 박스로 보통 36팩입니다. 체이스 카드 확률이 가장 높아 매장에서 금방 품절됩니다.", faqs: [
      { q: "부스터 박스에는 몇 팩이 들어 있나요?", a: "최신 포켓몬 부스터 박스는 보통 한 세트 36팩입니다." },
      { q: "부스터 박스 재입고를 잡으려면?", a: "페이지에서 QuickCatch를 설정하면 재고가 돌아오는 순간 장바구니에 담습니다." } ] },
    zh: { def: "补充包盒是一整盒同一系列的补充包，通常 36 包。它给你最高的稀有卡概率，所以在店里很快售罄。", faqs: [
      { q: "一盒补充包盒里有几包？", a: "现代宝可梦补充包盒通常是同一系列 36 包。" },
      { q: "怎么抢补充包盒补货？", a: "在页面上设置 QuickCatch，补货的那一刻就加入购物车。" } ] },
    "zh-Hant": { def: "補充包盒是一整盒同一系列的補充包，通常 36 包。它給你最高的稀有卡機率，所以在店裡很快售罄。", faqs: [
      { q: "一盒補充包盒裡有幾包？", a: "現代寶可夢補充包盒通常是同一系列 36 包。" },
      { q: "怎麼搶補充包盒補貨？", a: "在頁面上設定 QuickCatch，補貨的那一刻就加入購物車。" } ] },
  },
  "what-is-an-ultra-premium-collection": {
    es: { def: "Una Ultra-Premium Collection (UPC) es el producto sellado de mayor nivel de un set: trae más sobres y extras premium como cartas metálicas, un pin y una caja de colección.", faqs: [
      { q: "¿Qué trae una UPC?", a: "Los máximos sobres del set más extras premium: cartas metálicas, un pin y una caja expositora." },
      { q: "¿Cómo cazo un restock de UPC?", a: "Activa QuickCatch en la página y la añade al carrito en cuanto vuelve el stock." } ] },
    fr: { def: "Une Ultra-Premium Collection (UPC) est le produit scellé haut de gamme d'un set : le plus de boosters plus des extras premium comme des cartes métal, un pin's et une boîte.", faqs: [
      { q: "Que contient une UPC ?", a: "Le plus de boosters du set, plus des extras premium : cartes métal, pin's et boîte de présentation." },
      { q: "Comment attraper un réassort d'UPC ?", a: "Activez QuickCatch sur la page et il l'ajoute au panier dès le retour du stock." } ] },
    de: { def: "Eine Ultra-Premium Collection (UPC) ist das Spitzen-Sealed-Produkt eines Sets: die meisten Booster plus Premium-Extras wie Metallkarten, ein Pin und eine Sammelbox.", faqs: [
      { q: "Was ist in einer UPC?", a: "Die meisten Booster des Sets plus Premium-Extras: Metallkarten, ein Pin und eine Display-Box." },
      { q: "Wie schnappe ich einen UPC-Restock?", a: "Stell QuickCatch auf der Seite scharf, es legt sie beim Restock in den Warenkorb." } ] },
    pt: { def: "Uma Ultra-Premium Collection (UPC) é o produto selado de topo de um set: mais boosters e extras premium como cartas metálicas, um pin e uma caixa de coleção.", faqs: [
      { q: "O que vem numa UPC?", a: "O máximo de boosters do set, mais extras premium: cartas metálicas, um pin e uma caixa." },
      { q: "Como garanto um restock de UPC?", a: "Ative o QuickCatch na página e ele adiciona ao carrinho assim que o estoque volta." } ] },
    it: { def: "Una Ultra-Premium Collection (UPC) è il prodotto sigillato di punta di un set: il massimo delle buste più extra premium come carte metalliche, una spilla e una scatola.", faqs: [
      { q: "Cosa contiene una UPC?", a: "Il massimo delle buste del set più extra premium: carte metalliche, una spilla e una scatola." },
      { q: "Come prendo un restock di UPC?", a: "Attiva QuickCatch sulla pagina e la mette nel carrello appena torna lo stock." } ] },
    nl: { def: "Een Ultra-Premium Collection (UPC) is het topproduct van een set: de meeste boosters plus premium-extra's zoals metalen kaarten, een pin en een verzameldoos.", faqs: [
      { q: "Wat zit er in een UPC?", a: "De meeste boosters van de set plus premium-extra's: metalen kaarten, een pin en een doos." },
      { q: "Hoe pak ik een UPC-restock?", a: "Activeer QuickCatch op de pagina en het legt hem bij de restock in je mandje." } ] },
    pl: { def: "Ultra-Premium Collection (UPC) to topowy produkt sealed danego setu: najwięcej boosterów plus dodatki premium, jak metalowe karty, pin i pudełko kolekcjonerskie.", faqs: [
      { q: "Co jest w UPC?", a: "Najwięcej boosterów z setu plus dodatki premium: metalowe karty, pin i pudełko." },
      { q: "Jak złapać restock UPC?", a: "Uzbrój QuickCatch na stronie, a doda go do koszyka, gdy wróci towar." } ] },
    ja: { def: "ウルトラプレミアムコレクション（UPC）はセット最上位の未開封商品で、最も多くのパックに加え、メタルカードやピン、コレクションボックスが付きます。", faqs: [
      { q: "UPCには何が入っていますか？", a: "セット最多のパックに加え、メタルカードやピン、ディスプレイボックスが付きます。" },
      { q: "UPCの再入荷を狙うには？", a: "ページでQuickCatchをセットすれば、在庫が戻った瞬間にカートへ入れます。" } ] },
    ko: { def: "울트라 프리미엄 컬렉션(UPC)은 세트 최상위 미개봉 상품으로, 가장 많은 부스터에 메탈 카드, 핀, 컬렉션 박스 같은 프리미엄 구성을 더합니다.", faqs: [
      { q: "UPC에는 무엇이 들어 있나요?", a: "세트에서 가장 많은 부스터에 메탈 카드, 핀, 디스플레이 박스가 들어 있습니다." },
      { q: "UPC 재입고를 잡으려면?", a: "페이지에서 QuickCatch를 설정하면 재고가 돌아오는 순간 장바구니에 담습니다." } ] },
    zh: { def: "究极豪华收藏（UPC）是一个系列最高规格的未拆封商品：补充包最多，还有金属卡、徽章和收藏盒等高端配件。", faqs: [
      { q: "UPC 里有什么？", a: "该系列最多的补充包，外加金属卡、徽章和展示盒等高端配件。" },
      { q: "怎么抢 UPC 补货？", a: "在页面上设置 QuickCatch，补货的那一刻就加入购物车。" } ] },
    "zh-Hant": { def: "究極豪華收藏（UPC）是一個系列最高規格的未拆封商品：補充包最多，還有金屬卡、徽章和收藏盒等高端配件。", faqs: [
      { q: "UPC 裡有什麼？", a: "該系列最多的補充包，外加金屬卡、徽章和展示盒等高端配件。" },
      { q: "怎麼搶 UPC 補貨？", a: "在頁面上設定 QuickCatch，補貨的那一刻就加入購物車。" } ] },
  },
  "what-is-a-booster-bundle": {
    es: { def: "Un booster bundle es un paquete pequeño de seis sobres sin extras. Es la forma sellada más barata de entrar a un set, por eso se agota primero en cada restock.", faqs: [
      { q: "¿Cuántos sobres trae un bundle?", a: "Un booster bundle trae seis sobres sin accesorios." },
      { q: "¿Cómo cazo un restock de bundle?", a: "Activa QuickCatch en la página y lo añade al carrito en cuanto vuelve el stock." } ] },
    fr: { def: "Un booster bundle est un petit pack de six boosters sans extras. C'est l'entrée scellée la moins chère d'un set, d'où sa rupture en premier à chaque réassort.", faqs: [
      { q: "Combien de boosters dans un bundle ?", a: "Un booster bundle contient six boosters sans accessoires." },
      { q: "Comment attraper un réassort de bundle ?", a: "Activez QuickCatch sur la page et il l'ajoute au panier dès le retour du stock." } ] },
    de: { def: "Ein Booster Bundle ist eine kleine Packung mit sechs Boostern ohne Extras. Es ist der günstigste versiegelte Einstieg in ein Set, daher zuerst ausverkauft.", faqs: [
      { q: "Wie viele Booster sind in einem Bundle?", a: "Ein Booster Bundle enthält sechs Booster ohne Zubehör." },
      { q: "Wie schnappe ich einen Bundle-Restock?", a: "Stell QuickCatch auf der Seite scharf, es legt es beim Restock in den Warenkorb." } ] },
    pt: { def: "Um booster bundle é um pacote pequeno de seis boosters sem extras. É a forma selada mais barata de entrar num set, por isso esgota primeiro em cada restock.", faqs: [
      { q: "Quantos boosters tem um bundle?", a: "Um booster bundle tem seis boosters sem acessórios." },
      { q: "Como garanto um restock de bundle?", a: "Ative o QuickCatch na página e ele adiciona ao carrinho assim que o estoque volta." } ] },
    it: { def: "Un booster bundle è una piccola confezione di sei buste senza extra. È l'ingresso sigillato più economico in un set, perciò si esaurisce per primo a ogni restock.", faqs: [
      { q: "Quante buste ci sono in un bundle?", a: "Un booster bundle ha sei buste senza accessori." },
      { q: "Come prendo un restock di bundle?", a: "Attiva QuickCatch sulla pagina e lo mette nel carrello appena torna lo stock." } ] },
    nl: { def: "Een booster bundle is een klein pakket van zes boosters zonder extra's. Het is de goedkoopste sealed instap in een set, dus als eerste uitverkocht.", faqs: [
      { q: "Hoeveel boosters zitten er in een bundle?", a: "Een booster bundle bevat zes boosters zonder accessoires." },
      { q: "Hoe pak ik een bundle-restock?", a: "Activeer QuickCatch op de pagina en het legt hem bij de restock in je mandje." } ] },
    pl: { def: "Booster bundle to małe opakowanie sześciu boosterów bez dodatków. To najtańsze sealed wejście w set, dlatego wyprzedaje się jako pierwsze.", faqs: [
      { q: "Ile boosterów jest w bundle?", a: "Booster bundle ma sześć boosterów bez akcesoriów." },
      { q: "Jak złapać restock bundle?", a: "Uzbrój QuickCatch na stronie, a doda go do koszyka, gdy wróci towar." } ] },
    ja: { def: "ブースターバンドルはおまけなしの6パック入りの小さな商品です。セットへの最も安い未開封の入口なので、再入荷でまず売り切れます。", faqs: [
      { q: "バンドルには何パック入っていますか？", a: "ブースターバンドルはおまけなしの6パックです。" },
      { q: "バンドルの再入荷を狙うには？", a: "ページでQuickCatchをセットすれば、在庫が戻った瞬間にカートへ入れます。" } ] },
    ko: { def: "부스터 번들은 추가 구성 없이 부스터 6팩이 들어간 작은 제품입니다. 세트로 들어가는 가장 저렴한 미개봉 상품이라 재입고에서 가장 먼저 품절됩니다.", faqs: [
      { q: "번들에는 몇 팩이 들어 있나요?", a: "부스터 번들은 추가 구성 없이 6팩입니다." },
      { q: "번들 재입고를 잡으려면?", a: "페이지에서 QuickCatch를 설정하면 재고가 돌아오는 순간 장바구니에 담습니다." } ] },
    zh: { def: "补充包套装是只含六个补充包、没有额外配件的小商品。它是进入一个系列最便宜的未拆封选择，所以补货时最先售罄。", faqs: [
      { q: "一个套装里有几包？", a: "补充包套装含六个补充包，没有配件。" },
      { q: "怎么抢套装补货？", a: "在页面上设置 QuickCatch，补货的那一刻就加入购物车。" } ] },
    "zh-Hant": { def: "補充包套裝是只含六個補充包、沒有額外配件的小商品。它是進入一個系列最便宜的未拆封選擇，所以補貨時最先售罄。", faqs: [
      { q: "一個套裝裡有幾包？", a: "補充包套裝含六個補充包，沒有配件。" },
      { q: "怎麼搶套裝補貨？", a: "在頁面上設定 QuickCatch，補貨的那一刻就加入購物車。" } ] },
  },
  "what-is-a-cook-group": {
    es: { def: "Un cook group es una comunidad de pago, normalmente en Discord, que vende acceso a monitores de restock, bots, proxies y guías para comprar drops limitados. Es para revendedores.", faqs: [
      { q: "¿Necesito un cook group para cazar un drop?", a: "No. QuickCatch hace la parte de cazar desde tu propio navegador, gratis y sin cuota mensual." },
      { q: "¿Cuánto cuesta un cook group?", a: "Casi todos cobran al mes, más el coste de bots y proxies, que solo compensa si compras al por mayor." } ] },
    fr: { def: "Un cook group est une communauté payante, souvent sur Discord, qui vend l'accès à des monitors, des bots, des proxys et des guides pour acheter des drops limités. C'est pour les revendeurs.", faqs: [
      { q: "Ai-je besoin d'un cook group pour attraper un drop ?", a: "Non. QuickCatch fait la partie capture depuis votre navigateur, gratuitement et sans abonnement." },
      { q: "Combien coûte un cook group ?", a: "La plupart facturent au mois, plus le coût des bots et proxys, rentable seulement en achetant en gros." } ] },
    de: { def: "Eine Cook Group ist eine bezahlte Community, meist auf Discord, die Zugang zu Restock-Monitoren, Bots, Proxys und Guides für limitierte Drops verkauft. Sie ist für Reseller.", faqs: [
      { q: "Brauche ich eine Cook Group für einen Drop?", a: "Nein. QuickCatch übernimmt den Catch aus deinem Browser, kostenlos und ohne Abo." },
      { q: "Was kostet eine Cook Group?", a: "Meist monatlich, plus Kosten für Bots und Proxys, lohnt sich nur bei Mengenkauf." } ] },
    pt: { def: "Um cook group é uma comunidade paga, normalmente no Discord, que vende acesso a monitores de restock, bots, proxies e guias para comprar drops limitados. É para revendedores.", faqs: [
      { q: "Preciso de um cook group para garantir um drop?", a: "Não. O QuickCatch faz a parte de garantir pelo seu navegador, grátis e sem mensalidade." },
      { q: "Quanto custa um cook group?", a: "Quase todos cobram por mês, mais o custo de bots e proxies, só compensa comprando em volume." } ] },
    it: { def: "Un cook group è una community a pagamento, di solito su Discord, che vende accesso a monitor di restock, bot, proxy e guide per comprare drop limitati. È per i rivenditori.", faqs: [
      { q: "Mi serve un cook group per prendere un drop?", a: "No. QuickCatch fa la parte di presa dal tuo browser, gratis e senza abbonamento." },
      { q: "Quanto costa un cook group?", a: "Quasi tutti costano al mese, più bot e proxy, conviene solo comprando in grande quantità." } ] },
    nl: { def: "Een cook group is een betaalde community, meestal op Discord, die toegang verkoopt tot restock-monitors, bots, proxy's en gidsen voor limited drops. Het is voor verkopers.", faqs: [
      { q: "Heb ik een cook group nodig voor een drop?", a: "Nee. QuickCatch doet het vangen vanuit je eigen browser, gratis en zonder abonnement." },
      { q: "Wat kost een cook group?", a: "Meestal per maand, plus de kosten van bots en proxy's, alleen rendabel bij bulk kopen." } ] },
    pl: { def: "Cook group to płatna społeczność, zwykle na Discordzie, która sprzedaje dostęp do monitorów restocków, botów, proxy i poradników do kupowania limitowanych dropów. Jest dla odsprzedawców.", faqs: [
      { q: "Czy potrzebuję cook group, by złapać drop?", a: "Nie. QuickCatch robi część łapiącą z Twojej przeglądarki, za darmo i bez abonamentu." },
      { q: "Ile kosztuje cook group?", a: "Zwykle co miesiąc, plus koszt botów i proxy, opłaca się tylko przy zakupach hurtowych." } ] },
    ja: { def: "クックグループは、再入荷モニター、ボット、プロキシ、攻略ガイドへのアクセスを販売する有料コミュニティ（多くはDiscord）です。転売者向けです。", faqs: [
      { q: "ドロップを狙うのにクックグループは必要ですか？", a: "いいえ。QuickCatchが取得の部分をあなたのブラウザで、無料・月額なしで行います。" },
      { q: "クックグループの費用は？", a: "多くは月額で、さらにボットとプロキシの費用がかかり、大量購入でなければ割に合いません。" } ] },
    ko: { def: "쿡 그룹은 재입고 모니터, 봇, 프록시, 가이드 접근권을 파는 유료 커뮤니티(주로 디스코드)입니다. 리셀러를 위한 것입니다.", faqs: [
      { q: "드롭을 잡으려면 쿡 그룹이 필요한가요?", a: "아니요. QuickCatch가 잡는 부분을 당신의 브라우저에서 무료로, 월 요금 없이 처리합니다." },
      { q: "쿡 그룹 비용은 얼마인가요?", a: "대부분 월 단위이고 봇·프록시 비용이 더해져, 대량 구매가 아니면 수지가 맞지 않습니다." } ] },
    zh: { def: "cook group 是付费社群（多在 Discord），出售补货监控、机器人、代理和攻略的访问权限。它面向转卖者。", faqs: [
      { q: "抢一次 drop 需要 cook group 吗？", a: "不需要。QuickCatch 在你自己的浏览器里完成抢的部分，免费、无月费。" },
      { q: "cook group 多少钱？", a: "大多按月收费，再加上机器人和代理的成本，只有大量购买才划算。" } ] },
    "zh-Hant": { def: "cook group 是付費社群（多在 Discord），出售補貨監控、機器人、代理和攻略的存取權限。它面向轉賣者。", faqs: [
      { q: "搶一次 drop 需要 cook group 嗎？", a: "不需要。QuickCatch 在你自己的瀏覽器裡完成搶的部分，免費、無月費。" },
      { q: "cook group 多少錢？", a: "大多按月收費，再加上機器人和代理的成本，只有大量購買才划算。" } ] },
  },
  "what-is-sniping-a-drop": {
    es: { def: "Cazar (snipe) un drop es estar en el botón de comprar en el instante en que vuelve el stock, antes que los demás. No necesitas un bot de servidor: QuickCatch vigila la página y lo añade al carrito al instante.", faqs: [
      { q: "¿Cazar un drop va contra las reglas?", a: "Comprar rápido no va contra las reglas. QuickCatch actúa como tú y tú completas el pago." },
      { q: "¿Necesito un bot para cazar?", a: "No. QuickCatch vigila la página desde tu navegador y lo añade al carrito en el restock." } ] },
    fr: { def: "Attraper (sniper) un drop, c'est être sur le bouton d'achat à l'instant où le stock revient, avant les autres. Pas besoin de bot serveur : QuickCatch surveille la page et l'ajoute au panier aussitôt.", faqs: [
      { q: "Sniper un drop est-il interdit ?", a: "Acheter vite n'est pas interdit. QuickCatch agit comme vous et vous finalisez le paiement." },
      { q: "Ai-je besoin d'un bot pour sniper ?", a: "Non. QuickCatch surveille la page depuis votre navigateur et l'ajoute au panier au réassort." } ] },
    de: { def: "Einen Drop zu snipen heißt, im Moment des Restocks am Kaufen-Button zu sein, vor allen anderen. Du brauchst keinen Server-Bot: QuickCatch beobachtet die Seite und legt es sofort in den Warenkorb.", faqs: [
      { q: "Ist das Snipen eines Drops verboten?", a: "Schnell kaufen ist nicht verboten. QuickCatch handelt als du und du schließt den Kauf ab." },
      { q: "Brauche ich einen Bot zum Snipen?", a: "Nein. QuickCatch beobachtet die Seite aus deinem Browser und legt es beim Restock in den Warenkorb." } ] },
    pt: { def: "Garantir (snipe) um drop é estar no botão de comprar no instante em que o estoque volta, antes dos outros. Não precisa de bot de servidor: o QuickCatch vigia a página e adiciona ao carrinho na hora.", faqs: [
      { q: "Garantir um drop é contra as regras?", a: "Comprar rápido não é contra as regras. O QuickCatch age como você e você finaliza a compra." },
      { q: "Preciso de um bot para garantir?", a: "Não. O QuickCatch vigia a página pelo seu navegador e adiciona ao carrinho no restock." } ] },
    it: { def: "Prendere (snipe) un drop significa essere sul pulsante di acquisto nell'istante in cui torna lo stock, prima degli altri. Non serve un bot da server: QuickCatch sorveglia la pagina e lo mette subito nel carrello.", faqs: [
      { q: "Prendere un drop è contro le regole?", a: "Comprare in fretta non è contro le regole. QuickCatch agisce come te e tu completi l'acquisto." },
      { q: "Mi serve un bot per fare snipe?", a: "No. QuickCatch sorveglia la pagina dal tuo browser e lo mette nel carrello al restock." } ] },
    nl: { def: "Een drop snipen betekent op de koopknop staan op het moment dat de voorraad terugkomt, vóór de rest. Je hebt geen serverbot nodig: QuickCatch volgt de pagina en legt het meteen in je mandje.", faqs: [
      { q: "Is een drop snipen tegen de regels?", a: "Snel kopen is niet tegen de regels. QuickCatch handelt als jou en jij rekent af." },
      { q: "Heb ik een bot nodig om te snipen?", a: "Nee. QuickCatch volgt de pagina vanuit je browser en legt het bij de restock in je mandje." } ] },
    pl: { def: "Snajpowanie dropu to bycie przy przycisku kupna w chwili powrotu towaru, przed innymi. Nie potrzebujesz bota serwerowego: QuickCatch obserwuje stronę i od razu dodaje do koszyka.", faqs: [
      { q: "Czy snajpowanie dropu łamie zasady?", a: "Szybki zakup nie łamie zasad. QuickCatch działa jako Ty, a Ty finalizujesz zakup." },
      { q: "Czy potrzebuję bota, by snajpować?", a: "Nie. QuickCatch obserwuje stronę z Twojej przeglądarki i dodaje do koszyka przy restocku." } ] },
    ja: { def: "ドロップをスナイプするとは、在庫が戻った瞬間に、誰よりも早く購入ボタンに着くことです。サーバーボットは不要で、QuickCatchがページを見張り、すぐにカートへ入れます。", faqs: [
      { q: "ドロップのスナイプはルール違反ですか？", a: "早く買うこと自体は違反ではありません。QuickCatchはあなたとして動き、購入はあなたが完了します。" },
      { q: "スナイプにボットは必要ですか？", a: "いいえ。QuickCatchがブラウザからページを見張り、再入荷時にカートへ入れます。" } ] },
    ko: { def: "드롭을 스나이핑한다는 것은 재고가 돌아오는 순간 남보다 먼저 구매 버튼에 닿는 것입니다. 서버 봇은 필요 없고, QuickCatch가 페이지를 감시해 바로 장바구니에 담습니다.", faqs: [
      { q: "드롭 스나이핑은 규정 위반인가요?", a: "빠르게 사는 것 자체는 위반이 아닙니다. QuickCatch는 당신으로서 작동하고 결제는 당신이 합니다." },
      { q: "스나이핑에 봇이 필요한가요?", a: "아니요. QuickCatch가 브라우저에서 페이지를 감시하고 재입고 시 장바구니에 담습니다." } ] },
    zh: { def: "狙击（snipe）一次 drop，就是在补货的那一刻比所有人更快点到购买按钮。你不需要服务器机器人：QuickCatch 盯住页面并立刻加入购物车。", faqs: [
      { q: "狙击一次 drop 违反规则吗？", a: "快速购买本身不违规。QuickCatch 以你的身份运行，结账由你完成。" },
      { q: "狙击需要机器人吗？", a: "不需要。QuickCatch 在浏览器里盯住页面，补货时加入购物车。" } ] },
    "zh-Hant": { def: "狙擊（snipe）一次 drop，就是在補貨的那一刻比所有人更快點到購買按鈕。你不需要伺服器機器人：QuickCatch 盯住頁面並立刻加入購物車。", faqs: [
      { q: "狙擊一次 drop 違反規則嗎？", a: "快速購買本身不違規。QuickCatch 以你的身分運行，結帳由你完成。" },
      { q: "狙擊需要機器人嗎？", a: "不需要。QuickCatch 在瀏覽器裡盯住頁面，補貨時加入購物車。" } ] },
  },
  "what-is-an-aio-bot": {
    es: { def: "Un bot AIO (todo en uno) es software que compra drops limitados de forma automática en muchas webs. Funciona desde servidores con proxies y es para revendedores, justo el tráfico que las tiendas bloquean.", faqs: [
      { q: "¿Por qué bloquean a los bots AIO?", a: "Las tiendas detectan el tráfico de centro de datos y el pago automático, y lo bloquean o banean." },
      { q: "¿Cuál es la alternativa para un coleccionista?", a: "QuickCatch funciona en tu navegador y tu sesión, así que llega a las mismas páginas que tú, y es gratis." } ] },
    fr: { def: "Un bot AIO (tout-en-un) est un logiciel qui achète automatiquement des drops limités sur de nombreux sites. Il tourne sur des serveurs avec des proxys, pour les revendeurs, le trafic que les boutiques bloquent.", faqs: [
      { q: "Pourquoi les bots AIO sont-ils bloqués ?", a: "Les boutiques détectent le trafic de centre de données et le paiement auto, puis bloquent ou bannissent." },
      { q: "Quelle alternative pour un collectionneur ?", a: "QuickCatch tourne dans votre navigateur et votre session, atteint les mêmes pages que vous, et c'est gratuit." } ] },
    de: { def: "Ein AIO-Bot (All-in-One) ist Software, die limitierte Drops automatisch auf vielen Seiten kauft. Er läuft auf Servern mit Proxys, für Reseller, also genau der Traffic, den Shops blockieren.", faqs: [
      { q: "Warum werden AIO-Bots blockiert?", a: "Shops erkennen Rechenzentrums-Traffic und Auto-Checkout und blockieren oder bannen ihn." },
      { q: "Was ist die Alternative für Sammler?", a: "QuickCatch läuft in deinem Browser und deiner Sitzung, erreicht dieselben Seiten wie du, und ist kostenlos." } ] },
    pt: { def: "Um bot AIO (tudo em um) é um software que compra drops limitados automaticamente em muitos sites. Roda em servidores com proxies e é para revendedores, exatamente o tráfego que as lojas bloqueiam.", faqs: [
      { q: "Por que os bots AIO são bloqueados?", a: "As lojas detectam tráfego de data center e compra automática, e bloqueiam ou banem." },
      { q: "Qual é a alternativa para um colecionador?", a: "O QuickCatch roda no seu navegador e na sua sessão, alcança as mesmas páginas que você, e é grátis." } ] },
    it: { def: "Un bot AIO (all-in-one) è un software che compra drop limitati in automatico su molti siti. Gira su server con proxy ed è per i rivenditori, proprio il traffico che i negozi bloccano.", faqs: [
      { q: "Perché i bot AIO vengono bloccati?", a: "I negozi rilevano il traffico da data center e l'acquisto automatico, e lo bloccano o bannano." },
      { q: "Qual è l'alternativa per un collezionista?", a: "QuickCatch gira nel tuo browser e nella tua sessione, raggiunge le stesse pagine che vedi tu, ed è gratis." } ] },
    nl: { def: "Een AIO-bot (all-in-one) is software die limited drops automatisch op veel sites koopt. Hij draait op servers met proxy's en is voor verkopers, precies het verkeer dat winkels blokkeren.", faqs: [
      { q: "Waarom worden AIO-bots geblokkeerd?", a: "Winkels herkennen datacenterverkeer en automatisch afrekenen en blokkeren of bannen het." },
      { q: "Wat is het alternatief voor een verzamelaar?", a: "QuickCatch draait in je browser en je sessie, bereikt dezelfde pagina's als jij, en is gratis." } ] },
    pl: { def: "Bot AIO (all-in-one) to oprogramowanie, które automatycznie kupuje limitowane dropy na wielu stronach. Działa na serwerach z proxy i jest dla odsprzedawców, czyli ruchu, który sklepy blokują.", faqs: [
      { q: "Dlaczego boty AIO są blokowane?", a: "Sklepy wykrywają ruch z centrum danych i automatyczny zakup, po czym blokują lub banują." },
      { q: "Jaka jest alternatywa dla kolekcjonera?", a: "QuickCatch działa w Twojej przeglądarce i sesji, dociera do tych samych stron co Ty, i jest darmowy." } ] },
    ja: { def: "AIOボット（オールインワン）は、多くのサイトで限定ドロップを自動購入するソフトです。プロキシ付きサーバーで動き、転売者向けで、まさに店が止める通信です。", faqs: [
      { q: "なぜAIOボットはブロックされるのですか？", a: "店はデータセンターの通信と自動購入を検知し、ブロックやBANを行います。" },
      { q: "コレクター向けの代替は？", a: "QuickCatchはあなたのブラウザとセッションで動き、同じページに届き、しかも無料です。" } ] },
    ko: { def: "AIO 봇(올인원)은 여러 사이트에서 한정 드롭을 자동으로 구매하는 소프트웨어입니다. 프록시를 쓰는 서버에서 돌아가며 리셀러용이라, 바로 상점이 차단하는 트래픽입니다.", faqs: [
      { q: "왜 AIO 봇은 차단되나요?", a: "상점은 데이터센터 트래픽과 자동 결제를 감지해 차단하거나 밴합니다." },
      { q: "컬렉터를 위한 대안은?", a: "QuickCatch는 당신의 브라우저와 세션에서 돌아가 같은 페이지에 닿고, 무료입니다." } ] },
    zh: { def: "AIO（全能）机器人是能在很多网站自动抢购限量 drop 的软件。它通过代理在服务器上运行，面向转卖者，正是商店会封锁的流量。", faqs: [
      { q: "为什么 AIO 机器人会被封？", a: "商店会检测数据中心流量和自动结账，然后封锁或封号。" },
      { q: "收藏者的替代方案是什么？", a: "QuickCatch 在你的浏览器和会话里运行，能到达你能到的页面，而且免费。" } ] },
    "zh-Hant": { def: "AIO（全能）機器人是能在很多網站自動搶購限量 drop 的軟體。它透過代理在伺服器上運行，面向轉賣者，正是商店會封鎖的流量。", faqs: [
      { q: "為什麼 AIO 機器人會被封？", a: "商店會偵測資料中心流量和自動結帳，然後封鎖或封號。" },
      { q: "收藏家的替代方案是什麼？", a: "QuickCatch 在你的瀏覽器和工作階段裡運行，能到達你能到的頁面，而且免費。" } ] },
  },
  "what-is-retail-vs-resale": {
    es: { def: "El precio de tienda (retail) es lo que cobra la tienda. La reventa (resale) es el precio más alto que cobra un revendedor cuando el set se agota. Cazar el restock a precio de tienda evita ese sobreprecio.", faqs: [
      { q: "¿Por qué la reventa es tan cara?", a: "Los sets se agotan en segundos, así que los revendedores los listan más caros. Cazar el restock evita el sobreprecio." },
      { q: "¿Cómo pago precio de tienda?", a: "Activa QuickCatch en la página oficial y lo añade al carrito a precio de tienda en cuanto vuelve el stock." } ] },
    fr: { def: "Le prix boutique (retail) est ce que facture le magasin. La revente (resale) est le prix plus élevé d'un revendeur une fois le set épuisé. Attraper le réassort au prix boutique évite ce surcoût.", faqs: [
      { q: "Pourquoi la revente est-elle si chère ?", a: "Les sets partent en secondes, les revendeurs montent les prix. Attraper le réassort évite le surcoût." },
      { q: "Comment payer le prix boutique ?", a: "Activez QuickCatch sur la page officielle, il l'ajoute au panier au prix boutique dès le retour du stock." } ] },
    de: { def: "Der Ladenpreis (Retail) ist, was der Shop verlangt. Resale ist der höhere Preis, den ein Reseller nach dem Ausverkauf nimmt. Den Restock zum Ladenpreis zu fangen vermeidet den Aufpreis.", faqs: [
      { q: "Warum ist Resale so teuer?", a: "Sets sind in Sekunden weg, Reseller setzen die Preise höher. Den Restock zu fangen spart den Aufpreis." },
      { q: "Wie zahle ich den Ladenpreis?", a: "Stell QuickCatch auf der offiziellen Seite scharf, es legt es beim Restock zum Ladenpreis in den Warenkorb." } ] },
    pt: { def: "O preço de loja (retail) é o que a loja cobra. A revenda (resale) é o preço mais alto que um revendedor cobra depois que o set esgota. Garantir o restock no preço de loja evita o ágio.", faqs: [
      { q: "Por que a revenda é tão cara?", a: "Os sets esgotam em segundos, então os revendedores listam mais caro. Garantir o restock evita o ágio." },
      { q: "Como pago o preço de loja?", a: "Ative o QuickCatch na página oficial e ele adiciona ao carrinho no preço de loja quando o estoque volta." } ] },
    it: { def: "Il prezzo di negozio (retail) è quello che chiede il negozio. La rivendita (resale) è il prezzo più alto di un rivenditore dopo che il set è esaurito. Prendere il restock al prezzo di negozio evita il sovrapprezzo.", faqs: [
      { q: "Perché la rivendita costa così tanto?", a: "I set finiscono in pochi secondi, i rivenditori alzano i prezzi. Prendere il restock evita il sovrapprezzo." },
      { q: "Come pago il prezzo di negozio?", a: "Attiva QuickCatch sulla pagina ufficiale e lo mette nel carrello al prezzo di negozio quando torna lo stock." } ] },
    nl: { def: "De winkelprijs (retail) is wat de winkel vraagt. Resale is de hogere prijs die een verkoper vraagt nadat de set is uitverkocht. De restock op winkelprijs pakken voorkomt die meerprijs.", faqs: [
      { q: "Waarom is resale zo duur?", a: "Sets zijn in seconden weg, dus verkopers zetten ze hoger. De restock pakken voorkomt de meerprijs." },
      { q: "Hoe betaal ik de winkelprijs?", a: "Activeer QuickCatch op de officiële pagina; het legt hem op winkelprijs in je mandje bij de restock." } ] },
    pl: { def: "Cena sklepowa (retail) to ile bierze sklep. Odsprzedaż (resale) to wyższa cena, którą bierze odsprzedawca po wyprzedaniu setu. Złapanie restocku w cenie sklepowej omija narzut.", faqs: [
      { q: "Dlaczego odsprzedaż jest tak droga?", a: "Sety znikają w sekundy, więc odsprzedawcy podbijają ceny. Złapanie restocku omija narzut." },
      { q: "Jak zapłacić cenę sklepową?", a: "Uzbrój QuickCatch na oficjalnej stronie, doda do koszyka w cenie sklepowej, gdy wróci towar." } ] },
    ja: { def: "定価（retail）は店が付ける価格です。転売（resale）は、売り切れ後に転売者が付ける高い価格です。定価の再入荷を狙えば、その上乗せを避けられます。", faqs: [
      { q: "なぜ転売はそんなに高いのですか？", a: "セットは数秒で売り切れるため、転売者が高く出します。再入荷を狙えば上乗せを避けられます。" },
      { q: "定価で買うには？", a: "公式ページでQuickCatchをセットすれば、在庫が戻った瞬間に定価でカートへ入れます。" } ] },
    ko: { def: "정가(retail)는 매장이 매기는 가격입니다. 리셀(resale)은 세트가 품절된 뒤 리셀러가 매기는 더 높은 가격입니다. 정가 재입고를 잡으면 그 웃돈을 피합니다.", faqs: [
      { q: "왜 리셀이 그렇게 비싼가요?", a: "세트가 몇 초 만에 품절되니 리셀러가 더 높게 올립니다. 재입고를 잡으면 웃돈을 피합니다." },
      { q: "정가로 사려면?", a: "공식 페이지에서 QuickCatch를 설정하면 재고가 돌아오는 순간 정가로 장바구니에 담습니다." } ] },
    zh: { def: "原价（retail）是商店收的价格。转售（resale）是售罄后转卖者收的更高价格。抢到原价补货就能避开这笔溢价。", faqs: [
      { q: "为什么转售这么贵？", a: "套装几秒就售罄，转卖者就抬价。抢到补货就能避开溢价。" },
      { q: "怎么按原价买到？", a: "在官方页面设置 QuickCatch，补货的那一刻就以原价加入购物车。" } ] },
    "zh-Hant": { def: "原價（retail）是商店收的價格。轉售（resale）是售罄後轉賣者收的更高價格。搶到原價補貨就能避開這筆溢價。", faqs: [
      { q: "為什麼轉售這麼貴？", a: "套裝幾秒就售罄，轉賣者就抬價。搶到補貨就能避開溢價。" },
      { q: "怎麼按原價買到？", a: "在官方頁面設定 QuickCatch，補貨的那一刻就以原價加入購物車。" } ] },
  },
};

// ---------------------------------------------------------------------------
// BEST-OF (curation listicles). items are standalone localized bullets.
// ---------------------------------------------------------------------------
export const BESTOF_I18N: Record<string, Record<NEn, BestLoc>> = {
  "best-pokemon-restock-trackers": {
    es: { h1: "Los mejores rastreadores de restock de Pokémon", intro: "Un rastreador de restock te avisa en cuanto vuelve un set. Los mejores van más allá y te ayudan a comprarlo.", items: [
      "QuickCatch — vigila la página en tu navegador y lo añade al carrito en el restock. Gratis, sin proxies.",
      "Monitores de restock en Discord — avisos rápidos, pero la compra depende de ti contra todos los que recibieron el aviso.",
      "Apps y páginas de stock de tiendas — oficiales y fiables para enterarte, pero sin carrito automático.",
      "Webs de consulta de stock — útiles para inventario en tienda, menos para drops online." ], faqs: [
      { q: "¿Cuál es el mejor rastreador de restock de Pokémon?", a: "QuickCatch para cazar el artículo; un monitor de Discord o app de tienda solo para enterarte." },
      { q: "¿Compran el artículo por mí?", a: "La mayoría solo avisa. QuickCatch lo añade a tu carrito en cuanto vuelve el stock." } ] },
    fr: { h1: "Les meilleurs trackers de réassort Pokémon", intro: "Un tracker de réassort vous prévient dès qu'un set revient. Les meilleurs vont plus loin et aident à l'acheter.", items: [
      "QuickCatch — surveille la page dans votre navigateur et l'ajoute au panier au réassort. Gratuit, sans proxy.",
      "Monitors de réassort Discord — alertes rapides, mais l'achat dépend de vous face à tous les autres.",
      "Apps et pages de stock des boutiques — officielles et fiables pour être averti, mais sans panier auto.",
      "Sites de consultation de stock — utiles pour l'inventaire en magasin, moins pour les drops en ligne." ], faqs: [
      { q: "Quel est le meilleur tracker de réassort Pokémon ?", a: "QuickCatch pour attraper l'article ; un monitor Discord ou une app boutique juste pour être averti." },
      { q: "Achètent-ils l'article pour moi ?", a: "La plupart ne font qu'alerter. QuickCatch l'ajoute à votre panier dès le retour du stock." } ] },
    de: { h1: "Die besten Pokémon-Restock-Tracker", intro: "Ein Restock-Tracker meldet dir, wenn ein Set zurück ist. Die besten gehen weiter und helfen beim Kauf.", items: [
      "QuickCatch — beobachtet die Seite in deinem Browser und legt es beim Restock in den Warenkorb. Kostenlos, ohne Proxys.",
      "Discord-Restock-Monitore — schnelle Alerts, aber der Kauf liegt bei dir gegen alle anderen.",
      "Shop-Apps und Stock-Seiten — offiziell und verlässlich zur Info, aber ohne Auto-Warenkorb.",
      "Stock-Suchseiten — gut für Filialbestand, weniger für Online-Drops." ], faqs: [
      { q: "Was ist der beste Pokémon-Restock-Tracker?", a: "QuickCatch zum Fangen des Artikels; ein Discord-Monitor oder eine Shop-App nur zur Info." },
      { q: "Kaufen sie den Artikel für mich?", a: "Die meisten alarmieren nur. QuickCatch legt ihn beim Restock in deinen Warenkorb." } ] },
    pt: { h1: "Os melhores rastreadores de restock de Pokémon", intro: "Um rastreador de restock avisa assim que um set volta. Os melhores vão além e ajudam a comprar.", items: [
      "QuickCatch — vigia a página no seu navegador e adiciona ao carrinho no restock. Grátis, sem proxies.",
      "Monitores de restock no Discord — alertas rápidos, mas a compra é com você contra todos os outros.",
      "Apps e páginas de estoque das lojas — oficiais e confiáveis para avisar, mas sem carrinho automático.",
      "Sites de consulta de estoque — bons para inventário em loja, menos para drops online." ], faqs: [
      { q: "Qual é o melhor rastreador de restock de Pokémon?", a: "QuickCatch para garantir o item; um monitor do Discord ou app de loja só para avisar." },
      { q: "Eles compram o item por mim?", a: "A maioria só avisa. O QuickCatch adiciona ao seu carrinho assim que o estoque volta." } ] },
    it: { h1: "I migliori tracker di restock Pokémon", intro: "Un tracker di restock ti avvisa appena un set torna. I migliori vanno oltre e ti aiutano a comprarlo.", items: [
      "QuickCatch — sorveglia la pagina nel tuo browser e lo mette nel carrello al restock. Gratis, senza proxy.",
      "Monitor di restock su Discord — avvisi rapidi, ma l'acquisto è a te contro tutti gli altri.",
      "App e pagine stock dei negozi — ufficiali e affidabili per sapere, ma senza carrello automatico.",
      "Siti di ricerca stock — utili per l'inventario in negozio, meno per i drop online." ], faqs: [
      { q: "Qual è il miglior tracker di restock Pokémon?", a: "QuickCatch per prendere l'articolo; un monitor Discord o un'app del negozio solo per sapere." },
      { q: "Comprano l'articolo per me?", a: "La maggior parte avvisa soltanto. QuickCatch lo mette nel carrello appena torna lo stock." } ] },
    nl: { h1: "De beste Pokémon-restocktrackers", intro: "Een restocktracker meldt zodra een set terug is. De beste gaan verder en helpen je kopen.", items: [
      "QuickCatch — volgt de pagina in je browser en legt het bij de restock in je mandje. Gratis, geen proxy's.",
      "Discord-restockmonitors — snelle meldingen, maar kopen is aan jou tegen alle anderen.",
      "Winkel-apps en stockpagina's — officieel en betrouwbaar voor meldingen, maar geen auto-mandje.",
      "Stock-opzoeksites — goed voor winkelvoorraad, minder voor online drops." ], faqs: [
      { q: "Wat is de beste Pokémon-restocktracker?", a: "QuickCatch om het te pakken; een Discord-monitor of winkel-app alleen voor meldingen." },
      { q: "Kopen ze het voor mij?", a: "De meeste melden alleen. QuickCatch legt het bij de restock in je mandje." } ] },
    pl: { h1: "Najlepsze trackery restocków Pokémon", intro: "Tracker restocku mówi, gdy set wraca. Najlepsze idą dalej i pomagają go kupić.", items: [
      "QuickCatch — obserwuje stronę w przeglądarce i dodaje do koszyka przy restocku. Za darmo, bez proxy.",
      "Monitory restocków na Discordzie — szybkie alerty, ale zakup jest na Tobie przeciw wszystkim.",
      "Aplikacje i strony stanu sklepów — oficjalne i pewne do informacji, ale bez auto-koszyka.",
      "Strony sprawdzania stanu — dobre do stanu w sklepie, mniej do dropów online." ], faqs: [
      { q: "Jaki jest najlepszy tracker restocków Pokémon?", a: "QuickCatch do złapania produktu; monitor na Discordzie lub app sklepu tylko do informacji." },
      { q: "Czy kupują produkt za mnie?", a: "Większość tylko powiadamia. QuickCatch dodaje do koszyka, gdy wróci towar." } ] },
    ja: { h1: "ポケモンの再入荷トラッカー best", intro: "再入荷トラッカーはセットが戻った瞬間に知らせます。優れたものはさらに購入まで助けます。", items: [
      "QuickCatch — ブラウザでページを見張り、再入荷時にカートへ入れます。無料、プロキシ不要。",
      "Discordの再入荷モニター — 通知は速いが、購入は通知を受けた全員との競争。",
      "店のアプリ・在庫ページ — 公式で確実だが、自動カートはなし。",
      "在庫検索サイト — 店頭在庫には便利、オンラインのドロップには不向き。" ], faqs: [
      { q: "最良のポケモン再入荷トラッカーは？", a: "商品を取るならQuickCatch、知らせるだけならDiscordモニターや店のアプリ。" },
      { q: "商品を代わりに買ってくれますか？", a: "多くは通知のみ。QuickCatchは再入荷時にカートへ入れます。" } ] },
    ko: { h1: "최고의 포켓몬 재입고 트래커", intro: "재입고 트래커는 세트가 돌아오는 순간 알려줍니다. 좋은 것은 한발 더 나아가 구매까지 돕습니다.", items: [
      "QuickCatch — 브라우저에서 페이지를 감시하고 재입고 시 장바구니에 담습니다. 무료, 프록시 불필요.",
      "디스코드 재입고 모니터 — 알림은 빠르지만 구매는 같은 알림을 받은 모두와의 경쟁.",
      "매장 앱·재고 페이지 — 공식적이고 믿을 만하지만 자동 장바구니는 없음.",
      "재고 조회 사이트 — 매장 재고에 유용, 온라인 드롭에는 부적합." ], faqs: [
      { q: "최고의 포켓몬 재입고 트래커는?", a: "상품을 잡으려면 QuickCatch, 알림만 원하면 디스코드 모니터나 매장 앱." },
      { q: "상품을 대신 사주나요?", a: "대부분 알림만 줍니다. QuickCatch는 재입고 시 장바구니에 담습니다." } ] },
    zh: { h1: "最好的宝可梦补货追踪器", intro: "补货追踪器在套装回归的那一刻通知你。最好的还会帮你买到。", items: [
      "QuickCatch — 在浏览器里盯住页面，补货时加入购物车。免费，无需代理。",
      "Discord 补货监控 — 通知很快，但买还是你和所有收到通知的人抢。",
      "商店 App 与库存页 — 官方可靠的通知，但没有自动加入购物车。",
      "库存查询网站 — 适合查门店库存，不太适合线上 drop。" ], faqs: [
      { q: "最好的宝可梦补货追踪器是哪个？", a: "要抢到商品选 QuickCatch；只想收到通知用 Discord 监控或商店 App。" },
      { q: "它们会替我购买吗？", a: "大多只通知。QuickCatch 会在补货时加入你的购物车。" } ] },
    "zh-Hant": { h1: "最好的寶可夢補貨追蹤器", intro: "補貨追蹤器在套裝回歸的那一刻通知你。最好的還會幫你買到。", items: [
      "QuickCatch — 在瀏覽器裡盯住頁面，補貨時加入購物車。免費，無需代理。",
      "Discord 補貨監控 — 通知很快，但買還是你和所有收到通知的人搶。",
      "商店 App 與庫存頁 — 官方可靠的通知，但沒有自動加入購物車。",
      "庫存查詢網站 — 適合查門市庫存，不太適合線上 drop。" ], faqs: [
      { q: "最好的寶可夢補貨追蹤器是哪個？", a: "要搶到商品選 QuickCatch；只想收到通知用 Discord 監控或商店 App。" },
      { q: "它們會替我購買嗎？", a: "大多只通知。QuickCatch 會在補貨時加入你的購物車。" } ] },
  },
  "best-stores-to-buy-pokemon-cards": {
    es: { h1: "Las mejores tiendas para comprar cartas Pokémon a precio de tienda", intro: "Comprar a precio de tienda es vigilar las tiendas correctas. Estas tienen los sets más buscados y los reponen.", items: [
      "Pokémon Center — exclusivas propias y los sets más nuevos, los más difíciles de pillar.",
      "Walmart — restocks frecuentes por oleadas, buenos precios, recogida y envío.",
      "Target — drops de Pokémon regulares; carrito rápido con QuickCatch.",
      "Best Buy — repone producto sellado grande como UPC.",
      "Costco y Sam's Club — packs a buen precio cuando salen online.",
      "GameStop — exclusivas y ofertas de cambio en producto sellado." ], faqs: [
      { q: "¿Dónde comprar cartas Pokémon a precio de tienda?", a: "Pokémon Center para exclusivas, Walmart y Target para restocks frecuentes, Best Buy para sellado grande." },
      { q: "¿Cómo consigo el precio de tienda?", a: "Sé el primero en el carrito. QuickCatch lo añade en cuanto vuelve el stock." } ] },
    fr: { h1: "Les meilleures boutiques pour acheter des cartes Pokémon au prix boutique", intro: "Acheter au prix boutique, c'est surveiller les bonnes enseignes. Voici celles qui ont les sets les plus chauds et les réassortissent.", items: [
      "Pokémon Center — exclusivités maison et derniers sets, les ruptures les plus dures.",
      "Walmart — réassorts fréquents par vagues, bons prix, retrait et livraison.",
      "Target — drops Pokémon réguliers ; panier rapide avec QuickCatch.",
      "Best Buy — réassortit le gros scellé comme les UPC.",
      "Costco et Sam's Club — packs à bon prix quand ils sortent en ligne.",
      "GameStop — exclusivités et offres de reprise sur le scellé." ], faqs: [
      { q: "Où acheter des cartes Pokémon au prix boutique ?", a: "Pokémon Center pour les exclusivités, Walmart et Target pour les réassorts, Best Buy pour le gros scellé." },
      { q: "Comment obtenir le prix boutique ?", a: "Soyez premier au panier. QuickCatch l'ajoute dès le retour du stock." } ] },
    de: { h1: "Die besten Shops für Pokémon-Karten zum Ladenpreis", intro: "Zum Ladenpreis kaufen heißt, die richtigen Shops zu beobachten. Diese führen die heißesten Sets und stocken sie auf.", items: [
      "Pokémon Center — Eigen-Exklusives und neueste Sets, die härtesten Sellouts.",
      "Walmart — häufige Restocks in Wellen, gute Preise, Abholung und Versand.",
      "Target — regelmäßige Pokémon-Drops; schneller Warenkorb mit QuickCatch.",
      "Best Buy — stockt großes Sealed wie UPCs auf.",
      "Costco und Sam's Club — Bundles zu guten Preisen, wenn sie online landen.",
      "GameStop — Exklusives und Inzahlungnahme auf Sealed." ], faqs: [
      { q: "Wo kauft man Pokémon-Karten zum Ladenpreis?", a: "Pokémon Center für Exklusives, Walmart und Target für Restocks, Best Buy für großes Sealed." },
      { q: "Wie bekomme ich den Ladenpreis?", a: "Sei zuerst am Warenkorb. QuickCatch legt es beim Restock rein." } ] },
    pt: { h1: "As melhores lojas para comprar cartas Pokémon no preço de loja", intro: "Comprar no preço de loja é vigiar as lojas certas. Estas têm os sets mais procurados e os repõem.", items: [
      "Pokémon Center — exclusivos próprios e os sets mais novos, os mais difíceis de pegar.",
      "Walmart — restocks frequentes em ondas, bons preços, retirada e entrega.",
      "Target — drops de Pokémon regulares; carrinho rápido com QuickCatch.",
      "Best Buy — repõe selado grande como UPCs.",
      "Costco e Sam's Club — packs a bom preço quando saem online.",
      "GameStop — exclusivos e ofertas de troca em selado." ], faqs: [
      { q: "Onde comprar cartas Pokémon no preço de loja?", a: "Pokémon Center para exclusivos, Walmart e Target para restocks, Best Buy para selado grande." },
      { q: "Como consigo o preço de loja?", a: "Seja o primeiro no carrinho. O QuickCatch adiciona assim que o estoque volta." } ] },
    it: { h1: "I migliori negozi per comprare carte Pokémon al prezzo di negozio", intro: "Comprare al prezzo di negozio significa sorvegliare i negozi giusti. Questi hanno i set più richiesti e li riforniscono.", items: [
      "Pokémon Center — esclusive proprie e i set più nuovi, i sold out più duri.",
      "Walmart — restock frequenti a ondate, buoni prezzi, ritiro e consegna.",
      "Target — drop Pokémon regolari; carrello rapido con QuickCatch.",
      "Best Buy — rifornisce il sigillato grande come le UPC.",
      "Costco e Sam's Club — bundle a buon prezzo quando escono online.",
      "GameStop — esclusive e permute sul sigillato." ], faqs: [
      { q: "Dove comprare carte Pokémon al prezzo di negozio?", a: "Pokémon Center per le esclusive, Walmart e Target per i restock, Best Buy per il sigillato grande." },
      { q: "Come ottengo il prezzo di negozio?", a: "Sii il primo al carrello. QuickCatch lo aggiunge appena torna lo stock." } ] },
    nl: { h1: "De beste winkels om Pokémon-kaarten op winkelprijs te kopen", intro: "Op winkelprijs kopen is de juiste winkels volgen. Deze hebben de populairste sets en vullen ze aan.", items: [
      "Pokémon Center — eigen exclusives en de nieuwste sets, de moeilijkste uitverkopen.",
      "Walmart — vaak restocks in golven, scherpe prijzen, afhalen en bezorgen.",
      "Target — regelmatige Pokémon-drops; snel in je mandje met QuickCatch.",
      "Best Buy — vult groot sealed zoals UPC's aan.",
      "Costco en Sam's Club — bundels tegen scherpe prijzen als ze online komen.",
      "GameStop — exclusives en inruildeals op sealed." ], faqs: [
      { q: "Waar koop je Pokémon-kaarten op winkelprijs?", a: "Pokémon Center voor exclusives, Walmart en Target voor restocks, Best Buy voor groot sealed." },
      { q: "Hoe krijg ik de winkelprijs?", a: "Wees eerst bij het mandje. QuickCatch legt het er bij de restock in." } ] },
    pl: { h1: "Najlepsze sklepy do kupna kart Pokémon w cenie sklepowej", intro: "Kupowanie w cenie sklepowej to obserwowanie właściwych sklepów. Te mają najgorętsze sety i je uzupełniają.", items: [
      "Pokémon Center — własne ekskluzywy i najnowsze sety, najtrudniejsze wyprzedaże.",
      "Walmart — częste restocki falami, dobre ceny, odbiór i dostawa.",
      "Target — regularne dropy Pokémon; szybki koszyk z QuickCatch.",
      "Best Buy — uzupełnia duże sealed, jak UPC.",
      "Costco i Sam's Club — zestawy w dobrej cenie, gdy pojawiają się online.",
      "GameStop — ekskluzywy i oferty wymiany na sealed." ], faqs: [
      { q: "Gdzie kupić karty Pokémon w cenie sklepowej?", a: "Pokémon Center po ekskluzywy, Walmart i Target po restocki, Best Buy po duże sealed." },
      { q: "Jak dostać cenę sklepową?", a: "Bądź pierwszy przy koszyku. QuickCatch doda produkt, gdy wróci towar." } ] },
    ja: { h1: "ポケモンカードを定価で買える best ストア", intro: "定価で買うには、正しい店を見張ることです。これらは人気セットを扱い、再入荷します。", items: [
      "Pokémon Center — 自社限定や最新セット。ただし最も入手困難。",
      "Walmart — 波状の頻繁な再入荷、手頃な価格、受取と配送。",
      "Target — 定期的なポケモンのドロップ。QuickCatchで素早くカートへ。",
      "Best Buy — UPCなど大型の未開封商品を再入荷。",
      "CostcoとSam's Club — オンライン入荷時に手頃なセット。",
      "GameStop — 限定品や未開封商品の下取り。" ], faqs: [
      { q: "ポケモンカードを定価で買うなら？", a: "限定はPokémon Center、頻繁な再入荷はWalmartとTarget、大型未開封はBest Buy。" },
      { q: "定価で買うには？", a: "カートに一番乗りを。QuickCatchが再入荷時に入れます。" } ] },
    ko: { h1: "포켓몬 카드를 정가로 살 수 있는 최고의 상점", intro: "정가로 사려면 알맞은 상점을 감시해야 합니다. 이들은 인기 세트를 취급하고 재입고합니다.", items: [
      "Pokémon Center — 자체 독점과 최신 세트, 가장 잡기 어려운 품절.",
      "Walmart — 물량 재입고가 잦고 가격이 좋으며 픽업과 배송 가능.",
      "Target — 정기 포켓몬 드롭; QuickCatch로 빠르게 장바구니.",
      "Best Buy — UPC 같은 대형 미개봉 상품을 재입고.",
      "Costco·Sam's Club — 온라인에 풀릴 때 좋은 가격의 묶음.",
      "GameStop — 독점과 미개봉 상품 보상 판매." ], faqs: [
      { q: "포켓몬 카드를 정가로 사려면 어디가 좋나요?", a: "독점은 Pokémon Center, 잦은 재입고는 Walmart·Target, 대형 미개봉은 Best Buy." },
      { q: "정가는 어떻게 받나요?", a: "장바구니에 먼저 닿으세요. QuickCatch가 재입고 시 담습니다." } ] },
    zh: { h1: "按原价买宝可梦卡的最佳商店", intro: "想按原价买，就要盯对商店。这些商店有最热门的套装并会补货。", items: [
      "Pokémon Center — 自家独占和最新系列，但最难抢。",
      "Walmart — 分批频繁补货，价格实惠，可自提和配送。",
      "Target — 常有宝可梦 drop；用 QuickCatch 快速加入购物车。",
      "Best Buy — 补货 UPC 等大型未拆封商品。",
      "Costco 和 Sam's Club — 上线时价格实惠的套装。",
      "GameStop — 独占以及未拆封商品的以旧换新。" ], faqs: [
      { q: "在哪里按原价买宝可梦卡最好？", a: "独占看 Pokémon Center，频繁补货看 Walmart 和 Target，大型未拆封看 Best Buy。" },
      { q: "怎么拿到原价？", a: "抢先到购物车。QuickCatch 会在补货时加入。" } ] },
    "zh-Hant": { h1: "按原價買寶可夢卡的最佳商店", intro: "想按原價買，就要盯對商店。這些商店有最熱門的套裝並會補貨。", items: [
      "Pokémon Center — 自家獨佔和最新系列，但最難搶。",
      "Walmart — 分批頻繁補貨，價格實惠，可自取和配送。",
      "Target — 常有寶可夢 drop；用 QuickCatch 快速加入購物車。",
      "Best Buy — 補貨 UPC 等大型未拆封商品。",
      "Costco 和 Sam's Club — 上線時價格實惠的套裝。",
      "GameStop — 獨佔以及未拆封商品的以舊換新。" ], faqs: [
      { q: "在哪裡按原價買寶可夢卡最好？", a: "獨佔看 Pokémon Center，頻繁補貨看 Walmart 和 Target，大型未拆封看 Best Buy。" },
      { q: "怎麼拿到原價？", a: "搶先到購物車。QuickCatch 會在補貨時加入。" } ] },
  },
  "best-pokemon-restock-bot-alternatives": {
    es: { h1: "Las mejores alternativas a un bot de restock para Pokémon", intro: "Los bots de servidor se bloquean en las tiendas. Estas alternativas llegan a la página como un comprador real.", items: [
      "QuickCatch — funciona en tu navegador, vigila la página y lo añade al carrito en el restock. Gratis.",
      "Apps de tienda con pago guardado — pago en un toque para ir rápido cuando vuelve el stock.",
      "Monitores de Discord más un pago rápido — el aviso del monitor, la velocidad de tus datos guardados.",
      "Webs de consulta de stock — ve al stock local en vez de pelear la cola online." ], faqs: [
      { q: "¿Por qué no usar un bot de restock?", a: "Los bots de servidor se marcan por IP en las tiendas. QuickCatch llega a la página como tú." },
      { q: "¿Cuál es la mejor alternativa?", a: "QuickCatch: hace el vigilar y añadir al carrito desde tu navegador, gratis." } ] },
    fr: { h1: "Les meilleures alternatives à un bot de réassort pour Pokémon", intro: "Les bots serveur sont bloqués en boutique. Ces alternatives atteignent la page comme un vrai acheteur.", items: [
      "QuickCatch — tourne dans votre navigateur, surveille la page et l'ajoute au panier au réassort. Gratuit.",
      "Apps boutique avec paiement enregistré — paiement en un geste pour aller vite au retour du stock.",
      "Monitors Discord plus un paiement rapide — l'alerte du monitor, la vitesse de vos infos enregistrées.",
      "Sites de consultation de stock — allez au stock local au lieu de la file en ligne." ], faqs: [
      { q: "Pourquoi pas un bot de réassort ?", a: "Les bots serveur sont repérés par IP. QuickCatch atteint la page comme vous." },
      { q: "Quelle est la meilleure alternative ?", a: "QuickCatch : il surveille et ajoute au panier depuis votre navigateur, gratuitement." } ] },
    de: { h1: "Die besten Alternativen zu einem Restock-Bot für Pokémon", intro: "Server-Bots werden im Handel blockiert. Diese Alternativen erreichen die Seite wie ein echter Käufer.", items: [
      "QuickCatch — läuft in deinem Browser, beobachtet die Seite und legt es beim Restock in den Warenkorb. Kostenlos.",
      "Shop-Apps mit gespeicherter Zahlung — Ein-Tipp-Checkout, um beim Restock schnell zu sein.",
      "Discord-Monitore plus schneller Checkout — Alert vom Monitor, Tempo aus deinen gespeicherten Daten.",
      "Stock-Suchseiten — fahr zum lokalen Bestand statt in die Online-Schlange." ], faqs: [
      { q: "Warum kein Restock-Bot?", a: "Server-Bots werden per IP markiert. QuickCatch erreicht die Seite wie du." },
      { q: "Was ist die beste Alternative?", a: "QuickCatch: beobachten und in den Warenkorb legen aus deinem Browser, kostenlos." } ] },
    pt: { h1: "As melhores alternativas a um bot de restock para Pokémon", intro: "Bots de servidor são bloqueados nas lojas. Estas alternativas alcançam a página como um comprador real.", items: [
      "QuickCatch — roda no seu navegador, vigia a página e adiciona ao carrinho no restock. Grátis.",
      "Apps de loja com pagamento salvo — checkout num toque para ser rápido quando o estoque volta.",
      "Monitores do Discord mais um checkout rápido — o aviso do monitor, a velocidade dos seus dados salvos.",
      "Sites de consulta de estoque — vá ao estoque local em vez de brigar na fila online." ], faqs: [
      { q: "Por que não usar um bot de restock?", a: "Bots de servidor são marcados por IP. O QuickCatch alcança a página como você." },
      { q: "Qual é a melhor alternativa?", a: "QuickCatch: faz o vigiar e adicionar ao carrinho pelo seu navegador, grátis." } ] },
    it: { h1: "Le migliori alternative a un bot di restock per Pokémon", intro: "I bot da server vengono bloccati nei negozi. Queste alternative raggiungono la pagina come un vero acquirente.", items: [
      "QuickCatch — gira nel tuo browser, sorveglia la pagina e lo mette nel carrello al restock. Gratis.",
      "App dei negozi con pagamento salvato — checkout in un tocco per essere rapido al ritorno dello stock.",
      "Monitor Discord più un checkout veloce — l'avviso dal monitor, la velocità dei tuoi dati salvati.",
      "Siti di ricerca stock — vai allo stock locale invece della coda online." ], faqs: [
      { q: "Perché non un bot di restock?", a: "I bot da server vengono segnalati per IP. QuickCatch raggiunge la pagina come te." },
      { q: "Qual è la migliore alternativa?", a: "QuickCatch: sorveglia e mette nel carrello dal tuo browser, gratis." } ] },
    nl: { h1: "De beste alternatieven voor een restockbot voor Pokémon", intro: "Serverbots worden in winkels geblokkeerd. Deze alternatieven bereiken de pagina als een echte koper.", items: [
      "QuickCatch — draait in je browser, volgt de pagina en legt het bij de restock in je mandje. Gratis.",
      "Winkel-apps met opgeslagen betaling — checkout met één tik om snel te zijn bij de restock.",
      "Discord-monitors plus snelle checkout — de melding van de monitor, de snelheid van je opgeslagen gegevens.",
      "Stock-opzoeksites — rijd naar lokale voorraad in plaats van de online wachtrij." ], faqs: [
      { q: "Waarom geen restockbot?", a: "Serverbots worden op IP gemarkeerd. QuickCatch bereikt de pagina zoals jij." },
      { q: "Wat is het beste alternatief?", a: "QuickCatch: volgen en in je mandje leggen vanuit je browser, gratis." } ] },
    pl: { h1: "Najlepsze alternatywy dla bota restocków dla Pokémon", intro: "Boty serwerowe są blokowane w sklepach. Te alternatywy docierają do strony jak prawdziwy kupujący.", items: [
      "QuickCatch — działa w przeglądarce, obserwuje stronę i dodaje do koszyka przy restocku. Za darmo.",
      "Aplikacje sklepów z zapisaną płatnością — zakup jednym dotknięciem, by być szybkim przy restocku.",
      "Monitory Discord plus szybki checkout — alert z monitora, szybkość z zapisanych danych.",
      "Strony sprawdzania stanu — jedź po towar w sklepie zamiast walczyć w kolejce online." ], faqs: [
      { q: "Czemu nie bot restocków?", a: "Boty serwerowe są oznaczane po IP. QuickCatch dociera do strony jak Ty." },
      { q: "Jaka jest najlepsza alternatywa?", a: "QuickCatch: obserwuje i dodaje do koszyka z Twojej przeglądarki, za darmo." } ] },
    ja: { h1: "ポケモン再入荷ボットの best な代替", intro: "サーバーボットは店でブロックされます。これらの代替は本物の買い手のようにページに届きます。", items: [
      "QuickCatch — ブラウザで動き、ページを見張り、再入荷時にカートへ。無料。",
      "支払い登録済みの店アプリ — ワンタップ決済で再入荷時に速く。",
      "Discordモニター＋速い決済 — 通知はモニター、速さは登録済み情報。",
      "在庫検索サイト — オンラインの行列ではなく近くの在庫へ。" ], faqs: [
      { q: "なぜ再入荷ボットを使わないの？", a: "サーバーボットはIPで識別されます。QuickCatchはあなたのようにページへ届きます。" },
      { q: "最良の代替は？", a: "QuickCatch。見張りとカート投入をブラウザから無料で行います。" } ] },
    ko: { h1: "포켓몬 재입고 봇의 최고 대안", intro: "서버 봇은 상점에서 차단됩니다. 이 대안들은 실제 구매자처럼 페이지에 닿습니다.", items: [
      "QuickCatch — 브라우저에서 돌아가 페이지를 감시하고 재입고 시 장바구니에 담습니다. 무료.",
      "결제 저장된 매장 앱 — 원탭 결제로 재입고 시 빠르게.",
      "디스코드 모니터 + 빠른 결제 — 알림은 모니터, 속도는 저장된 정보.",
      "재고 조회 사이트 — 온라인 줄 대신 가까운 매장 재고로." ], faqs: [
      { q: "왜 재입고 봇을 쓰지 않나요?", a: "서버 봇은 IP로 표시됩니다. QuickCatch는 당신처럼 페이지에 닿습니다." },
      { q: "최고의 대안은?", a: "QuickCatch — 감시와 장바구니 담기를 브라우저에서 무료로 합니다." } ] },
    zh: { h1: "宝可梦补货机器人的最佳替代", intro: "服务器机器人会被商店封锁。这些替代方案像真实买家一样到达页面。", items: [
      "QuickCatch — 在浏览器里运行，盯住页面，补货时加入购物车。免费。",
      "保存了支付的商店 App — 一键结账，补货时更快。",
      "Discord 监控加快速结账 — 监控负责通知，速度靠你保存的信息。",
      "库存查询网站 — 去附近门店拿货，而不是排线上队。" ], faqs: [
      { q: "为什么不用补货机器人？", a: "服务器机器人会按 IP 被标记。QuickCatch 像你一样到达页面。" },
      { q: "最佳替代是什么？", a: "QuickCatch：在浏览器里完成盯货和加入购物车，免费。" } ] },
    "zh-Hant": { h1: "寶可夢補貨機器人的最佳替代", intro: "伺服器機器人會被商店封鎖。這些替代方案像真實買家一樣到達頁面。", items: [
      "QuickCatch — 在瀏覽器裡運行，盯住頁面，補貨時加入購物車。免費。",
      "儲存了付款的商店 App — 一鍵結帳，補貨時更快。",
      "Discord 監控加快速結帳 — 監控負責通知，速度靠你儲存的資訊。",
      "庫存查詢網站 — 去附近門市拿貨，而不是排線上隊。" ], faqs: [
      { q: "為什麼不用補貨機器人？", a: "伺服器機器人會按 IP 被標記。QuickCatch 像你一樣到達頁面。" },
      { q: "最佳替代是什麼？", a: "QuickCatch：在瀏覽器裡完成盯貨和加入購物車，免費。" } ] },
  },
  "best-tcg-restock-trackers": {
    es: { h1: "Los mejores rastreadores de restock de TCG", intro: "Pokémon no es el único TCG que se agota en segundos. Estos cubren el hobby y QuickCatch lo añade al carrito en el restock.", items: [
      "QuickCatch — añade el artículo al carrito en el restock: Pokémon, One Piece, Lorcana, Magic, Yu-Gi-Oh.",
      "Monitores de Discord por juego — avisos de comunidad, la carrera de compra sigue siendo tuya.",
      "Apps de tiendas — aviso oficial por tienda, sin carrito automático.",
      "Alertas de TCGplayer — útiles cuando un vendedor repone producto sellado." ], faqs: [
      { q: "¿QuickCatch funciona para One Piece y Lorcana?", a: "Sí. Funciona en cualquier página de producto compatible, en todos los TCG." },
      { q: "¿Cuál es el mejor rastreador de TCG?", a: "QuickCatch para cazar el artículo; un monitor por juego solo para enterarte." } ] },
    fr: { h1: "Les meilleurs trackers de réassort TCG", intro: "Pokémon n'est pas le seul TCG à partir en secondes. Ceux-ci couvrent le hobby et QuickCatch l'ajoute au panier au réassort.", items: [
      "QuickCatch — ajoute l'article au panier au réassort : Pokémon, One Piece, Lorcana, Magic, Yu-Gi-Oh.",
      "Monitors Discord par jeu — alertes de communauté, la course à l'achat reste pour vous.",
      "Apps des boutiques — alerte officielle par enseigne, sans panier auto.",
      "Alertes TCGplayer — utiles quand un vendeur réassortit du scellé." ], faqs: [
      { q: "QuickCatch marche pour One Piece et Lorcana ?", a: "Oui. Il marche sur toute page produit compatible, tous TCG confondus." },
      { q: "Quel est le meilleur tracker TCG ?", a: "QuickCatch pour attraper l'article ; un monitor par jeu juste pour être averti." } ] },
    de: { h1: "Die besten TCG-Restock-Tracker", intro: "Pokémon ist nicht das einzige TCG, das in Sekunden ausverkauft. Diese decken das Hobby ab, und QuickCatch legt es beim Restock in den Warenkorb.", items: [
      "QuickCatch — legt den Artikel beim Restock in den Warenkorb: Pokémon, One Piece, Lorcana, Magic, Yu-Gi-Oh.",
      "Discord-Monitore pro Spiel — Community-Alerts, das Kaufrennen bleibt bei dir.",
      "Shop-Apps — offizielle Info pro Shop, kein Auto-Warenkorb.",
      "TCGplayer-Alerts — nützlich, wenn ein Verkäufer Sealed auffüllt." ], faqs: [
      { q: "Funktioniert QuickCatch für One Piece und Lorcana?", a: "Ja. Es funktioniert auf jeder unterstützten Produktseite, über alle TCGs." },
      { q: "Was ist der beste TCG-Restock-Tracker?", a: "QuickCatch zum Fangen des Artikels; ein Monitor pro Spiel nur zur Info." } ] },
    pt: { h1: "Os melhores rastreadores de restock de TCG", intro: "Pokémon não é o único TCG que esgota em segundos. Estes cobrem o hobby e o QuickCatch adiciona ao carrinho no restock.", items: [
      "QuickCatch — adiciona o item ao carrinho no restock: Pokémon, One Piece, Lorcana, Magic, Yu-Gi-Oh.",
      "Monitores de Discord por jogo — alertas da comunidade, a corrida de compra ainda é sua.",
      "Apps das lojas — aviso oficial por loja, sem carrinho automático.",
      "Alertas do TCGplayer — úteis quando um vendedor repõe selado." ], faqs: [
      { q: "O QuickCatch funciona para One Piece e Lorcana?", a: "Sim. Funciona em qualquer página de produto compatível, em todos os TCG." },
      { q: "Qual é o melhor rastreador de TCG?", a: "QuickCatch para garantir o item; um monitor por jogo só para avisar." } ] },
    it: { h1: "I migliori tracker di restock TCG", intro: "Pokémon non è l'unico TCG che si esaurisce in secondi. Questi coprono l'hobby e QuickCatch lo mette nel carrello al restock.", items: [
      "QuickCatch — mette l'articolo nel carrello al restock: Pokémon, One Piece, Lorcana, Magic, Yu-Gi-Oh.",
      "Monitor Discord per gioco — avvisi della community, la corsa all'acquisto resta a te.",
      "App dei negozi — avviso ufficiale per negozio, senza carrello automatico.",
      "Avvisi TCGplayer — utili quando un venditore rifornisce il sigillato." ], faqs: [
      { q: "QuickCatch funziona per One Piece e Lorcana?", a: "Sì. Funziona su qualsiasi pagina prodotto supportata, su tutti i TCG." },
      { q: "Qual è il miglior tracker TCG?", a: "QuickCatch per prendere l'articolo; un monitor per gioco solo per sapere." } ] },
    nl: { h1: "De beste TCG-restocktrackers", intro: "Pokémon is niet de enige TCG die in seconden uitverkoopt. Deze dekken de hobby en QuickCatch legt het bij de restock in je mandje.", items: [
      "QuickCatch — legt het item bij de restock in je mandje: Pokémon, One Piece, Lorcana, Magic, Yu-Gi-Oh.",
      "Discord-monitors per spel — community-meldingen, de koopstrijd blijft aan jou.",
      "Winkel-apps — officiële melding per winkel, geen auto-mandje.",
      "TCGplayer-meldingen — handig als een verkoper sealed aanvult." ], faqs: [
      { q: "Werkt QuickCatch voor One Piece en Lorcana?", a: "Ja. Het werkt op elke ondersteunde productpagina, voor alle TCG's." },
      { q: "Wat is de beste TCG-restocktracker?", a: "QuickCatch om het te pakken; een monitor per spel alleen voor meldingen." } ] },
    pl: { h1: "Najlepsze trackery restocków TCG", intro: "Pokémon to nie jedyne TCG, które znika w sekundy. Te obejmują całe hobby, a QuickCatch dodaje do koszyka przy restocku.", items: [
      "QuickCatch — dodaje produkt do koszyka przy restocku: Pokémon, One Piece, Lorcana, Magic, Yu-Gi-Oh.",
      "Monitory Discord na grę — alerty społeczności, wyścig zakupu wciąż na Tobie.",
      "Aplikacje sklepów — oficjalny alert na sklep, bez auto-koszyka.",
      "Alerty TCGplayer — przydatne, gdy sprzedawca uzupełnia sealed." ], faqs: [
      { q: "Czy QuickCatch działa dla One Piece i Lorcana?", a: "Tak. Działa na każdej obsługiwanej stronie produktu, w każdym TCG." },
      { q: "Jaki jest najlepszy tracker TCG?", a: "QuickCatch do złapania produktu; monitor na grę tylko do informacji." } ] },
    ja: { h1: "TCG再入荷トラッカーの best", intro: "数秒で売り切れるのはポケモンだけではありません。これらは趣味全体をカバーし、QuickCatchが再入荷時にカートへ入れます。", items: [
      "QuickCatch — 再入荷時にカートへ：ポケモン、ワンピース、ロルカナ、マジック、遊戯王。",
      "ゲーム別のDiscordモニター — コミュニティの通知、購入争いはあなた次第。",
      "店のアプリ — 店ごとの公式通知、自動カートなし。",
      "TCGplayerの通知 — 出品者が未開封を補充する時に便利。" ], faqs: [
      { q: "QuickCatchはワンピースやロルカナで使えますか？", a: "はい。対応する商品ページならどのTCGでも動きます。" },
      { q: "最良のTCG再入荷トラッカーは？", a: "取るならQuickCatch、知らせるだけならゲーム別モニター。" } ] },
    ko: { h1: "최고의 TCG 재입고 트래커", intro: "몇 초 만에 품절되는 건 포켓몬만이 아닙니다. 이들은 취미 전반을 아우르고 QuickCatch가 재입고 시 장바구니에 담습니다.", items: [
      "QuickCatch — 재입고 시 장바구니에: 포켓몬, 원피스, 로카나, 매직, 유희왕.",
      "게임별 디스코드 모니터 — 커뮤니티 알림, 구매 경쟁은 당신 몫.",
      "매장 앱 — 매장별 공식 알림, 자동 장바구니 없음.",
      "TCGplayer 알림 — 판매자가 미개봉을 보충할 때 유용." ], faqs: [
      { q: "QuickCatch가 원피스와 로카나에도 되나요?", a: "네. 지원되는 상품 페이지라면 모든 TCG에서 작동합니다." },
      { q: "최고의 TCG 재입고 트래커는?", a: "잡으려면 QuickCatch, 알림만 원하면 게임별 모니터." } ] },
    zh: { h1: "最好的 TCG 补货追踪器", intro: "几秒售罄的不止宝可梦。这些覆盖整个爱好，QuickCatch 会在补货时加入购物车。", items: [
      "QuickCatch — 补货时加入购物车：宝可梦、航海王、Lorcana、万智牌、游戏王。",
      "各游戏的 Discord 监控 — 社群通知，购买竞争还是看你。",
      "商店 App — 各店官方通知，没有自动购物车。",
      "TCGplayer 提醒 — 卖家补未拆封货时很有用。" ], faqs: [
      { q: "QuickCatch 支持航海王和 Lorcana 吗？", a: "支持。只要是受支持的商品页面，各类 TCG 都能用。" },
      { q: "最好的 TCG 补货追踪器是哪个？", a: "要抢用 QuickCatch；只想收到通知用各游戏监控。" } ] },
    "zh-Hant": { h1: "最好的 TCG 補貨追蹤器", intro: "幾秒售罄的不止寶可夢。這些涵蓋整個愛好，QuickCatch 會在補貨時加入購物車。", items: [
      "QuickCatch — 補貨時加入購物車：寶可夢、航海王、Lorcana、萬智牌、遊戲王。",
      "各遊戲的 Discord 監控 — 社群通知，購買競爭還是看你。",
      "商店 App — 各店官方通知，沒有自動購物車。",
      "TCGplayer 提醒 — 賣家補未拆封貨時很有用。" ], faqs: [
      { q: "QuickCatch 支援航海王和 Lorcana 嗎？", a: "支援。只要是受支援的商品頁面，各類 TCG 都能用。" },
      { q: "最好的 TCG 補貨追蹤器是哪個？", a: "要搶用 QuickCatch；只想收到通知用各遊戲監控。" } ] },
  },
  "best-ways-to-catch-pokemon-drops": {
    es: { h1: "Las mejores formas de cazar un drop de Pokémon", intro: "Cazar un drop se reduce a velocidad en el carrito. Estas son las jugadas de mayor impacto.", items: [
      "Activa QuickCatch antes del drop — vigila en segundo plano y lo añade al carrito en el restock.",
      "Inicia sesión con el pago guardado — reduce el checkout a segundos.",
      "Ve a por la preventa cuando la haya — reserva una copia antes de que se agote.",
      "Vigila varias tiendas a la vez — un set sale en varias; caza la primera." ], faqs: [
      { q: "¿Cuál es la mejor forma de cazar un drop?", a: "Activa QuickCatch en la página antes del drop. Lo añade al carrito en cuanto vuelve el stock." },
      { q: "¿Puedo vigilar más de una tienda?", a: "Sí. Actívalo en cada página; Pro sube cuántas puedes a la vez." } ] },
    fr: { h1: "Les meilleures façons d'attraper un drop Pokémon", intro: "Attraper un drop se résume à la vitesse au panier. Voici les actions les plus efficaces.", items: [
      "Activez QuickCatch avant le drop — il surveille en arrière-plan et l'ajoute au panier au réassort.",
      "Connectez-vous avec le paiement enregistré — réduisez le checkout à quelques secondes.",
      "Visez la précommande quand il y en a une — elle réserve un exemplaire avant la rupture.",
      "Surveillez plusieurs boutiques à la fois — un set sort sur plusieurs ; attrapez la première." ], faqs: [
      { q: "Quelle est la meilleure façon d'attraper un drop ?", a: "Activez QuickCatch sur la page avant le drop. Il l'ajoute au panier dès le retour du stock." },
      { q: "Puis-je surveiller plusieurs boutiques ?", a: "Oui. Activez-le sur chaque page ; Pro augmente le nombre simultané." } ] },
    de: { h1: "Die besten Wege, einen Pokémon-Drop zu fangen", intro: "Einen Drop zu fangen heißt Tempo am Warenkorb. Das sind die wirkungsvollsten Schritte.", items: [
      "Stell QuickCatch vor dem Drop scharf — es beobachtet im Hintergrund und legt es beim Restock in den Warenkorb.",
      "Melde dich mit gespeicherter Zahlung an — verkürze den Checkout auf Sekunden.",
      "Nimm den Vorverkauf, wenn es einen gibt — er reserviert ein Exemplar vor dem Ausverkauf.",
      "Beobachte mehrere Shops gleichzeitig — ein Set droppt in mehreren; fang den ersten." ], faqs: [
      { q: "Was ist der beste Weg, einen Drop zu fangen?", a: "Stell QuickCatch vor dem Drop auf der Seite scharf. Es legt es beim Restock in den Warenkorb." },
      { q: "Kann ich mehrere Shops beobachten?", a: "Ja. Auf jeder Seite scharfstellen; Pro erhöht die gleichzeitige Anzahl." } ] },
    pt: { h1: "As melhores formas de garantir um drop de Pokémon", intro: "Garantir um drop se resume a velocidade no carrinho. Estas são as jogadas de maior impacto.", items: [
      "Ative o QuickCatch antes do drop — vigia em segundo plano e adiciona ao carrinho no restock.",
      "Entre na conta com pagamento salvo — reduza o checkout a segundos.",
      "Vá na pré-venda quando houver — reserva uma cópia antes de esgotar.",
      "Vigie várias lojas ao mesmo tempo — um set sai em várias; garanta a primeira." ], faqs: [
      { q: "Qual é a melhor forma de garantir um drop?", a: "Ative o QuickCatch na página antes do drop. Ele adiciona ao carrinho quando o estoque volta." },
      { q: "Posso vigiar mais de uma loja?", a: "Sim. Ative em cada página; o Pro aumenta quantas ao mesmo tempo." } ] },
    it: { h1: "I modi migliori per prendere un drop Pokémon", intro: "Prendere un drop si riduce alla velocità al carrello. Queste sono le mosse a maggiore impatto.", items: [
      "Attiva QuickCatch prima del drop — sorveglia in background e lo mette nel carrello al restock.",
      "Accedi con il pagamento salvato — riduci il checkout a pochi secondi.",
      "Punta al preordine quando c'è — riserva una copia prima che si esaurisca.",
      "Sorveglia più negozi insieme — un set esce su più negozi; prendi il primo." ], faqs: [
      { q: "Qual è il modo migliore per prendere un drop?", a: "Attiva QuickCatch sulla pagina prima del drop. Lo mette nel carrello quando torna lo stock." },
      { q: "Posso sorvegliare più negozi?", a: "Sì. Attivalo su ogni pagina; Pro aumenta quanti insieme." } ] },
    nl: { h1: "De beste manieren om een Pokémon-drop te pakken", intro: "Een drop pakken draait om snelheid bij het mandje. Dit zijn de zetten met de meeste impact.", items: [
      "Activeer QuickCatch vóór de drop — het volgt op de achtergrond en legt het bij de restock in je mandje.",
      "Log in met opgeslagen betaling — kort de checkout in tot seconden.",
      "Ga voor de pre-order als die er is — reserveert een exemplaar voordat het uitverkoopt.",
      "Volg meerdere winkels tegelijk — een set komt bij meerdere; pak de eerste." ], faqs: [
      { q: "Wat is de beste manier om een drop te pakken?", a: "Activeer QuickCatch op de pagina vóór de drop. Het legt het bij de restock in je mandje." },
      { q: "Kan ik meerdere winkels volgen?", a: "Ja. Activeer het op elke pagina; Pro verhoogt hoeveel tegelijk." } ] },
    pl: { h1: "Najlepsze sposoby na złapanie dropu Pokémon", intro: "Złapanie dropu sprowadza się do szybkości przy koszyku. To ruchy o największym wpływie.", items: [
      "Uzbrój QuickCatch przed dropem — obserwuje w tle i dodaje do koszyka przy restocku.",
      "Zaloguj się z zapisaną płatnością — skróć checkout do sekund.",
      "Idź w przedsprzedaż, gdy jest — rezerwuje egzemplarz, zanim się wyprzeda.",
      "Obserwuj kilka sklepów naraz — set wychodzi w kilku; złap pierwszy." ], faqs: [
      { q: "Jaki jest najlepszy sposób na złapanie dropu?", a: "Uzbrój QuickCatch na stronie przed dropem. Doda do koszyka, gdy wróci towar." },
      { q: "Czy mogę obserwować kilka sklepów?", a: "Tak. Uzbrój na każdej stronie; Pro zwiększa liczbę naraz." } ] },
    ja: { h1: "ポケモンのドロップを取る best な方法", intro: "ドロップを取る決め手はカートでの速さです。効果の大きい手はこれです。", items: [
      "ドロップ前にQuickCatchをセット — 背景で見張り、再入荷時にカートへ。",
      "支払いを保存してログイン — 決済を数秒に短縮。",
      "先行販売があれば狙う — 売り切れ前に1点確保。",
      "複数の店を同時に見張る — セットは複数店で出る。最初を取る。" ], faqs: [
      { q: "ドロップを取る一番の方法は？", a: "ドロップ前にページでQuickCatchをセット。再入荷時にカートへ入れます。" },
      { q: "複数の店を見張れますか？", a: "はい。各ページでセット。Proで同時数を増やせます。" } ] },
    ko: { h1: "포켓몬 드롭을 잡는 최고의 방법", intro: "드롭을 잡는 핵심은 장바구니 속도입니다. 효과가 큰 수는 다음과 같습니다.", items: [
      "드롭 전에 QuickCatch 설정 — 백그라운드에서 감시하고 재입고 시 장바구니에.",
      "결제 저장 후 로그인 — 결제를 몇 초로 단축.",
      "선판매가 있으면 노리기 — 품절 전에 한 개 확보.",
      "여러 상점 동시에 감시 — 세트는 여러 곳에 풀린다. 첫 곳을 잡기." ], faqs: [
      { q: "드롭을 잡는 가장 좋은 방법은?", a: "드롭 전에 페이지에서 QuickCatch를 설정하세요. 재입고 시 장바구니에 담습니다." },
      { q: "여러 상점을 감시할 수 있나요?", a: "네. 각 페이지에서 설정하세요. Pro는 동시 개수를 늘립니다." } ] },
    zh: { h1: "抢到宝可梦 drop 的最佳方法", intro: "抢到 drop 关键在于购物车上的速度。以下是最有效的做法。", items: [
      "在 drop 前设置 QuickCatch — 后台盯住，补货时加入购物车。",
      "登录并保存支付 — 把结账缩短到几秒。",
      "有预售就去抢 — 在售罄前先锁定一份。",
      "同时盯多家店 — 一个系列会在多家上架；抢到第一家。" ], faqs: [
      { q: "抢到 drop 最好的方法是什么？", a: "在 drop 前于页面设置 QuickCatch，补货时就加入购物车。" },
      { q: "可以同时盯多家店吗？", a: "可以。在每个页面设置；Pro 可提升同时数量。" } ] },
    "zh-Hant": { h1: "搶到寶可夢 drop 的最佳方法", intro: "搶到 drop 關鍵在於購物車上的速度。以下是最有效的做法。", items: [
      "在 drop 前設定 QuickCatch — 背景盯住，補貨時加入購物車。",
      "登入並儲存付款 — 把結帳縮短到幾秒。",
      "有預售就去搶 — 在售罄前先鎖定一份。",
      "同時盯多家店 — 一個系列會在多家上架；搶到第一家。" ], faqs: [
      { q: "搶到 drop 最好的方法是什麼？", a: "在 drop 前於頁面設定 QuickCatch，補貨時就加入購物車。" },
      { q: "可以同時盯多家店嗎？", a: "可以。在每個頁面設定；Pro 可提升同時數量。" } ] },
  },
  "best-apps-for-pokemon-restocks": {
    es: { h1: "Las mejores apps para restocks de Pokémon", intro: "La app correcta es la diferencia entre un aviso y un carrito. Esto vale la pena instalar.", items: [
      "QuickCatch (extensión de Chrome) — vigila la página y lo añade al carrito en el restock. Gratis.",
      "Apps de tiendas — Pokémon Center, Walmart, Target, Best Buy: avisos oficiales y pago rápido.",
      "Discord con un monitor — avisos de restock de la comunidad, solo para enterarte.",
      "Apps de consulta de stock — encuentra inventario en tiendas cercanas." ], faqs: [
      { q: "¿Cuál es la mejor app para restocks de Pokémon?", a: "QuickCatch para cazar el artículo, más apps de tienda para el pago rápido." },
      { q: "¿Hay una app que lo compre por mí?", a: "QuickCatch lo añade al carrito en el restock; tú completas el pago." } ] },
    fr: { h1: "Les meilleures apps pour les réassorts Pokémon", intro: "La bonne app fait la différence entre une alerte et un panier. Voici ce qui vaut le coup.", items: [
      "QuickCatch (extension Chrome) — surveille la page et l'ajoute au panier au réassort. Gratuit.",
      "Apps des boutiques — Pokémon Center, Walmart, Target, Best Buy : alertes officielles et paiement rapide.",
      "Discord avec un monitor — alertes de réassort de la communauté, juste pour être averti.",
      "Apps de consultation de stock — trouvez l'inventaire en magasin près de vous." ], faqs: [
      { q: "Quelle est la meilleure app pour les réassorts Pokémon ?", a: "QuickCatch pour attraper l'article, plus les apps boutique pour le paiement rapide." },
      { q: "Y a-t-il une app qui l'achète pour moi ?", a: "QuickCatch l'ajoute au panier au réassort ; vous finalisez le paiement." } ] },
    de: { h1: "Die besten Apps für Pokémon-Restocks", intro: "Die richtige App ist der Unterschied zwischen Alert und Warenkorb. Das lohnt sich zu installieren.", items: [
      "QuickCatch (Chrome-Erweiterung) — beobachtet die Seite und legt es beim Restock in den Warenkorb. Kostenlos.",
      "Shop-Apps — Pokémon Center, Walmart, Target, Best Buy: offizielle Alerts und schneller Checkout.",
      "Discord mit Monitor — Community-Restock-Pings, nur zur Info.",
      "Stock-Such-Apps — finde Filialbestand in deiner Nähe." ], faqs: [
      { q: "Was ist die beste App für Pokémon-Restocks?", a: "QuickCatch zum Fangen, plus Shop-Apps für den schnellen Checkout." },
      { q: "Gibt es eine App, die es für mich kauft?", a: "QuickCatch legt es beim Restock in den Warenkorb; du schließt den Kauf ab." } ] },
    pt: { h1: "Os melhores apps para restocks de Pokémon", intro: "O app certo é a diferença entre um aviso e um carrinho. Vale a pena instalar isto.", items: [
      "QuickCatch (extensão do Chrome) — vigia a página e adiciona ao carrinho no restock. Grátis.",
      "Apps das lojas — Pokémon Center, Walmart, Target, Best Buy: avisos oficiais e checkout rápido.",
      "Discord com um monitor — pings de restock da comunidade, só para avisar.",
      "Apps de consulta de estoque — ache inventário em lojas perto de você." ], faqs: [
      { q: "Qual é o melhor app para restocks de Pokémon?", a: "QuickCatch para garantir o item, mais apps de loja para o checkout rápido." },
      { q: "Existe um app que compra por mim?", a: "O QuickCatch adiciona ao carrinho no restock; você finaliza a compra." } ] },
    it: { h1: "Le migliori app per i restock di Pokémon", intro: "L'app giusta è la differenza tra un avviso e un carrello. Ecco cosa vale la pena installare.", items: [
      "QuickCatch (estensione Chrome) — sorveglia la pagina e lo mette nel carrello al restock. Gratis.",
      "App dei negozi — Pokémon Center, Walmart, Target, Best Buy: avvisi ufficiali e checkout rapido.",
      "Discord con un monitor — ping di restock della community, solo per sapere.",
      "App di ricerca stock — trova l'inventario nei negozi vicino a te." ], faqs: [
      { q: "Qual è la migliore app per i restock di Pokémon?", a: "QuickCatch per prendere l'articolo, più le app dei negozi per il checkout rapido." },
      { q: "C'è un'app che lo compra per me?", a: "QuickCatch lo mette nel carrello al restock; tu completi l'acquisto." } ] },
    nl: { h1: "De beste apps voor Pokémon-restocks", intro: "De juiste app is het verschil tussen een melding en een mandje. Dit is het installeren waard.", items: [
      "QuickCatch (Chrome-extensie) — volgt de pagina en legt het bij de restock in je mandje. Gratis.",
      "Winkel-apps — Pokémon Center, Walmart, Target, Best Buy: officiële meldingen en snelle checkout.",
      "Discord met een monitor — community-restockmeldingen, alleen ter info.",
      "Stock-opzoek-apps — vind winkelvoorraad bij jou in de buurt." ], faqs: [
      { q: "Wat is de beste app voor Pokémon-restocks?", a: "QuickCatch om het te pakken, plus winkel-apps voor de snelle checkout." },
      { q: "Is er een app die het voor mij koopt?", a: "QuickCatch legt het bij de restock in je mandje; jij rekent af." } ] },
    pl: { h1: "Najlepsze aplikacje na restocki Pokémon", intro: "Właściwa aplikacja to różnica między alertem a koszykiem. To warto zainstalować.", items: [
      "QuickCatch (rozszerzenie Chrome) — obserwuje stronę i dodaje do koszyka przy restocku. Za darmo.",
      "Aplikacje sklepów — Pokémon Center, Walmart, Target, Best Buy: oficjalne alerty i szybki checkout.",
      "Discord z monitorem — społecznościowe pingi restocków, tylko do informacji.",
      "Aplikacje sprawdzania stanu — znajdź towar w sklepie w pobliżu." ], faqs: [
      { q: "Jaka jest najlepsza aplikacja na restocki Pokémon?", a: "QuickCatch do złapania produktu, plus aplikacje sklepów do szybkiego checkoutu." },
      { q: "Czy jest aplikacja, która kupi za mnie?", a: "QuickCatch dodaje do koszyka przy restocku; Ty finalizujesz zakup." } ] },
    ja: { h1: "ポケモン再入荷向けの best なアプリ", intro: "正しいアプリは、通知とカートの差を生みます。入れる価値があるのはこれです。", items: [
      "QuickCatch（Chrome拡張） — ページを見張り、再入荷時にカートへ。無料。",
      "店のアプリ — Pokémon Center、Walmart、Target、Best Buy：公式通知と速い決済。",
      "Discord＋モニター — コミュニティの再入荷通知、知らせるだけ。",
      "在庫検索アプリ — 近くの店頭在庫を探す。" ], faqs: [
      { q: "ポケモン再入荷に最適なアプリは？", a: "取るならQuickCatch、速い決済には店のアプリ。" },
      { q: "代わりに買ってくれるアプリは？", a: "QuickCatchが再入荷時にカートへ入れ、購入はあなたが完了します。" } ] },
    ko: { h1: "포켓몬 재입고를 위한 최고의 앱", intro: "맞는 앱은 알림과 장바구니의 차이를 만듭니다. 설치할 가치가 있는 것들입니다.", items: [
      "QuickCatch(크롬 확장) — 페이지를 감시하고 재입고 시 장바구니에. 무료.",
      "매장 앱 — Pokémon Center, Walmart, Target, Best Buy: 공식 알림과 빠른 결제.",
      "디스코드 + 모니터 — 커뮤니티 재입고 알림, 알림 전용.",
      "재고 조회 앱 — 가까운 매장 재고 찾기." ], faqs: [
      { q: "포켓몬 재입고에 가장 좋은 앱은?", a: "잡으려면 QuickCatch, 빠른 결제는 매장 앱." },
      { q: "대신 사주는 앱이 있나요?", a: "QuickCatch가 재입고 시 장바구니에 담고, 결제는 당신이 합니다." } ] },
    zh: { h1: "宝可梦补货最好的 App", intro: "选对 App，就是通知和购物车之间的差别。这些值得装。", items: [
      "QuickCatch（Chrome 扩展）— 盯住页面，补货时加入购物车。免费。",
      "商店 App — Pokémon Center、Walmart、Target、Best Buy：官方通知和快速结账。",
      "Discord 加监控 — 社群补货提醒，仅用于知会。",
      "库存查询 App — 查找附近门店库存。" ], faqs: [
      { q: "宝可梦补货最好的 App 是哪个？", a: "要抢用 QuickCatch，快速结账用商店 App。" },
      { q: "有没有替我购买的 App？", a: "QuickCatch 会在补货时加入购物车；结账由你完成。" } ] },
    "zh-Hant": { h1: "寶可夢補貨最好的 App", intro: "選對 App，就是通知和購物車之間的差別。這些值得裝。", items: [
      "QuickCatch（Chrome 擴充）— 盯住頁面，補貨時加入購物車。免費。",
      "商店 App — Pokémon Center、Walmart、Target、Best Buy：官方通知和快速結帳。",
      "Discord 加監控 — 社群補貨提醒，僅用於知會。",
      "庫存查詢 App — 查找附近門市庫存。" ], faqs: [
      { q: "寶可夢補貨最好的 App 是哪個？", a: "要搶用 QuickCatch，快速結帳用商店 App。" },
      { q: "有沒有替我購買的 App？", a: "QuickCatch 會在補貨時加入購物車；結帳由你完成。" } ] },
  },
};
