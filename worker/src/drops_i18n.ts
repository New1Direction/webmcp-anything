// drops_i18n.ts — localization for the QuickCatch drop/restock SEO pages.
//
// English pages keep their hand-written copy (see drops_seo.ts). For the
// localizable categories (sets, stores, vs-bots, combos) we generate the page
// copy from the per-locale templates below, so each set/store/bot gets a
// natural localized page. Proper nouns (set names, store names, bot names)
// are passed through untranslated.
//
// Placeholders in templates: {name} {store} {them} {where} {topic}.

export type Lang =
  | "en" | "es" | "fr" | "de" | "pt" | "it"
  | "nl" | "pl" | "ja" | "ko" | "zh" | "zh-Hant";

// Default locale first; localized variants after.
export const LANGS: Lang[] = ["en", "es", "fr", "de", "pt", "it", "nl", "pl", "ja", "ko", "zh", "zh-Hant"];
export const LOCALIZED_LANGS: Lang[] = ["es", "fr", "de", "pt", "it", "nl", "pl", "ja", "ko", "zh", "zh-Hant"];

export const LANG_LABEL: Record<Lang, string> = {
  en: "English", es: "Español", fr: "Français", de: "Deutsch", pt: "Português", it: "Italiano",
  nl: "Nederlands", pl: "Polski", ja: "日本語", ko: "한국어", zh: "简体中文", "zh-Hant": "繁體中文",
};

export function fill(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));
}

export interface FaqT { q: string; a: string; }

export interface UIStrings {
  getFree: string;
  allGuides: string;
  howItWorks: string;
  stepWord: string;
  step1T: string; step1D: string;
  step2T: string; step2D: string;
  step3T: string; step3D: string;
  whyVersusH: string; whyVersusB: string;
  whyRefreshH: string; whyRefreshB: string;
  faqH: string;
  more: string;
  ctaHeading: string; // template with {topic}
  ctaSub: string;
  proBtn: string;
  notReady: string;
  emailPh: string;
  getAlerts: string;
  retailLabel: string;
  watchAtLabel: string;
  privacy: string;
  allDropGuides: string;
  jumpTo: string;
}

export interface GenBlock { title: string; desc: string; h1: string; lede: string; faqs: FaqT[]; }
export interface GenStrings {
  set: GenBlock;
  store: GenBlock;
  vs: GenBlock & { rows: Array<[string, string, string]> };
  combo: GenBlock;
}

export interface L {
  ui: UIStrings;
  cats: Record<string, string>;
  msg: { invalidEmail: string; alertDone: string; alertPro: string; retry: string; netErr: string };
  index: { title: string; desc: string; h1: string; lede: string };
  gen?: GenStrings;
}

// ---------------------------------------------------------------------------
const EN: L = {
  ui: {
    getFree: "Get QuickCatch — free",
    allGuides: "All guides",
    howItWorks: "How QuickCatch works",
    stepWord: "STEP",
    step1T: "Add it free", step1D: "One click in Chrome.",
    step2T: "Arm the page", step2D: "Open the product page and tap Watch this drop.",
    step3T: "It carts it", step3D: "On the restock, your AI adds it. You check out.",
    whyVersusH: "Why a browser catcher beats a server bot",
    whyVersusB: "Server-side bots run from datacenters behind proxies, which is exactly the traffic retail sites detect and block. QuickCatch runs in your own browser and your own logged-in session, so it reaches the same pages you do. It watches the page you opened and adds the item to your cart the second stock flips, then you complete checkout. No license, no proxies, no cook group.",
    whyRefreshH: "Why it beats refreshing",
    whyRefreshB: "Stores that carry the hottest sets block bots, so a normal AI assistant cannot reach the page when stock returns. QuickCatch runs in your own browser and your own logged-in session, so it reaches the same pages you do. It watches the page you opened and adds the item to your cart the second stock flips, which is the part everyone else loses the race on.",
    faqH: "FAQ",
    more: "More:",
    ctaHeading: "Catch the next {topic} drop",
    ctaSub: "Install free, arm the product page before the drop, and QuickCatch carts it the moment it restocks.",
    proBtn: "QuickCatch Pro — auto-cop",
    notReady: "Not ready to install? Get a free heads-up the next time it restocks.",
    emailPh: "you@email.com",
    getAlerts: "Get free alerts",
    retailLabel: "Retail:",
    watchAtLabel: "Watch it at:",
    privacy: "Privacy",
    allDropGuides: "All drop guides",
    jumpTo: "Jump to:",
  },
  cats: { "TCG sets": "TCG sets", "Stores": "Stores", "vs Bots": "vs Bots", "Guides": "Guides" },
  msg: {
    invalidEmail: "Enter a valid email.",
    alertDone: "Done. We'll alert you on the next {topic} drop.",
    alertPro: "You're on the founding list. We'll email you to lock it in.",
    retry: "Try again in a minute.",
    netErr: "Network error — try again.",
  },
  index: {
    title: "Pokémon & TCG Drop, Restock & Sniping Guides | QuickCatch",
    desc: "Catch every Pokémon and TCG drop. Guides for the hottest sets, every major store, how to snipe a restock, and how QuickCatch compares to sneaker bots.",
    h1: "Pokémon & TCG drop guides",
    lede: "Catch the sets that sell out in seconds. Install QuickCatch, arm the page, and it carts the item the moment it restocks.",
  },
};

// ---------------------------------------------------------------------------
const ES: L = {
  ui: {
    getFree: "Consigue QuickCatch — gratis",
    allGuides: "Todas las guías",
    howItWorks: "Cómo funciona QuickCatch",
    stepWord: "PASO",
    step1T: "Instálalo gratis", step1D: "Un clic en Chrome.",
    step2T: "Activa la página", step2D: "Abre la página del producto y pulsa Vigilar este drop.",
    step3T: "Lo añade al carrito", step3D: "Cuando vuelve el stock, tu IA lo añade. Tú pagas.",
    whyVersusH: "Por qué un cazador en el navegador gana a un bot de servidor",
    whyVersusB: "Los bots de servidor funcionan desde centros de datos detrás de proxies, justo el tráfico que las tiendas detectan y bloquean. QuickCatch funciona en tu propio navegador y tu propia sesión, vigila la página que abriste y añade el artículo a tu carrito en cuanto vuelve el stock. Sin licencia, sin proxies, sin grupo de pago.",
    whyRefreshH: "Por qué gana a actualizar la página",
    whyRefreshB: "Las tiendas con los sets más buscados bloquean a los bots, así que un asistente normal no llega a la página cuando vuelve el stock. QuickCatch funciona en tu propio navegador y tu propia sesión, vigila la página que abriste y añade el artículo al carrito en cuanto vuelve el stock, antes que los demás.",
    faqH: "Preguntas frecuentes",
    more: "Más:",
    ctaHeading: "Caza el próximo drop de {topic}",
    ctaSub: "Instala gratis, activa la página del producto antes del drop y QuickCatch lo añade al carrito en cuanto vuelve el stock.",
    proBtn: "QuickCatch Pro — compra automática",
    notReady: "¿No quieres instalarlo aún? Recibe un aviso gratis la próxima vez que vuelva el stock.",
    emailPh: "tu@email.com",
    getAlerts: "Recibir avisos gratis",
    retailLabel: "Precio de tienda:",
    watchAtLabel: "Vigílalo en:",
    privacy: "Privacidad",
    allDropGuides: "Todas las guías de drops",
    jumpTo: "Ir a:",
  },
  cats: { "TCG sets": "Sets de TCG", "Stores": "Tiendas", "vs Bots": "vs Bots", "Guides": "Guías" },
  msg: {
    invalidEmail: "Introduce un email válido.",
    alertDone: "Listo. Te avisaremos en el próximo drop de {topic}.",
    alertPro: "Estás en la lista de fundadores. Te escribiremos para confirmarlo.",
    retry: "Inténtalo de nuevo en un minuto.",
    netErr: "Error de red — inténtalo de nuevo.",
  },
  index: {
    title: "Guías de drops y restocks de Pokémon y TCG | QuickCatch",
    desc: "Caza cada drop de Pokémon y TCG. Guías para los sets más buscados, todas las tiendas y cómo QuickCatch se compara con los bots.",
    h1: "Guías de drops de Pokémon y TCG",
    lede: "Caza los sets que se agotan en segundos. Instala QuickCatch, activa la página y lo añade al carrito en cuanto vuelve el stock.",
  },
  gen: {
    set: {
      title: "Restock de {name} | QuickCatch",
      desc: "Caza el restock de {name}. QuickCatch vigila la página y lo añade a tu carrito en cuanto vuelve el stock.",
      h1: "Caza el restock de {name}",
      lede: "{name} se agota en segundos y se revende por encima del precio de tienda. QuickCatch vigila la página del producto y lo añade a tu carrito en cuanto vuelve el stock, para que pagues el precio de tienda.",
      faqs: [
        { q: "¿Dónde vuelve a haber stock de {name}?", a: "{where}. QuickCatch funciona en cualquiera de esas páginas y añade el artículo al carrito cuando vuelve el stock." },
        { q: "¿Tengo que vigilar la página yo mismo?", a: "No. Activa QuickCatch antes del drop y vigila en segundo plano. Mantén Chrome abierto y puedes cerrar la pestaña." },
        { q: "¿QuickCatch es gratis?", a: "Instalarlo y vigilar es gratis. Pro añade vigilar varios artículos a la vez." },
      ],
    },
    store: {
      title: "Rastreador de restock Pokémon de {store} | QuickCatch",
      desc: "Caza los restocks Pokémon de {store}. QuickCatch vigila la página del producto y lo añade a tu carrito en cuanto vuelve.",
      h1: "Caza un restock Pokémon de {store}",
      lede: "{store} repone sets de Pokémon por oleadas y se agotan rápido. QuickCatch vigila el anuncio y añade el artículo a tu carrito en cuanto vuelve el stock.",
      faqs: [
        { q: "¿QuickCatch funciona en {store}?", a: "Sí. Lee la página de producto de {store} y añade el artículo al carrito cuando vuelve el stock. Tú completas el pago." },
        { q: "¿Tengo que dejar la página abierta?", a: "No. Activa Vigilar este drop y QuickCatch vigila en segundo plano. Mantén Chrome abierto y lo añade al carrito cuando vuelve el stock." },
        { q: "¿Tiene algún coste?", a: "Instalar y vigilar es gratis. Pro añade vigilar varios artículos a la vez." },
      ],
    },
    vs: {
      title: "QuickCatch vs {them}: cazador de drops Pokémon gratis",
      desc: "QuickCatch vs {them}. Una forma gratuita, desde el navegador, de cazar restocks de Pokémon y TCG, sin servidor, sin proxies y sin cuota mensual.",
      h1: "QuickCatch vs {them}",
      lede: "{them} funciona desde servidores en centros de datos detrás de proxies de pago y va dirigido a revendedores que compran al por mayor. QuickCatch hace lo contrario: funciona en tu propio navegador y tu propia sesión, no cuesta nada instalarlo y vigila la página de Pokémon o TCG que te interesa para añadirla al carrito en cuanto vuelve el stock.",
      faqs: [
        { q: "¿Es QuickCatch una buena alternativa a {them}?", a: "Sí. {them} está hecho para comprar a gran escala desde servidores. QuickCatch funciona en tu propio navegador para un solo coleccionista, no cuesta nada instalarlo y vigila páginas de Pokémon y TCG." },
        { q: "¿Necesito proxies o un servidor?", a: "No. QuickCatch funciona en la pestaña que ya tienes abierta, en tu propia sesión. Sin proxies que alquilar ni servidor que configurar." },
        { q: "¿Me banearán?", a: "QuickCatch actúa como tú, en la página que abriste, y tú completas el pago. No funciona desde un centro de datos." },
      ],
      rows: [
        ["Precio", "Gratis", "Licencia de pago, a menudo con renovación cada temporada"],
        ["Dónde funciona", "Tu propio navegador y tu sesión", "Servidores en centros de datos con proxies de pago"],
        ["Proxies", "No hacen falta", "Obligatorios, se pagan aparte"],
        ["Hecho para", "Coleccionistas que quieren uno a precio de tienda", "Revendedores que compran al por mayor"],
        ["Riesgo de bloqueo", "Actúa como tú, en tu sesión", "El tráfico de centro de datos se marca por IP"],
        ["Configuración", "Instala en Chrome, abre la página, pulsa Vigilar", "Grupo de pago, servidor, lista de proxies, tareas"],
        ["Pago", "Tú completas el pago", "Pago automático, a menudo contra las normas de la tienda"],
        ["Curva de aprendizaje", "Un botón", "Pronunciada — requiere guías y comunidad"],
      ],
    },
    combo: {
      title: "Restock de {name} en {store} | QuickCatch",
      desc: "Caza el restock de {name} en {store}. QuickCatch vigila la página de {store} y lo añade al carrito en cuanto vuelve el stock.",
      h1: "Caza el restock de {name} en {store}",
      lede: "Cuando {name} vuelve al stock en {store}, se agota rápido. QuickCatch vigila la página de producto de {store} y lo añade a tu carrito en cuanto vuelve el stock, para que pagues el precio de tienda.",
      faqs: [
        { q: "¿Cuándo vuelve a haber stock de {name} en {store}?", a: "Los restocks llegan sin avisar. Activa QuickCatch en la página de {store} y vigila en segundo plano hasta que vuelve el stock." },
        { q: "¿QuickCatch funciona en {store}?", a: "Sí. Lee la página de {store} y añade {name} al carrito cuando vuelve. Tú completas el pago." },
        { q: "¿Es gratis?", a: "Instalar y vigilar es gratis. Pro añade vigilar varios artículos a la vez." },
      ],
    },
  },
};

// ---------------------------------------------------------------------------
const FR: L = {
  ui: {
    getFree: "Obtenir QuickCatch — gratuit",
    allGuides: "Tous les guides",
    howItWorks: "Comment fonctionne QuickCatch",
    stepWord: "ÉTAPE",
    step1T: "Installez-le gratuitement", step1D: "Un clic dans Chrome.",
    step2T: "Activez la page", step2D: "Ouvrez la page produit et appuyez sur Surveiller ce drop.",
    step3T: "Il l'ajoute au panier", step3D: "Au réassort, votre IA l'ajoute. Vous payez.",
    whyVersusH: "Pourquoi un capteur dans le navigateur bat un bot serveur",
    whyVersusB: "Les bots serveur tournent dans des centres de données derrière des proxys, exactement le trafic que les boutiques détectent et bloquent. QuickCatch tourne dans votre propre navigateur et votre propre session, surveille la page que vous avez ouverte et ajoute l'article à votre panier dès le retour du stock. Sans licence, sans proxy, sans cook group.",
    whyRefreshH: "Pourquoi il bat le rafraîchissement",
    whyRefreshB: "Les boutiques avec les sets les plus recherchés bloquent les bots, donc un assistant normal n'atteint pas la page au retour du stock. QuickCatch tourne dans votre propre navigateur et votre propre session, surveille la page que vous avez ouverte et ajoute l'article au panier dès le retour du stock, avant tout le monde.",
    faqH: "FAQ",
    more: "Plus :",
    ctaHeading: "Attrapez le prochain drop de {topic}",
    ctaSub: "Installez gratuitement, activez la page produit avant le drop et QuickCatch l'ajoute au panier dès le retour du stock.",
    proBtn: "QuickCatch Pro — achat auto",
    notReady: "Pas encore prêt à l'installer ? Recevez une alerte gratuite au prochain réassort.",
    emailPh: "vous@email.com",
    getAlerts: "Recevoir des alertes gratuites",
    retailLabel: "Prix boutique :",
    watchAtLabel: "Surveillez-le sur :",
    privacy: "Confidentialité",
    allDropGuides: "Tous les guides de drops",
    jumpTo: "Aller à :",
  },
  cats: { "TCG sets": "Sets TCG", "Stores": "Boutiques", "vs Bots": "vs Bots", "Guides": "Guides" },
  msg: {
    invalidEmail: "Entrez un email valide.",
    alertDone: "C'est fait. On vous alertera au prochain drop de {topic}.",
    alertPro: "Vous êtes sur la liste des fondateurs. On vous écrira pour confirmer.",
    retry: "Réessayez dans une minute.",
    netErr: "Erreur réseau — réessayez.",
  },
  index: {
    title: "Guides de drops et réassorts Pokémon et TCG | QuickCatch",
    desc: "Attrapez chaque drop Pokémon et TCG. Guides pour les sets les plus recherchés, toutes les boutiques et comment QuickCatch se compare aux bots.",
    h1: "Guides de drops Pokémon et TCG",
    lede: "Attrapez les sets qui partent en quelques secondes. Installez QuickCatch, activez la page et il l'ajoute au panier dès le retour du stock.",
  },
  gen: {
    set: {
      title: "Réassort {name} | QuickCatch",
      desc: "Attrapez le réassort de {name}. QuickCatch surveille la page et l'ajoute à votre panier dès le retour du stock.",
      h1: "Attrapez le réassort de {name}",
      lede: "{name} se vend en quelques secondes et se revend au-dessus du prix boutique. QuickCatch surveille la page produit et l'ajoute à votre panier dès le retour du stock, pour que vous payiez le prix boutique.",
      faqs: [
        { q: "Où {name} est-il réapprovisionné ?", a: "{where}. QuickCatch fonctionne sur chacune de ces pages et ajoute l'article au panier au retour du stock." },
        { q: "Dois-je surveiller la page moi-même ?", a: "Non. Activez QuickCatch avant le drop et il surveille en arrière-plan. Gardez Chrome ouvert et vous pouvez fermer l'onglet." },
        { q: "QuickCatch est-il gratuit ?", a: "L'installation et la surveillance sont gratuites. Pro permet de surveiller plusieurs articles à la fois." },
      ],
    },
    store: {
      title: "Suivi des réassorts Pokémon {store} | QuickCatch",
      desc: "Attrapez les réassorts Pokémon de {store}. QuickCatch surveille la page produit et l'ajoute à votre panier dès qu'il revient.",
      h1: "Attrapez un réassort Pokémon {store}",
      lede: "{store} réapprovisionne les sets Pokémon par vagues et ils partent vite. QuickCatch surveille l'annonce et ajoute l'article à votre panier dès le retour du stock.",
      faqs: [
        { q: "QuickCatch fonctionne-t-il sur {store} ?", a: "Oui. Il lit la page produit de {store} et ajoute l'article au panier au retour du stock. Vous finalisez le paiement." },
        { q: "Dois-je laisser la page ouverte ?", a: "Non. Activez Surveiller ce drop et QuickCatch surveille en arrière-plan. Gardez Chrome ouvert et il l'ajoute au panier au retour du stock." },
        { q: "Y a-t-il des frais ?", a: "L'installation et la surveillance sont gratuites. Pro permet de surveiller plusieurs articles à la fois." },
      ],
    },
    vs: {
      title: "QuickCatch vs {them} : capteur de drops Pokémon gratuit",
      desc: "QuickCatch vs {them}. Une façon gratuite, depuis le navigateur, d'attraper les réassorts Pokémon et TCG, sans serveur, sans proxy et sans abonnement.",
      h1: "QuickCatch vs {them}",
      lede: "{them} tourne sur des serveurs en centre de données derrière des proxys payants et vise les revendeurs qui achètent en gros. QuickCatch fait l'inverse : il tourne dans votre propre navigateur et votre propre session, ne coûte rien à installer et surveille la page Pokémon ou TCG qui vous intéresse pour l'ajouter au panier dès le retour du stock.",
      faqs: [
        { q: "QuickCatch est-il une bonne alternative à {them} ?", a: "Oui. {them} est conçu pour l'achat à grande échelle depuis des serveurs. QuickCatch tourne dans votre propre navigateur pour un seul collectionneur, ne coûte rien à installer et surveille les pages Pokémon et TCG." },
        { q: "Ai-je besoin de proxys ou d'un serveur ?", a: "Non. QuickCatch tourne dans l'onglet que vous avez déjà ouvert, dans votre propre session. Aucun proxy à louer, aucun serveur à configurer." },
        { q: "Vais-je être banni ?", a: "QuickCatch agit comme vous, sur la page que vous avez ouverte, et vous finalisez le paiement. Il ne tourne pas depuis un centre de données." },
      ],
      rows: [
        ["Prix", "Gratuit", "Licence payante, souvent renouvelée chaque saison"],
        ["Où il tourne", "Votre navigateur et votre session", "Serveurs en centre de données avec proxys payants"],
        ["Proxys", "Aucun nécessaire", "Obligatoires, facturés à part"],
        ["Conçu pour", "Les collectionneurs qui en veulent un au prix boutique", "Les revendeurs qui achètent en gros"],
        ["Risque de blocage", "Agit comme vous, dans votre session", "Le trafic de centre de données est repéré par IP"],
        ["Configuration", "Installez sur Chrome, ouvrez la page, appuyez sur Surveiller", "Cook group, serveur, liste de proxys, tâches"],
        ["Paiement", "Vous finalisez le paiement", "Paiement auto, souvent contre les règles de la boutique"],
        ["Prise en main", "Un bouton", "Difficile — guides et communauté nécessaires"],
      ],
    },
    combo: {
      title: "Réassort {name} chez {store} | QuickCatch",
      desc: "Attrapez le réassort de {name} chez {store}. QuickCatch surveille la page {store} et l'ajoute au panier dès le retour du stock.",
      h1: "Attrapez le réassort de {name} chez {store}",
      lede: "Quand {name} est réapprovisionné chez {store}, il part vite. QuickCatch surveille la page produit de {store} et l'ajoute à votre panier dès le retour du stock, pour que vous payiez le prix boutique.",
      faqs: [
        { q: "Quand {name} est-il réapprovisionné chez {store} ?", a: "Les réassorts arrivent sans prévenir. Activez QuickCatch sur la page {store} et il surveille en arrière-plan jusqu'au retour du stock." },
        { q: "QuickCatch fonctionne-t-il sur {store} ?", a: "Oui. Il lit la page {store} et ajoute {name} au panier à son retour. Vous finalisez le paiement." },
        { q: "Est-ce gratuit ?", a: "L'installation et la surveillance sont gratuites. Pro permet de surveiller plusieurs articles à la fois." },
      ],
    },
  },
};

// ---------------------------------------------------------------------------
const DE: L = {
  ui: {
    getFree: "QuickCatch holen — kostenlos",
    allGuides: "Alle Guides",
    howItWorks: "So funktioniert QuickCatch",
    stepWord: "SCHRITT",
    step1T: "Kostenlos installieren", step1D: "Ein Klick in Chrome.",
    step2T: "Seite scharfstellen", step2D: "Öffne die Produktseite und tippe auf Diesen Drop beobachten.",
    step3T: "Es legt es in den Warenkorb", step3D: "Beim Restock legt deine KI es hinein. Du schließt den Kauf ab.",
    whyVersusH: "Warum ein Browser-Catcher einen Server-Bot schlägt",
    whyVersusB: "Server-Bots laufen in Rechenzentren hinter Proxys, genau der Traffic, den Shops erkennen und blockieren. QuickCatch läuft in deinem eigenen Browser und deiner eigenen Sitzung, beobachtet die Seite, die du geöffnet hast, und legt den Artikel in den Warenkorb, sobald der Bestand zurück ist. Keine Lizenz, keine Proxys, keine Cook Group.",
    whyRefreshH: "Warum es besser ist als Neuladen",
    whyRefreshB: "Shops mit den begehrtesten Sets blockieren Bots, daher erreicht ein normaler Assistent die Seite beim Restock nicht. QuickCatch läuft in deinem eigenen Browser und deiner eigenen Sitzung, beobachtet die geöffnete Seite und legt den Artikel in den Warenkorb, sobald der Bestand zurück ist, vor allen anderen.",
    faqH: "FAQ",
    more: "Mehr:",
    ctaHeading: "Schnapp dir den nächsten {topic}-Drop",
    ctaSub: "Kostenlos installieren, die Produktseite vor dem Drop scharfstellen, und QuickCatch legt es in den Warenkorb, sobald der Bestand zurück ist.",
    proBtn: "QuickCatch Pro — Auto-Kauf",
    notReady: "Noch nicht bereit zu installieren? Erhalte beim nächsten Restock eine kostenlose Info.",
    emailPh: "du@email.com",
    getAlerts: "Kostenlose Benachrichtigungen",
    retailLabel: "Ladenpreis:",
    watchAtLabel: "Beobachte es bei:",
    privacy: "Datenschutz",
    allDropGuides: "Alle Drop-Guides",
    jumpTo: "Springe zu:",
  },
  cats: { "TCG sets": "TCG-Sets", "Stores": "Shops", "vs Bots": "vs Bots", "Guides": "Guides" },
  msg: {
    invalidEmail: "Gib eine gültige E-Mail ein.",
    alertDone: "Erledigt. Wir melden uns beim nächsten {topic}-Drop.",
    alertPro: "Du bist auf der Gründerliste. Wir schreiben dir zur Bestätigung.",
    retry: "Versuch es in einer Minute erneut.",
    netErr: "Netzwerkfehler — versuch es erneut.",
  },
  index: {
    title: "Pokémon- & TCG-Drop- und Restock-Guides | QuickCatch",
    desc: "Fang jeden Pokémon- und TCG-Drop. Guides für die begehrtesten Sets, alle Shops und wie QuickCatch im Vergleich zu Bots abschneidet.",
    h1: "Pokémon- & TCG-Drop-Guides",
    lede: "Fang die Sets, die in Sekunden ausverkauft sind. Installiere QuickCatch, stell die Seite scharf und es legt es in den Warenkorb, sobald der Bestand zurück ist.",
  },
  gen: {
    set: {
      title: "{name} Restock | QuickCatch",
      desc: "Schnapp dir den {name}-Restock. QuickCatch beobachtet die Seite und legt es in den Warenkorb, sobald es wieder verfügbar ist.",
      h1: "Schnapp dir den {name}-Restock",
      lede: "{name} ist in Sekunden ausverkauft und wird über dem Ladenpreis weiterverkauft. QuickCatch beobachtet die Produktseite und legt es in den Warenkorb, sobald der Bestand zurück ist, damit du den Ladenpreis zahlst.",
      faqs: [
        { q: "Wo gibt es {name} wieder?", a: "{where}. QuickCatch funktioniert auf jeder dieser Produktseiten und legt den Artikel in den Warenkorb, wenn der Bestand zurück ist." },
        { q: "Muss ich die Seite selbst beobachten?", a: "Nein. Stell QuickCatch vor dem Drop scharf und es beobachtet im Hintergrund. Lass Chrome offen, den Tab kannst du schließen." },
        { q: "Ist QuickCatch kostenlos?", a: "Installieren und Beobachten ist kostenlos. Pro beobachtet mehrere Artikel gleichzeitig." },
      ],
    },
    store: {
      title: "{store} Pokémon Restock-Tracker | QuickCatch",
      desc: "Schnapp dir {store} Pokémon-Restocks. QuickCatch beobachtet die Produktseite und legt es in den Warenkorb, sobald es zurück ist.",
      h1: "Schnapp dir einen {store} Pokémon-Restock",
      lede: "{store} füllt Pokémon-Sets in Wellen auf und sie sind schnell weg. QuickCatch beobachtet die Anzeige und legt den Artikel in den Warenkorb, sobald der Bestand zurück ist.",
      faqs: [
        { q: "Funktioniert QuickCatch bei {store}?", a: "Ja. Es liest die {store}-Produktseite und legt den Artikel in den Warenkorb, wenn der Bestand zurück ist. Den Kauf schließt du selbst ab." },
        { q: "Muss ich die Seite offen lassen?", a: "Nein. Stell Diesen Drop beobachten scharf und QuickCatch beobachtet im Hintergrund. Lass Chrome offen und es legt es in den Warenkorb, wenn der Bestand zurück ist." },
        { q: "Gibt es Gebühren?", a: "Installieren und Beobachten ist kostenlos. Pro beobachtet mehrere Artikel gleichzeitig." },
      ],
    },
    vs: {
      title: "QuickCatch vs {them}: kostenloser Pokémon-Drop-Catcher",
      desc: "QuickCatch vs {them}. Ein kostenloser Weg im Browser, Pokémon- und TCG-Restocks zu fangen, ohne Server, ohne Proxys und ohne Monatsgebühr.",
      h1: "QuickCatch vs {them}",
      lede: "{them} läuft auf Servern im Rechenzentrum hinter bezahlten Proxys und richtet sich an Reseller, die in großen Mengen kaufen. QuickCatch macht das Gegenteil: Es läuft in deinem eigenen Browser und deiner eigenen Sitzung, kostet nichts in der Installation und beobachtet die Pokémon- oder TCG-Seite, die dich interessiert, um sie in den Warenkorb zu legen, sobald der Bestand zurück ist.",
      faqs: [
        { q: "Ist QuickCatch eine gute {them}-Alternative?", a: "Ja. {them} ist für serverseitigen Kauf in großem Maßstab gebaut. QuickCatch läuft in deinem eigenen Browser für einen einzelnen Sammler, kostet nichts und beobachtet Pokémon- und TCG-Seiten." },
        { q: "Brauche ich Proxys oder einen Server?", a: "Nein. QuickCatch läuft im Tab, den du schon offen hast, in deiner eigenen Sitzung. Keine Proxys zu mieten, kein Server zu konfigurieren." },
        { q: "Werde ich gebannt?", a: "QuickCatch handelt als du, auf der Seite, die du geöffnet hast, und du schließt den Kauf ab. Es läuft nicht aus einem Rechenzentrum." },
      ],
      rows: [
        ["Preis", "Kostenlos", "Bezahlte Lizenz, oft jede Saison erneuert"],
        ["Wo es läuft", "Dein Browser und deine Sitzung", "Server im Rechenzentrum mit bezahlten Proxys"],
        ["Proxys", "Keine nötig", "Pflicht, separat berechnet"],
        ["Gebaut für", "Sammler, die eins zum Ladenpreis wollen", "Reseller, die in großen Mengen kaufen"],
        ["Sperrrisiko", "Handelt als du, in deiner Sitzung", "Rechenzentrums-Traffic wird per IP markiert"],
        ["Einrichtung", "In Chrome installieren, Seite öffnen, Beobachten tippen", "Cook Group, Server, Proxy-Liste, Tasks"],
        ["Kauf", "Du schließt den Kauf ab", "Auto-Kauf, oft gegen die Shop-Regeln"],
        ["Lernkurve", "Ein Knopf", "Steil — Guides und Community nötig"],
      ],
    },
    combo: {
      title: "{name} Restock bei {store} | QuickCatch",
      desc: "Schnapp dir den {name}-Restock bei {store}. QuickCatch beobachtet die {store}-Seite und legt es in den Warenkorb, sobald es zurück ist.",
      h1: "Schnapp dir den {name}-Restock bei {store}",
      lede: "Wenn {name} bei {store} wieder reinkommt, ist es schnell weg. QuickCatch beobachtet die {store}-Produktseite und legt es in den Warenkorb, sobald der Bestand zurück ist, damit du den Ladenpreis zahlst.",
      faqs: [
        { q: "Wann gibt es {name} bei {store} wieder?", a: "Restocks kommen ohne Vorwarnung. Stell QuickCatch auf der {store}-Seite scharf und es beobachtet im Hintergrund, bis der Bestand zurück ist." },
        { q: "Funktioniert QuickCatch bei {store}?", a: "Ja. Es liest die {store}-Seite und legt {name} in den Warenkorb, wenn es zurück ist. Den Kauf schließt du ab." },
        { q: "Ist es kostenlos?", a: "Installieren und Beobachten ist kostenlos. Pro beobachtet mehrere Artikel gleichzeitig." },
      ],
    },
  },
};

// ---------------------------------------------------------------------------
const PT: L = {
  ui: {
    getFree: "Baixar QuickCatch — grátis",
    allGuides: "Todos os guias",
    howItWorks: "Como o QuickCatch funciona",
    stepWord: "PASSO",
    step1T: "Instale grátis", step1D: "Um clique no Chrome.",
    step2T: "Ative a página", step2D: "Abra a página do produto e toque em Vigiar este drop.",
    step3T: "Ele adiciona ao carrinho", step3D: "No restock, sua IA adiciona. Você finaliza a compra.",
    whyVersusH: "Por que um capturador no navegador vence um bot de servidor",
    whyVersusB: "Bots de servidor rodam em data centers atrás de proxies, exatamente o tráfego que as lojas detectam e bloqueiam. O QuickCatch roda no seu próprio navegador e na sua própria sessão, vigia a página que você abriu e adiciona o item ao carrinho assim que o estoque volta. Sem licença, sem proxies, sem cook group.",
    whyRefreshH: "Por que vence o F5",
    whyRefreshB: "As lojas com os sets mais procurados bloqueiam bots, então um assistente comum não alcança a página quando o estoque volta. O QuickCatch roda no seu próprio navegador e na sua própria sessão, vigia a página que você abriu e adiciona o item ao carrinho assim que o estoque volta, antes de todo mundo.",
    faqH: "Perguntas frequentes",
    more: "Mais:",
    ctaHeading: "Garanta o próximo drop de {topic}",
    ctaSub: "Instale grátis, ative a página do produto antes do drop e o QuickCatch adiciona ao carrinho assim que o estoque volta.",
    proBtn: "QuickCatch Pro — compra automática",
    notReady: "Ainda não quer instalar? Receba um aviso grátis no próximo restock.",
    emailPh: "voce@email.com",
    getAlerts: "Receber avisos grátis",
    retailLabel: "Preço de loja:",
    watchAtLabel: "Vigie em:",
    privacy: "Privacidade",
    allDropGuides: "Todos os guias de drops",
    jumpTo: "Ir para:",
  },
  cats: { "TCG sets": "Sets de TCG", "Stores": "Lojas", "vs Bots": "vs Bots", "Guides": "Guias" },
  msg: {
    invalidEmail: "Digite um e-mail válido.",
    alertDone: "Pronto. Vamos avisar no próximo drop de {topic}.",
    alertPro: "Você está na lista de fundadores. Vamos escrever para confirmar.",
    retry: "Tente de novo em um minuto.",
    netErr: "Erro de rede — tente de novo.",
  },
  index: {
    title: "Guias de drops e restocks de Pokémon e TCG | QuickCatch",
    desc: "Garanta cada drop de Pokémon e TCG. Guias para os sets mais procurados, todas as lojas e como o QuickCatch se compara aos bots.",
    h1: "Guias de drops de Pokémon e TCG",
    lede: "Garanta os sets que esgotam em segundos. Instale o QuickCatch, ative a página e ele adiciona ao carrinho assim que o estoque volta.",
  },
  gen: {
    set: {
      title: "Restock de {name} | QuickCatch",
      desc: "Garanta o restock de {name}. O QuickCatch vigia a página e adiciona ao seu carrinho assim que volta ao estoque.",
      h1: "Garanta o restock de {name}",
      lede: "{name} esgota em segundos e é revendido acima do preço de loja. O QuickCatch vigia a página do produto e adiciona ao seu carrinho assim que o estoque volta, para você pagar o preço de loja.",
      faqs: [
        { q: "Onde {name} volta ao estoque?", a: "{where}. O QuickCatch funciona em qualquer uma dessas páginas e adiciona o item ao carrinho quando o estoque volta." },
        { q: "Preciso vigiar a página eu mesmo?", a: "Não. Ative o QuickCatch antes do drop e ele vigia em segundo plano. Mantenha o Chrome aberto e você pode fechar a aba." },
        { q: "O QuickCatch é grátis?", a: "Instalar e vigiar é grátis. O Pro adiciona vigiar vários itens ao mesmo tempo." },
      ],
    },
    store: {
      title: "Rastreador de restock Pokémon da {store} | QuickCatch",
      desc: "Garanta os restocks Pokémon da {store}. O QuickCatch vigia a página do produto e adiciona ao seu carrinho assim que volta.",
      h1: "Garanta um restock Pokémon da {store}",
      lede: "A {store} repõe sets de Pokémon em ondas e eles somem rápido. O QuickCatch vigia o anúncio e adiciona o item ao seu carrinho assim que o estoque volta.",
      faqs: [
        { q: "O QuickCatch funciona na {store}?", a: "Sim. Ele lê a página de produto da {store} e adiciona o item ao carrinho quando o estoque volta. Você finaliza a compra." },
        { q: "Preciso deixar a página aberta?", a: "Não. Ative Vigiar este drop e o QuickCatch vigia em segundo plano. Mantenha o Chrome aberto e ele adiciona ao carrinho quando o estoque volta." },
        { q: "Tem alguma taxa?", a: "Instalar e vigiar é grátis. O Pro adiciona vigiar vários itens ao mesmo tempo." },
      ],
    },
    vs: {
      title: "QuickCatch vs {them}: capturador de drops Pokémon grátis",
      desc: "QuickCatch vs {them}. Um jeito grátis, pelo navegador, de garantir restocks de Pokémon e TCG, sem servidor, sem proxies e sem mensalidade.",
      h1: "QuickCatch vs {them}",
      lede: "{them} roda em servidores de data center atrás de proxies pagos e mira revendedores que compram em grande quantidade. O QuickCatch faz o contrário: roda no seu próprio navegador e na sua própria sessão, não custa nada para instalar e vigia a página de Pokémon ou TCG que te interessa para adicionar ao carrinho assim que o estoque volta.",
      faqs: [
        { q: "O QuickCatch é uma boa alternativa ao {them}?", a: "Sim. O {them} foi feito para compra em larga escala a partir de servidores. O QuickCatch roda no seu próprio navegador para um único colecionador, não custa nada e vigia páginas de Pokémon e TCG." },
        { q: "Preciso de proxies ou servidor?", a: "Não. O QuickCatch roda na aba que você já tem aberta, na sua própria sessão. Sem proxies para alugar, sem servidor para configurar." },
        { q: "Vou ser banido?", a: "O QuickCatch age como você, na página que você abriu, e você finaliza a compra. Ele não roda em data center." },
      ],
      rows: [
        ["Preço", "Grátis", "Licença paga, muitas vezes renovada a cada temporada"],
        ["Onde roda", "Seu navegador e sua sessão", "Servidores de data center com proxies pagos"],
        ["Proxies", "Não precisa", "Obrigatórios, cobrados à parte"],
        ["Feito para", "Colecionadores que querem um pelo preço de loja", "Revendedores que compram em grande quantidade"],
        ["Risco de bloqueio", "Age como você, na sua sessão", "Tráfego de data center é marcado por IP"],
        ["Configuração", "Instale no Chrome, abra a página, toque em Vigiar", "Cook group, servidor, lista de proxies, tarefas"],
        ["Pagamento", "Você finaliza a compra", "Compra automática, muitas vezes contra as regras da loja"],
        ["Curva de aprendizado", "Um botão", "Íngreme — exige guias e comunidade"],
      ],
    },
    combo: {
      title: "Restock de {name} na {store} | QuickCatch",
      desc: "Garanta o restock de {name} na {store}. O QuickCatch vigia a página da {store} e adiciona ao carrinho assim que volta.",
      h1: "Garanta o restock de {name} na {store}",
      lede: "Quando {name} volta ao estoque na {store}, esgota rápido. O QuickCatch vigia a página de produto da {store} e adiciona ao seu carrinho assim que o estoque volta, para você pagar o preço de loja.",
      faqs: [
        { q: "Quando {name} volta ao estoque na {store}?", a: "Os restocks chegam sem aviso. Ative o QuickCatch na página da {store} e ele vigia em segundo plano até o estoque voltar." },
        { q: "O QuickCatch funciona na {store}?", a: "Sim. Ele lê a página da {store} e adiciona {name} ao carrinho quando volta. Você finaliza a compra." },
        { q: "É grátis?", a: "Instalar e vigiar é grátis. O Pro adiciona vigiar vários itens ao mesmo tempo." },
      ],
    },
  },
};

// ---------------------------------------------------------------------------
const IT: L = {
  ui: {
    getFree: "Ottieni QuickCatch — gratis",
    allGuides: "Tutte le guide",
    howItWorks: "Come funziona QuickCatch",
    stepWord: "PASSO",
    step1T: "Installalo gratis", step1D: "Un clic in Chrome.",
    step2T: "Attiva la pagina", step2D: "Apri la pagina del prodotto e tocca Sorveglia questo drop.",
    step3T: "Lo mette nel carrello", step3D: "Al restock la tua IA lo aggiunge. Tu completi l'acquisto.",
    whyVersusH: "Perché un catcher nel browser batte un bot da server",
    whyVersusB: "I bot da server girano in data center dietro proxy, esattamente il traffico che i negozi rilevano e bloccano. QuickCatch gira nel tuo browser e nella tua sessione, sorveglia la pagina che hai aperto e mette l'articolo nel carrello appena torna disponibile. Niente licenza, niente proxy, niente cook group.",
    whyRefreshH: "Perché batte l'aggiornare la pagina",
    whyRefreshB: "I negozi con i set più richiesti bloccano i bot, quindi un assistente normale non raggiunge la pagina quando torna lo stock. QuickCatch gira nel tuo browser e nella tua sessione, sorveglia la pagina che hai aperto e mette l'articolo nel carrello appena torna lo stock, prima di tutti gli altri.",
    faqH: "FAQ",
    more: "Altro:",
    ctaHeading: "Prendi il prossimo drop di {topic}",
    ctaSub: "Installa gratis, attiva la pagina del prodotto prima del drop e QuickCatch lo mette nel carrello appena torna disponibile.",
    proBtn: "QuickCatch Pro — acquisto automatico",
    notReady: "Non vuoi ancora installarlo? Ricevi un avviso gratis al prossimo restock.",
    emailPh: "tu@email.com",
    getAlerts: "Ricevi avvisi gratis",
    retailLabel: "Prezzo negozio:",
    watchAtLabel: "Sorveglialo su:",
    privacy: "Privacy",
    allDropGuides: "Tutte le guide ai drop",
    jumpTo: "Vai a:",
  },
  cats: { "TCG sets": "Set TCG", "Stores": "Negozi", "vs Bots": "vs Bot", "Guides": "Guide" },
  msg: {
    invalidEmail: "Inserisci un'email valida.",
    alertDone: "Fatto. Ti avviseremo al prossimo drop di {topic}.",
    alertPro: "Sei nella lista dei fondatori. Ti scriveremo per confermare.",
    retry: "Riprova tra un minuto.",
    netErr: "Errore di rete — riprova.",
  },
  index: {
    title: "Guide ai drop e restock Pokémon e TCG | QuickCatch",
    desc: "Prendi ogni drop Pokémon e TCG. Guide per i set più richiesti, tutti i negozi e come QuickCatch si confronta con i bot.",
    h1: "Guide ai drop Pokémon e TCG",
    lede: "Prendi i set che si esauriscono in pochi secondi. Installa QuickCatch, attiva la pagina e lo mette nel carrello appena torna lo stock.",
  },
  gen: {
    set: {
      title: "Restock {name} | QuickCatch",
      desc: "Prendi il restock di {name}. QuickCatch sorveglia la pagina e lo mette nel carrello appena torna disponibile.",
      h1: "Prendi il restock di {name}",
      lede: "{name} si esaurisce in pochi secondi e viene rivenduto sopra il prezzo di negozio. QuickCatch sorveglia la pagina del prodotto e lo mette nel carrello appena torna lo stock, così paghi il prezzo di negozio.",
      faqs: [
        { q: "Dove torna disponibile {name}?", a: "{where}. QuickCatch funziona su ognuna di quelle pagine e mette l'articolo nel carrello quando torna lo stock." },
        { q: "Devo sorvegliare la pagina io stesso?", a: "No. Attiva QuickCatch prima del drop e sorveglia in background. Tieni Chrome aperto e puoi chiudere la scheda." },
        { q: "QuickCatch è gratis?", a: "Installare e sorvegliare è gratis. Pro aggiunge la sorveglianza di più articoli insieme." },
      ],
    },
    store: {
      title: "Tracker restock Pokémon {store} | QuickCatch",
      desc: "Prendi i restock Pokémon di {store}. QuickCatch sorveglia la pagina del prodotto e lo mette nel carrello appena torna.",
      h1: "Prendi un restock Pokémon di {store}",
      lede: "{store} rifornisce i set Pokémon a ondate e spariscono in fretta. QuickCatch sorveglia l'annuncio e mette l'articolo nel carrello appena torna lo stock.",
      faqs: [
        { q: "QuickCatch funziona su {store}?", a: "Sì. Legge la pagina prodotto di {store} e mette l'articolo nel carrello quando torna lo stock. L'acquisto lo completi tu." },
        { q: "Devo lasciare la pagina aperta?", a: "No. Attiva Sorveglia questo drop e QuickCatch sorveglia in background. Tieni Chrome aperto e lo mette nel carrello quando torna lo stock." },
        { q: "Ci sono costi?", a: "Installare e sorvegliare è gratis. Pro aggiunge la sorveglianza di più articoli insieme." },
      ],
    },
    vs: {
      title: "QuickCatch vs {them}: catcher di drop Pokémon gratis",
      desc: "QuickCatch vs {them}. Un modo gratuito, dal browser, di prendere i restock di Pokémon e TCG, senza server, senza proxy e senza abbonamento.",
      h1: "QuickCatch vs {them}",
      lede: "{them} gira su server in data center dietro proxy a pagamento e punta ai rivenditori che comprano in grande quantità. QuickCatch fa il contrario: gira nel tuo browser e nella tua sessione, non costa nulla da installare e sorveglia la pagina Pokémon o TCG che ti interessa per metterla nel carrello appena torna lo stock.",
      faqs: [
        { q: "QuickCatch è una buona alternativa a {them}?", a: "Sì. {them} è fatto per l'acquisto su larga scala da server. QuickCatch gira nel tuo browser per un singolo collezionista, non costa nulla e sorveglia pagine Pokémon e TCG." },
        { q: "Mi servono proxy o un server?", a: "No. QuickCatch gira nella scheda che hai già aperto, nella tua sessione. Nessun proxy da affittare, nessun server da configurare." },
        { q: "Verrò bannato?", a: "QuickCatch agisce come te, sulla pagina che hai aperto, e l'acquisto lo completi tu. Non gira da un data center." },
      ],
      rows: [
        ["Prezzo", "Gratis", "Licenza a pagamento, spesso rinnovata ogni stagione"],
        ["Dove gira", "Il tuo browser e la tua sessione", "Server in data center con proxy a pagamento"],
        ["Proxy", "Non servono", "Obbligatori, fatturati a parte"],
        ["Pensato per", "Collezionisti che ne vogliono uno al prezzo di negozio", "Rivenditori che comprano in grande quantità"],
        ["Rischio di blocco", "Agisce come te, nella tua sessione", "Il traffico da data center viene segnalato per IP"],
        ["Configurazione", "Installa su Chrome, apri la pagina, tocca Sorveglia", "Cook group, server, lista proxy, task"],
        ["Acquisto", "L'acquisto lo completi tu", "Acquisto automatico, spesso contro le regole del negozio"],
        ["Curva di apprendimento", "Un pulsante", "Ripida — servono guide e community"],
      ],
    },
    combo: {
      title: "Restock {name} da {store} | QuickCatch",
      desc: "Prendi il restock di {name} da {store}. QuickCatch sorveglia la pagina di {store} e lo mette nel carrello appena torna.",
      h1: "Prendi il restock di {name} da {store}",
      lede: "Quando {name} torna disponibile da {store}, si esaurisce in fretta. QuickCatch sorveglia la pagina prodotto di {store} e lo mette nel carrello appena torna lo stock, così paghi il prezzo di negozio.",
      faqs: [
        { q: "Quando torna disponibile {name} da {store}?", a: "I restock arrivano senza preavviso. Attiva QuickCatch sulla pagina di {store} e sorveglia in background finché torna lo stock." },
        { q: "QuickCatch funziona su {store}?", a: "Sì. Legge la pagina di {store} e mette {name} nel carrello quando torna. L'acquisto lo completi tu." },
        { q: "È gratis?", a: "Installare e sorvegliare è gratis. Pro aggiunge la sorveglianza di più articoli insieme." },
      ],
    },
  },
};

// ---------------------------------------------------------------------------
const NL: L = {
  ui: {
    getFree: "Download QuickCatch — gratis",
    allGuides: "Alle gidsen",
    howItWorks: "Hoe QuickCatch werkt",
    stepWord: "STAP",
    step1T: "Installeer het gratis", step1D: "Eén klik in Chrome.",
    step2T: "Activeer de pagina", step2D: "Open de productpagina en tik op Volg deze drop.",
    step3T: "Hij legt het in je mandje", step3D: "Bij de restock voegt je AI het toe. Jij rekent af.",
    whyVersusH: "Waarom een browser-catcher een serverbot verslaat",
    whyVersusB: "Serverbots draaien in datacenters achter proxy's, precies het verkeer dat winkels herkennen en blokkeren. QuickCatch draait in je eigen browser en je eigen sessie, volgt de pagina die je hebt geopend en legt het artikel in je mandje zodra de voorraad terug is. Geen licentie, geen proxy's, geen cookgroup.",
    whyRefreshH: "Waarom het beter is dan verversen",
    whyRefreshB: "Winkels met de populairste sets blokkeren bots, dus een gewone assistent bereikt de pagina niet als de voorraad terugkomt. QuickCatch draait in je eigen browser en je eigen sessie, volgt de pagina die je hebt geopend en legt het artikel in je mandje zodra de voorraad terug is, vóór alle anderen.",
    faqH: "Veelgestelde vragen",
    more: "Meer:",
    ctaHeading: "Pak de volgende {topic}-drop",
    ctaSub: "Installeer gratis, activeer de productpagina vóór de drop en QuickCatch legt het in je mandje zodra de voorraad terug is.",
    proBtn: "QuickCatch Pro — automatisch kopen",
    notReady: "Nog niet klaar om te installeren? Krijg een gratis seintje bij de volgende restock.",
    emailPh: "jij@email.com",
    getAlerts: "Gratis meldingen ontvangen",
    retailLabel: "Winkelprijs:",
    watchAtLabel: "Volg het op:",
    privacy: "Privacy",
    allDropGuides: "Alle drop-gidsen",
    jumpTo: "Ga naar:",
  },
  cats: { "TCG sets": "TCG-sets", "Stores": "Winkels", "vs Bots": "vs Bots", "Guides": "Gidsen" },
  msg: {
    invalidEmail: "Voer een geldig e-mailadres in.",
    alertDone: "Klaar. We waarschuwen je bij de volgende {topic}-drop.",
    alertPro: "Je staat op de oprichterslijst. We mailen je om het vast te leggen.",
    retry: "Probeer het over een minuut opnieuw.",
    netErr: "Netwerkfout — probeer opnieuw.",
  },
  index: {
    title: "Pokémon- & TCG-drop- en restockgidsen | QuickCatch",
    desc: "Pak elke Pokémon- en TCG-drop. Gidsen voor de populairste sets, alle winkels en hoe QuickCatch zich verhoudt tot bots.",
    h1: "Pokémon- & TCG-dropgidsen",
    lede: "Pak de sets die in seconden uitverkocht zijn. Installeer QuickCatch, activeer de pagina en hij legt het in je mandje zodra de voorraad terug is.",
  },
  gen: {
    set: {
      title: "Restock van {name} | QuickCatch",
      desc: "Pak de restock van {name}. QuickCatch volgt de pagina en legt het in je mandje zodra het weer op voorraad is.",
      h1: "Pak de restock van {name}",
      lede: "{name} is in seconden uitverkocht en wordt boven de winkelprijs doorverkocht. QuickCatch volgt de productpagina en legt het in je mandje zodra de voorraad terug is, zodat jij de winkelprijs betaalt.",
      faqs: [
        { q: "Waar komt {name} weer op voorraad?", a: "{where}. QuickCatch werkt op al die pagina's en legt het artikel in je mandje als de voorraad terugkomt." },
        { q: "Moet ik de pagina zelf in de gaten houden?", a: "Nee. Activeer QuickCatch vóór de drop en het volgt op de achtergrond. Houd Chrome open en je mag het tabblad sluiten." },
        { q: "Is QuickCatch gratis?", a: "Installeren en volgen is gratis. Pro voegt het volgen van meerdere artikelen tegelijk toe." },
      ],
    },
    store: {
      title: "{store} Pokémon restock-tracker | QuickCatch",
      desc: "Pak de Pokémon-restocks van {store}. QuickCatch volgt de productpagina en legt het in je mandje zodra het terug is.",
      h1: "Pak een {store} Pokémon-restock",
      lede: "{store} vult Pokémon-sets in golven aan en ze zijn snel weg. QuickCatch volgt de advertentie en legt het artikel in je mandje zodra de voorraad terug is.",
      faqs: [
        { q: "Werkt QuickCatch op {store}?", a: "Ja. Het leest de productpagina van {store} en legt het artikel in je mandje als de voorraad terugkomt. Jij rekent af." },
        { q: "Moet ik de pagina open laten?", a: "Nee. Activeer Volg deze drop en QuickCatch volgt op de achtergrond. Houd Chrome open en het legt het in je mandje als de voorraad terug is." },
        { q: "Zijn er kosten?", a: "Installeren en volgen is gratis. Pro voegt het volgen van meerdere artikelen tegelijk toe." },
      ],
    },
    vs: {
      title: "QuickCatch vs {them}: gratis Pokémon-dropcatcher",
      desc: "QuickCatch vs {them}. Een gratis manier, vanuit je browser, om Pokémon- en TCG-restocks te pakken, zonder server, zonder proxy's en zonder maandkosten.",
      h1: "QuickCatch vs {them}",
      lede: "{them} draait op servers in datacenters achter betaalde proxy's en richt zich op verkopers die in bulk kopen. QuickCatch doet het omgekeerde: het draait in je eigen browser en je eigen sessie, kost niets om te installeren en volgt de Pokémon- of TCG-pagina die jij wilt om het in je mandje te leggen zodra de voorraad terug is.",
      faqs: [
        { q: "Is QuickCatch een goed alternatief voor {them}?", a: "Ja. {them} is gemaakt voor grootschalig kopen vanaf servers. QuickCatch draait in je eigen browser voor één verzamelaar, kost niets en volgt Pokémon- en TCG-pagina's." },
        { q: "Heb ik proxy's of een server nodig?", a: "Nee. QuickCatch draait in het tabblad dat je al open hebt, in je eigen sessie. Geen proxy's te huren, geen server in te stellen." },
        { q: "Word ik geband?", a: "QuickCatch handelt als jou, op de pagina die je opende, en jij rekent af. Het draait niet vanuit een datacenter." },
      ],
      rows: [
        ["Prijs", "Gratis", "Betaalde licentie, vaak elk seizoen verlengd"],
        ["Waar het draait", "Jouw browser en jouw sessie", "Servers in datacenters met betaalde proxy's"],
        ["Proxy's", "Niet nodig", "Verplicht, apart in rekening gebracht"],
        ["Gemaakt voor", "Verzamelaars die er één voor de winkelprijs willen", "Verkopers die in bulk kopen"],
        ["Blokkeerrisico", "Handelt als jou, in jouw sessie", "Datacenterverkeer wordt op IP gemarkeerd"],
        ["Installatie", "Installeer in Chrome, open de pagina, tik op Volgen", "Cookgroup, server, proxylijst, taken"],
        ["Afrekenen", "Jij rekent zelf af", "Automatisch afrekenen, vaak tegen de winkelregels"],
        ["Leercurve", "Eén knop", "Steil — gidsen en community nodig"],
      ],
    },
    combo: {
      title: "Restock van {name} bij {store} | QuickCatch",
      desc: "Pak de restock van {name} bij {store}. QuickCatch volgt de {store}-pagina en legt het in je mandje zodra het terug is.",
      h1: "Pak de restock van {name} bij {store}",
      lede: "Als {name} weer op voorraad komt bij {store}, is het snel weg. QuickCatch volgt de productpagina van {store} en legt het in je mandje zodra de voorraad terug is, zodat jij de winkelprijs betaalt.",
      faqs: [
        { q: "Wanneer komt {name} weer op voorraad bij {store}?", a: "Restocks komen zonder waarschuwing. Activeer QuickCatch op de {store}-pagina en het volgt op de achtergrond tot de voorraad terug is." },
        { q: "Werkt QuickCatch op {store}?", a: "Ja. Het leest de {store}-pagina en legt {name} in je mandje als het terug is. Jij rekent af." },
        { q: "Is het gratis?", a: "Installeren en volgen is gratis. Pro voegt het volgen van meerdere artikelen tegelijk toe." },
      ],
    },
  },
};

// ---------------------------------------------------------------------------
const PL: L = {
  ui: {
    getFree: "Pobierz QuickCatch — za darmo",
    allGuides: "Wszystkie poradniki",
    howItWorks: "Jak działa QuickCatch",
    stepWord: "KROK",
    step1T: "Zainstaluj za darmo", step1D: "Jedno kliknięcie w Chrome.",
    step2T: "Uzbrój stronę", step2D: "Otwórz stronę produktu i kliknij Obserwuj ten drop.",
    step3T: "Dodaje do koszyka", step3D: "Przy restocku Twoje AI dodaje produkt. Ty finalizujesz zakup.",
    whyVersusH: "Dlaczego łowca w przeglądarce wygrywa z botem serwerowym",
    whyVersusB: "Boty serwerowe działają w centrach danych za proxy, czyli dokładnie tym ruchem, który sklepy wykrywają i blokują. QuickCatch działa w Twojej przeglądarce i Twojej sesji, obserwuje otwartą stronę i dodaje produkt do koszyka, gdy tylko wróci do sprzedaży. Bez licencji, bez proxy, bez cook group.",
    whyRefreshH: "Dlaczego wygrywa z odświeżaniem",
    whyRefreshB: "Sklepy z najgorętszymi setami blokują boty, więc zwykły asystent nie dotrze do strony, gdy wróci towar. QuickCatch działa w Twojej przeglądarce i Twojej sesji, obserwuje otwartą stronę i dodaje produkt do koszyka, gdy tylko wróci towar, przed wszystkimi.",
    faqH: "Najczęstsze pytania",
    more: "Więcej:",
    ctaHeading: "Złap następny drop: {topic}",
    ctaSub: "Zainstaluj za darmo, uzbrój stronę produktu przed dropem, a QuickCatch doda go do koszyka, gdy tylko wróci towar.",
    proBtn: "QuickCatch Pro — automatyczny zakup",
    notReady: "Nie chcesz jeszcze instalować? Otrzymaj darmowe powiadomienie przy następnym restocku.",
    emailPh: "ty@email.com",
    getAlerts: "Odbieraj darmowe powiadomienia",
    retailLabel: "Cena sklepowa:",
    watchAtLabel: "Obserwuj w:",
    privacy: "Prywatność",
    allDropGuides: "Wszystkie poradniki o dropach",
    jumpTo: "Przejdź do:",
  },
  cats: { "TCG sets": "Zestawy TCG", "Stores": "Sklepy", "vs Bots": "vs Boty", "Guides": "Poradniki" },
  msg: {
    invalidEmail: "Podaj prawidłowy e-mail.",
    alertDone: "Gotowe. Powiadomimy Cię przy następnym dropie: {topic}.",
    alertPro: "Jesteś na liście założycieli. Napiszemy do Ciebie, żeby to potwierdzić.",
    retry: "Spróbuj ponownie za minutę.",
    netErr: "Błąd sieci — spróbuj ponownie.",
  },
  index: {
    title: "Poradniki o dropach i restockach Pokémon i TCG | QuickCatch",
    desc: "Złap każdy drop Pokémon i TCG. Poradniki o najgorętszych setach, wszystkich sklepach i o tym, jak QuickCatch wypada przy botach.",
    h1: "Poradniki o dropach Pokémon i TCG",
    lede: "Złap sety, które znikają w kilka sekund. Zainstaluj QuickCatch, uzbrój stronę, a doda produkt do koszyka, gdy tylko wróci towar.",
  },
  gen: {
    set: {
      title: "Restock {name} | QuickCatch",
      desc: "Złap restock {name}. QuickCatch obserwuje stronę i dodaje produkt do koszyka, gdy tylko wróci do sprzedaży.",
      h1: "Złap restock {name}",
      lede: "{name} znika w kilka sekund i jest odsprzedawany powyżej ceny sklepowej. QuickCatch obserwuje stronę produktu i dodaje go do koszyka, gdy tylko wróci towar, żebyś zapłacił cenę sklepową.",
      faqs: [
        { q: "Gdzie {name} wraca do sprzedaży?", a: "{where}. QuickCatch działa na każdej z tych stron i dodaje produkt do koszyka, gdy wróci towar." },
        { q: "Czy muszę sam pilnować strony?", a: "Nie. Uzbrój QuickCatch przed dropem, a obserwuje w tle. Zostaw Chrome otwarty, kartę możesz zamknąć." },
        { q: "Czy QuickCatch jest darmowy?", a: "Instalacja i obserwowanie są darmowe. Pro dodaje obserwowanie kilku produktów naraz." },
      ],
    },
    store: {
      title: "Tracker restocków Pokémon w {store} | QuickCatch",
      desc: "Złap restocki Pokémon w {store}. QuickCatch obserwuje stronę produktu i dodaje go do koszyka, gdy tylko wróci.",
      h1: "Złap restock Pokémon w {store}",
      lede: "{store} uzupełnia sety Pokémon falami i znikają szybko. QuickCatch obserwuje ofertę i dodaje produkt do koszyka, gdy tylko wróci towar.",
      faqs: [
        { q: "Czy QuickCatch działa w {store}?", a: "Tak. Czyta stronę produktu w {store} i dodaje produkt do koszyka, gdy wróci towar. Ty finalizujesz zakup." },
        { q: "Czy muszę zostawić stronę otwartą?", a: "Nie. Włącz Obserwuj ten drop, a QuickCatch obserwuje w tle. Zostaw Chrome otwarty, a doda produkt do koszyka, gdy wróci towar." },
        { q: "Czy są jakieś opłaty?", a: "Instalacja i obserwowanie są darmowe. Pro dodaje obserwowanie kilku produktów naraz." },
      ],
    },
    vs: {
      title: "QuickCatch vs {them}: darmowy łowca dropów Pokémon",
      desc: "QuickCatch vs {them}. Darmowy sposób, z poziomu przeglądarki, na łapanie restocków Pokémon i TCG — bez serwera, bez proxy i bez abonamentu.",
      h1: "QuickCatch vs {them}",
      lede: "{them} działa na serwerach w centrach danych za płatnymi proxy i jest kierowany do odsprzedawców kupujących hurtowo. QuickCatch robi odwrotnie: działa w Twojej przeglądarce i Twojej sesji, nic nie kosztuje przy instalacji i obserwuje stronę Pokémon lub TCG, która Cię interesuje, by dodać ją do koszyka, gdy tylko wróci towar.",
      faqs: [
        { q: "Czy QuickCatch to dobra alternatywa dla {them}?", a: "Tak. {them} powstał do zakupów na dużą skalę z serwerów. QuickCatch działa w Twojej przeglądarce dla jednego kolekcjonera, nic nie kosztuje i obserwuje strony Pokémon i TCG." },
        { q: "Czy potrzebuję proxy lub serwera?", a: "Nie. QuickCatch działa w karcie, którą już masz otwartą, w Twojej sesji. Bez wynajmu proxy, bez konfiguracji serwera." },
        { q: "Czy dostanę bana?", a: "QuickCatch działa jako Ty, na stronie, którą otworzyłeś, a Ty finalizujesz zakup. Nie działa z centrum danych." },
      ],
      rows: [
        ["Cena", "Za darmo", "Płatna licencja, często odnawiana co sezon"],
        ["Gdzie działa", "Twoja przeglądarka i Twoja sesja", "Serwery w centrach danych z płatnymi proxy"],
        ["Proxy", "Niepotrzebne", "Wymagane, płatne osobno"],
        ["Stworzony dla", "Kolekcjonerów, którzy chcą jeden w cenie sklepowej", "Odsprzedawców kupujących hurtowo"],
        ["Ryzyko blokady", "Działa jako Ty, w Twojej sesji", "Ruch z centrum danych jest oznaczany po IP"],
        ["Konfiguracja", "Zainstaluj w Chrome, otwórz stronę, kliknij Obserwuj", "Cook group, serwer, lista proxy, zadania"],
        ["Zakup", "Ty finalizujesz zakup", "Automatyczny zakup, często wbrew regulaminowi sklepu"],
        ["Krzywa nauki", "Jeden przycisk", "Stroma — potrzebne poradniki i społeczność"],
      ],
    },
    combo: {
      title: "Restock {name} w {store} | QuickCatch",
      desc: "Złap restock {name} w {store}. QuickCatch obserwuje stronę {store} i dodaje produkt do koszyka, gdy tylko wróci.",
      h1: "Złap restock {name} w {store}",
      lede: "Gdy {name} wraca do sprzedaży w {store}, znika szybko. QuickCatch obserwuje stronę produktu w {store} i dodaje go do koszyka, gdy tylko wróci towar, żebyś zapłacił cenę sklepową.",
      faqs: [
        { q: "Kiedy {name} wraca do sprzedaży w {store}?", a: "Restocki pojawiają się bez ostrzeżenia. Uzbrój QuickCatch na stronie {store}, a obserwuje w tle, aż wróci towar." },
        { q: "Czy QuickCatch działa w {store}?", a: "Tak. Czyta stronę {store} i dodaje {name} do koszyka, gdy wróci. Ty finalizujesz zakup." },
        { q: "Czy to za darmo?", a: "Instalacja i obserwowanie są darmowe. Pro dodaje obserwowanie kilku produktów naraz." },
      ],
    },
  },
};

// ---------------------------------------------------------------------------
const JA: L = {
  ui: {
    getFree: "QuickCatch を入手 — 無料",
    allGuides: "すべてのガイド",
    howItWorks: "QuickCatch の仕組み",
    stepWord: "ステップ",
    step1T: "無料で追加", step1D: "Chrome でワンクリック。",
    step2T: "ページをセット", step2D: "商品ページを開き、「このドロップを見張る」をタップ。",
    step3T: "カートに入れる", step3D: "再入荷したらAIが追加。あなたは購入を完了するだけ。",
    whyVersusH: "ブラウザ型キャッチャーがサーバーボットに勝つ理由",
    whyVersusB: "サーバーボットはプロキシ経由でデータセンターから動きます。これはまさにストアが検知してブロックする通信です。QuickCatch はあなた自身のブラウザとログイン中のセッションで動き、開いたページを見張り、在庫が戻った瞬間に商品をカートへ追加します。ライセンスもプロキシもクックグループも不要です。",
    whyRefreshH: "更新の連打より速い理由",
    whyRefreshB: "人気セットを扱うストアはボットをブロックするため、普通のアシスタントでは在庫が戻ったページに届きません。QuickCatch はあなた自身のブラウザとセッションで動き、開いたページを見張り、在庫が戻った瞬間に商品をカートへ追加します。誰よりも早く。",
    faqH: "よくある質問",
    more: "もっと見る:",
    ctaHeading: "次の{topic}のドロップを狙う",
    ctaSub: "無料でインストールし、ドロップ前に商品ページをセットすれば、再入荷した瞬間に QuickCatch がカートへ入れます。",
    proBtn: "QuickCatch Pro — 自動購入",
    notReady: "まだインストールしない？ 次の再入荷時に無料でお知らせします。",
    emailPh: "you@email.com",
    getAlerts: "無料で通知を受け取る",
    retailLabel: "定価:",
    watchAtLabel: "見張る場所:",
    privacy: "プライバシー",
    allDropGuides: "すべてのドロップガイド",
    jumpTo: "移動:",
  },
  cats: { "TCG sets": "TCG セット", "Stores": "ストア", "vs Bots": "vs ボット", "Guides": "ガイド" },
  msg: {
    invalidEmail: "有効なメールアドレスを入力してください。",
    alertDone: "完了。次の{topic}のドロップ時にお知らせします。",
    alertPro: "ファウンダーリストに登録されました。確定のためメールします。",
    retry: "少し待ってからもう一度お試しください。",
    netErr: "ネットワークエラー — もう一度お試しください。",
  },
  index: {
    title: "ポケモン & TCG ドロップ・再入荷ガイド | QuickCatch",
    desc: "ポケモンとTCGのすべてのドロップを狙う。人気セット、主要ストア、QuickCatch とボットの比較ガイド。",
    h1: "ポケモン & TCG ドロップガイド",
    lede: "数秒で売り切れるセットを狙う。QuickCatch をインストールしてページをセットすれば、再入荷した瞬間にカートへ入れます。",
  },
  gen: {
    set: {
      title: "{name} の再入荷 | QuickCatch",
      desc: "{name} の再入荷を狙う。QuickCatch がページを見張り、在庫が戻った瞬間にカートへ入れます。",
      h1: "{name} の再入荷を狙う",
      lede: "{name} は数秒で売り切れ、定価より高く転売されます。QuickCatch は商品ページを見張り、在庫が戻った瞬間にカートへ入れるので、定価で買えます。",
      faqs: [
        { q: "{name} はどこで再入荷しますか？", a: "{where}。QuickCatch はそれらのどのページでも動作し、在庫が戻ったらカートへ追加します。" },
        { q: "自分でページを見張る必要がありますか？", a: "いいえ。ドロップ前に QuickCatch をセットすれば、バックグラウンドで見張ります。Chrome を開いたままにすれば、タブは閉じて構いません。" },
        { q: "QuickCatch は無料ですか？", a: "インストールと見張りは無料です。Pro では複数の商品を同時に見張れます。" },
      ],
    },
    store: {
      title: "{store} のポケモン再入荷トラッカー | QuickCatch",
      desc: "{store} のポケモン再入荷を狙う。QuickCatch が商品ページを見張り、戻った瞬間にカートへ入れます。",
      h1: "{store} のポケモン再入荷を狙う",
      lede: "{store} はポケモンのセットを波で補充し、すぐに売り切れます。QuickCatch は出品を見張り、在庫が戻った瞬間にカートへ入れます。",
      faqs: [
        { q: "QuickCatch は {store} で動きますか？", a: "はい。{store} の商品ページを読み取り、在庫が戻ったらカートへ追加します。購入はあなたが完了します。" },
        { q: "ページを開いたままにする必要がありますか？", a: "いいえ。「このドロップを見張る」をオンにすれば、QuickCatch はバックグラウンドで見張ります。Chrome を開いたままにすれば、在庫が戻った時にカートへ入れます。" },
        { q: "料金はかかりますか？", a: "インストールと見張りは無料です。Pro では複数の商品を同時に見張れます。" },
      ],
    },
    vs: {
      title: "QuickCatch vs {them}：無料のポケモン・ドロップキャッチャー",
      desc: "QuickCatch vs {them}。サーバーもプロキシも月額もなしで、ブラウザからポケモンとTCGの再入荷を狙う無料の方法。",
      h1: "QuickCatch vs {them}",
      lede: "{them} は有料プロキシ経由でデータセンターのサーバーから動き、大量購入する転売業者向けです。QuickCatch は逆です。あなた自身のブラウザとセッションで動き、インストールは無料で、狙っているポケモンやTCGのページを見張り、在庫が戻った瞬間にカートへ入れます。",
      faqs: [
        { q: "QuickCatch は {them} の良い代替になりますか？", a: "はい。{them} はサーバーからの大規模購入向けです。QuickCatch は一人のコレクター向けにあなたのブラウザで動き、無料で、ポケモンとTCGのページを見張ります。" },
        { q: "プロキシやサーバーは必要ですか？", a: "いいえ。QuickCatch はすでに開いているタブ、あなたのセッションで動きます。借りるプロキシも設定するサーバーもありません。" },
        { q: "BAN されますか？", a: "QuickCatch はあなたとして、あなたが開いたページで動き、購入はあなたが完了します。データセンターからは動きません。" },
      ],
      rows: [
        ["価格", "無料", "有料ライセンス、シーズンごとに更新が多い"],
        ["動作場所", "あなたのブラウザとセッション", "プロキシ付きデータセンターのサーバー"],
        ["プロキシ", "不要", "必須、別料金"],
        ["対象", "定価で1つ欲しいコレクター", "大量購入する転売業者"],
        ["ブロックの危険", "あなたとして、あなたのセッションで動作", "データセンターの通信はIPで識別される"],
        ["設定", "Chrome に追加し、ページを開いて「見張る」をタップ", "クックグループ、サーバー、プロキシリスト、タスク"],
        ["購入", "あなたが購入を完了", "自動購入、ストア規約に反することが多い"],
        ["習得のしやすさ", "ボタン1つ", "急。ガイドとコミュニティが必要"],
      ],
    },
    combo: {
      title: "{store} での {name} 再入荷 | QuickCatch",
      desc: "{store} での {name} の再入荷を狙う。QuickCatch が {store} のページを見張り、戻った瞬間にカートへ入れます。",
      h1: "{store} での {name} 再入荷を狙う",
      lede: "{store} で {name} が再入荷すると、すぐに売り切れます。QuickCatch は {store} の商品ページを見張り、在庫が戻った瞬間にカートへ入れるので、定価で買えます。",
      faqs: [
        { q: "{store} で {name} はいつ再入荷しますか？", a: "再入荷は予告なく来ます。{store} の商品ページで QuickCatch をセットすれば、在庫が戻るまでバックグラウンドで見張ります。" },
        { q: "QuickCatch は {store} で動きますか？", a: "はい。{store} のページを読み取り、戻ったら {name} をカートへ追加します。購入はあなたが完了します。" },
        { q: "無料ですか？", a: "インストールと見張りは無料です。Pro では複数の商品を同時に見張れます。" },
      ],
    },
  },
};

// ---------------------------------------------------------------------------
const KO: L = {
  ui: {
    getFree: "QuickCatch 받기 — 무료",
    allGuides: "모든 가이드",
    howItWorks: "QuickCatch 작동 방식",
    stepWord: "단계",
    step1T: "무료로 추가", step1D: "Chrome에서 클릭 한 번.",
    step2T: "페이지 설정", step2D: "상품 페이지를 열고 이 드롭 감시를 누르세요.",
    step3T: "장바구니에 담기", step3D: "재입고되면 AI가 담아요. 결제는 직접 하세요.",
    whyVersusH: "브라우저 캐처가 서버 봇을 이기는 이유",
    whyVersusB: "서버 봇은 프록시를 거쳐 데이터센터에서 돌아갑니다. 바로 상점이 감지하고 차단하는 트래픽이죠. QuickCatch는 당신의 브라우저와 로그인된 세션에서 돌아가며, 연 페이지를 감시하다가 재고가 돌아오는 순간 상품을 장바구니에 담습니다. 라이선스도, 프록시도, 쿡 그룹도 필요 없습니다.",
    whyRefreshH: "새로고침보다 빠른 이유",
    whyRefreshB: "인기 세트를 파는 상점은 봇을 차단하므로 일반 어시스턴트는 재고가 돌아온 페이지에 닿지 못합니다. QuickCatch는 당신의 브라우저와 세션에서 돌아가며, 연 페이지를 감시하다가 재고가 돌아오는 순간 상품을 장바구니에 담습니다. 누구보다 먼저요.",
    faqH: "자주 묻는 질문",
    more: "더 보기:",
    ctaHeading: "다음 {topic} 드롭을 잡으세요",
    ctaSub: "무료로 설치하고 드롭 전에 상품 페이지를 설정하면, 재입고되는 순간 QuickCatch가 장바구니에 담습니다.",
    proBtn: "QuickCatch Pro — 자동 구매",
    notReady: "아직 설치하기 어렵나요? 다음 재입고 때 무료로 알려드려요.",
    emailPh: "you@email.com",
    getAlerts: "무료 알림 받기",
    retailLabel: "정가:",
    watchAtLabel: "감시할 곳:",
    privacy: "개인정보",
    allDropGuides: "모든 드롭 가이드",
    jumpTo: "이동:",
  },
  cats: { "TCG sets": "TCG 세트", "Stores": "상점", "vs Bots": "vs 봇", "Guides": "가이드" },
  msg: {
    invalidEmail: "유효한 이메일을 입력하세요.",
    alertDone: "완료. 다음 {topic} 드롭 때 알려드릴게요.",
    alertPro: "파운더 리스트에 등록되었습니다. 확정을 위해 이메일을 보낼게요.",
    retry: "잠시 후 다시 시도하세요.",
    netErr: "네트워크 오류 — 다시 시도하세요.",
  },
  index: {
    title: "포켓몬 & TCG 드롭·재입고 가이드 | QuickCatch",
    desc: "모든 포켓몬과 TCG 드롭을 잡으세요. 인기 세트, 주요 상점, QuickCatch와 봇 비교 가이드.",
    h1: "포켓몬 & TCG 드롭 가이드",
    lede: "몇 초 만에 품절되는 세트를 잡으세요. QuickCatch를 설치하고 페이지를 설정하면 재입고되는 순간 장바구니에 담습니다.",
  },
  gen: {
    set: {
      title: "{name} 재입고 | QuickCatch",
      desc: "{name} 재입고를 잡으세요. QuickCatch가 페이지를 감시하다가 재고가 돌아오는 순간 장바구니에 담습니다.",
      h1: "{name} 재입고를 잡으세요",
      lede: "{name}은(는) 몇 초 만에 품절되고 정가보다 높게 재판매됩니다. QuickCatch가 상품 페이지를 감시하다가 재고가 돌아오는 순간 장바구니에 담아, 정가에 살 수 있게 합니다.",
      faqs: [
        { q: "{name}은(는) 어디서 재입고되나요?", a: "{where}. QuickCatch는 그 모든 페이지에서 작동하며 재고가 돌아오면 상품을 장바구니에 담습니다." },
        { q: "직접 페이지를 지켜봐야 하나요?", a: "아니요. 드롭 전에 QuickCatch를 설정하면 백그라운드에서 감시합니다. Chrome을 열어 두면 탭은 닫아도 됩니다." },
        { q: "QuickCatch는 무료인가요?", a: "설치와 감시는 무료입니다. Pro에서는 여러 상품을 동시에 감시할 수 있습니다." },
      ],
    },
    store: {
      title: "{store} 포켓몬 재입고 추적기 | QuickCatch",
      desc: "{store}의 포켓몬 재입고를 잡으세요. QuickCatch가 상품 페이지를 감시하다가 돌아오는 순간 장바구니에 담습니다.",
      h1: "{store} 포켓몬 재입고를 잡으세요",
      lede: "{store}은(는) 포켓몬 세트를 물량으로 채우고 금방 품절됩니다. QuickCatch가 상품을 감시하다가 재고가 돌아오는 순간 장바구니에 담습니다.",
      faqs: [
        { q: "QuickCatch는 {store}에서 작동하나요?", a: "네. {store}의 상품 페이지를 읽고 재고가 돌아오면 장바구니에 담습니다. 결제는 직접 하세요." },
        { q: "페이지를 열어 둬야 하나요?", a: "아니요. 이 드롭 감시를 켜면 QuickCatch가 백그라운드에서 감시합니다. Chrome을 열어 두면 재고가 돌아올 때 장바구니에 담습니다." },
        { q: "요금이 있나요?", a: "설치와 감시는 무료입니다. Pro에서는 여러 상품을 동시에 감시할 수 있습니다." },
      ],
    },
    vs: {
      title: "QuickCatch vs {them}: 무료 포켓몬 드롭 캐처",
      desc: "QuickCatch vs {them}. 서버도, 프록시도, 월 요금도 없이 브라우저에서 포켓몬과 TCG 재입고를 잡는 무료 방법.",
      h1: "QuickCatch vs {them}",
      lede: "{them}은(는) 유료 프록시를 거쳐 데이터센터 서버에서 돌아가며 대량 구매하는 리셀러를 겨냥합니다. QuickCatch는 반대입니다. 당신의 브라우저와 세션에서 돌아가고, 설치가 무료이며, 원하는 포켓몬·TCG 페이지를 감시하다가 재고가 돌아오는 순간 장바구니에 담습니다.",
      faqs: [
        { q: "QuickCatch는 {them}의 좋은 대안인가요?", a: "네. {them}은 서버에서의 대규모 구매용입니다. QuickCatch는 한 명의 컬렉터를 위해 당신의 브라우저에서 돌아가고, 무료이며, 포켓몬과 TCG 페이지를 감시합니다." },
        { q: "프록시나 서버가 필요한가요?", a: "아니요. QuickCatch는 이미 열려 있는 탭, 당신의 세션에서 돌아갑니다. 빌릴 프록시도, 설정할 서버도 없습니다." },
        { q: "차단되나요?", a: "QuickCatch는 당신으로서, 당신이 연 페이지에서 작동하고 결제는 당신이 합니다. 데이터센터에서 돌아가지 않습니다." },
      ],
      rows: [
        ["가격", "무료", "유료 라이선스, 시즌마다 갱신되는 경우가 많음"],
        ["작동 위치", "당신의 브라우저와 세션", "프록시를 쓰는 데이터센터 서버"],
        ["프록시", "필요 없음", "필수, 별도 과금"],
        ["대상", "정가로 하나 원하는 컬렉터", "대량 구매하는 리셀러"],
        ["차단 위험", "당신으로서, 당신의 세션에서 작동", "데이터센터 트래픽은 IP로 표시됨"],
        ["설정", "Chrome에 추가, 페이지 열고 감시 누르기", "쿡 그룹, 서버, 프록시 목록, 작업"],
        ["결제", "당신이 직접 결제", "자동 결제, 상점 약관 위반인 경우가 많음"],
        ["학습 난이도", "버튼 하나", "가파름 — 가이드와 커뮤니티 필요"],
      ],
    },
    combo: {
      title: "{store}의 {name} 재입고 | QuickCatch",
      desc: "{store}에서 {name} 재입고를 잡으세요. QuickCatch가 {store} 페이지를 감시하다가 돌아오는 순간 장바구니에 담습니다.",
      h1: "{store}에서 {name} 재입고를 잡으세요",
      lede: "{store}에서 {name}이(가) 재입고되면 금방 품절됩니다. QuickCatch가 {store} 상품 페이지를 감시하다가 재고가 돌아오는 순간 장바구니에 담아, 정가에 살 수 있게 합니다.",
      faqs: [
        { q: "{store}에서 {name}은(는) 언제 재입고되나요?", a: "재입고는 예고 없이 옵니다. {store} 상품 페이지에서 QuickCatch를 설정하면 재고가 돌아올 때까지 백그라운드에서 감시합니다." },
        { q: "QuickCatch는 {store}에서 작동하나요?", a: "네. {store} 페이지를 읽고 돌아오면 {name}을(를) 장바구니에 담습니다. 결제는 직접 하세요." },
        { q: "무료인가요?", a: "설치와 감시는 무료입니다. Pro에서는 여러 상품을 동시에 감시할 수 있습니다." },
      ],
    },
  },
};

// ---------------------------------------------------------------------------
const ZH: L = {
  ui: {
    getFree: "获取 QuickCatch — 免费",
    allGuides: "全部指南",
    howItWorks: "QuickCatch 如何运作",
    stepWord: "步骤",
    step1T: "免费添加", step1D: "在 Chrome 中一键添加。",
    step2T: "设置页面", step2D: "打开商品页面，点按“盯住这次补货”。",
    step3T: "加入购物车", step3D: "补货时你的 AI 会加入，你只需结账。",
    whyVersusH: "为什么浏览器抢购器胜过服务器机器人",
    whyVersusB: "服务器机器人通过代理在数据中心运行，这正是商店会检测并封锁的流量。QuickCatch 在你自己的浏览器和已登录的会话中运行，盯住你打开的页面，并在补货的那一刻把商品加入购物车。无需许可证、无需代理、无需 cook group。",
    whyRefreshH: "为什么比刷新更快",
    whyRefreshB: "卖热门套装的商店会封锁机器人，所以普通助手在补货时无法到达页面。QuickCatch 在你自己的浏览器和会话中运行，盯住你打开的页面，并在补货的那一刻把商品加入购物车，比所有人都快。",
    faqH: "常见问题",
    more: "更多：",
    ctaHeading: "抢到下一次 {topic} 补货",
    ctaSub: "免费安装，在补货前设置好商品页面，补货的那一刻 QuickCatch 就把它加入购物车。",
    proBtn: "QuickCatch Pro — 自动抢购",
    notReady: "还不想安装？下次补货时免费提醒你。",
    emailPh: "you@email.com",
    getAlerts: "获取免费提醒",
    retailLabel: "原价：",
    watchAtLabel: "在此盯住：",
    privacy: "隐私",
    allDropGuides: "全部补货指南",
    jumpTo: "跳转到：",
  },
  cats: { "TCG sets": "TCG 套装", "Stores": "商店", "vs Bots": "对比机器人", "Guides": "指南" },
  msg: {
    invalidEmail: "请输入有效的邮箱。",
    alertDone: "完成。下次 {topic} 补货时我们会提醒你。",
    alertPro: "你已在创始名单上。我们会发邮件确认。",
    retry: "请一分钟后重试。",
    netErr: "网络错误 — 请重试。",
  },
  index: {
    title: "宝可梦与 TCG 补货抢购指南 | QuickCatch",
    desc: "抢到每一次宝可梦和 TCG 补货。覆盖热门套装、各大商店，以及 QuickCatch 与机器人的对比。",
    h1: "宝可梦与 TCG 补货指南",
    lede: "抢到几秒内售罄的套装。安装 QuickCatch 并设置页面，补货的那一刻就加入购物车。",
  },
  gen: {
    set: {
      title: "{name} 补货 | QuickCatch",
      desc: "抢到 {name} 补货。QuickCatch 盯住页面，补货的那一刻把它加入购物车。",
      h1: "抢到 {name} 补货",
      lede: "{name} 几秒内售罄，并以高于原价转售。QuickCatch 盯住商品页面，补货的那一刻把它加入购物车，让你以原价买到。",
      faqs: [
        { q: "{name} 在哪里补货？", a: "{where}。QuickCatch 在这些页面都能运行，补货时把商品加入购物车。" },
        { q: "我需要自己盯着页面吗？", a: "不需要。补货前设置好 QuickCatch，它会在后台盯住。保持 Chrome 打开即可，标签页可以关闭。" },
        { q: "QuickCatch 免费吗？", a: "安装和盯货免费。Pro 可同时盯住多个商品。" },
      ],
    },
    store: {
      title: "{store} 宝可梦补货追踪器 | QuickCatch",
      desc: "抢到 {store} 的宝可梦补货。QuickCatch 盯住商品页面，补货的那一刻把它加入购物车。",
      h1: "抢到 {store} 宝可梦补货",
      lede: "{store} 分批补货宝可梦套装，很快售罄。QuickCatch 盯住商品，补货的那一刻把它加入购物车。",
      faqs: [
        { q: "QuickCatch 在 {store} 上能用吗？", a: "能。它读取 {store} 的商品页面，补货时把商品加入购物车。结账由你完成。" },
        { q: "我需要让页面一直开着吗？", a: "不需要。开启“盯住这次补货”，QuickCatch 会在后台盯住。保持 Chrome 打开，补货时它就把商品加入购物车。" },
        { q: "有费用吗？", a: "安装和盯货免费。Pro 可同时盯住多个商品。" },
      ],
    },
    vs: {
      title: "QuickCatch 对比 {them}：免费宝可梦补货抢购器",
      desc: "QuickCatch 对比 {them}。无需服务器、无需代理、无需月费，在浏览器里抢宝可梦和 TCG 补货的免费方式。",
      h1: "QuickCatch 对比 {them}",
      lede: "{them} 通过付费代理在数据中心服务器上运行，面向批量购买的转卖者。QuickCatch 正相反：在你自己的浏览器和会话中运行，安装免费，盯住你关注的宝可梦或 TCG 页面，补货的那一刻把它加入购物车。",
      faqs: [
        { q: "QuickCatch 是 {them} 的好替代品吗？", a: "是的。{them} 为服务器上的大规模购买而生。QuickCatch 为单个收藏者在你的浏览器中运行，免费，并盯住宝可梦和 TCG 页面。" },
        { q: "我需要代理或服务器吗？", a: "不需要。QuickCatch 在你已经打开的标签页、你的会话中运行。无需租用代理，无需配置服务器。" },
        { q: "我会被封吗？", a: "QuickCatch 以你的身份、在你打开的页面上运行，结账由你完成。它不在数据中心运行。" },
      ],
      rows: [
        ["价格", "免费", "付费许可证，常按季续费"],
        ["运行位置", "你的浏览器和会话", "带付费代理的数据中心服务器"],
        ["代理", "无需", "必须，单独收费"],
        ["面向", "想以原价买一个的收藏者", "批量购买的转卖者"],
        ["封禁风险", "以你的身份在你的会话中运行", "数据中心流量按 IP 标记"],
        ["设置", "在 Chrome 中添加，打开页面，点按盯住", "cook group、服务器、代理列表、任务"],
        ["结账", "你自己结账", "自动结账，常违反商店条款"],
        ["上手难度", "一个按钮", "陡峭 — 需要指南和社区"],
      ],
    },
    combo: {
      title: "{store} 的 {name} 补货 | QuickCatch",
      desc: "抢到 {store} 的 {name} 补货。QuickCatch 盯住 {store} 页面，补货的那一刻把它加入购物车。",
      h1: "抢到 {store} 的 {name} 补货",
      lede: "{name} 在 {store} 补货时会很快售罄。QuickCatch 盯住 {store} 的商品页面，补货的那一刻把它加入购物车，让你以原价买到。",
      faqs: [
        { q: "{name} 在 {store} 什么时候补货？", a: "补货毫无预警。在 {store} 页面上设置 QuickCatch，它会在后台盯住直到补货。" },
        { q: "QuickCatch 在 {store} 上能用吗？", a: "能。它读取 {store} 页面，补货时把 {name} 加入购物车。结账由你完成。" },
        { q: "免费吗？", a: "安装和盯货免费。Pro 可同时盯住多个商品。" },
      ],
    },
  },
};

// ---------------------------------------------------------------------------
const ZH_HANT: L = {
  ui: {
    getFree: "取得 QuickCatch — 免費",
    allGuides: "所有指南",
    howItWorks: "QuickCatch 如何運作",
    stepWord: "步驟",
    step1T: "免費新增", step1D: "在 Chrome 中一鍵新增。",
    step2T: "設定頁面", step2D: "開啟商品頁面，點按「盯住這次補貨」。",
    step3T: "加入購物車", step3D: "補貨時你的 AI 會加入，你只需結帳。",
    whyVersusH: "為什麼瀏覽器搶購器勝過伺服器機器人",
    whyVersusB: "伺服器機器人透過代理在資料中心運行，這正是商店會偵測並封鎖的流量。QuickCatch 在你自己的瀏覽器和已登入的工作階段中運行，盯住你開啟的頁面，並在補貨的那一刻把商品加入購物車。無需授權、無需代理、無需 cook group。",
    whyRefreshH: "為什麼比重新整理更快",
    whyRefreshB: "賣熱門套裝的商店會封鎖機器人，所以一般助理在補貨時無法到達頁面。QuickCatch 在你自己的瀏覽器和工作階段中運行，盯住你開啟的頁面，並在補貨的那一刻把商品加入購物車，比所有人都快。",
    faqH: "常見問題",
    more: "更多：",
    ctaHeading: "搶到下一次 {topic} 補貨",
    ctaSub: "免費安裝，在補貨前設定好商品頁面，補貨的那一刻 QuickCatch 就把它加入購物車。",
    proBtn: "QuickCatch Pro — 自動搶購",
    notReady: "還不想安裝？下次補貨時免費提醒你。",
    emailPh: "you@email.com",
    getAlerts: "取得免費提醒",
    retailLabel: "原價：",
    watchAtLabel: "在此盯住：",
    privacy: "隱私",
    allDropGuides: "所有補貨指南",
    jumpTo: "前往：",
  },
  cats: { "TCG sets": "TCG 套裝", "Stores": "商店", "vs Bots": "對比機器人", "Guides": "指南" },
  msg: {
    invalidEmail: "請輸入有效的電子郵件。",
    alertDone: "完成。下次 {topic} 補貨時我們會提醒你。",
    alertPro: "你已在創始名單上。我們會寄電子郵件確認。",
    retry: "請一分鐘後重試。",
    netErr: "網路錯誤 — 請重試。",
  },
  index: {
    title: "寶可夢與 TCG 補貨搶購指南 | QuickCatch",
    desc: "搶到每一次寶可夢和 TCG 補貨。涵蓋熱門套裝、各大商店，以及 QuickCatch 與機器人的比較。",
    h1: "寶可夢與 TCG 補貨指南",
    lede: "搶到幾秒內售罄的套裝。安裝 QuickCatch 並設定頁面，補貨的那一刻就加入購物車。",
  },
  gen: {
    set: {
      title: "{name} 補貨 | QuickCatch",
      desc: "搶到 {name} 補貨。QuickCatch 盯住頁面，補貨的那一刻把它加入購物車。",
      h1: "搶到 {name} 補貨",
      lede: "{name} 幾秒內售罄，並以高於原價轉售。QuickCatch 盯住商品頁面，補貨的那一刻把它加入購物車，讓你以原價買到。",
      faqs: [
        { q: "{name} 在哪裡補貨？", a: "{where}。QuickCatch 在這些頁面都能運行，補貨時把商品加入購物車。" },
        { q: "我需要自己盯著頁面嗎？", a: "不需要。補貨前設定好 QuickCatch，它會在背景盯住。保持 Chrome 開啟即可，分頁可以關閉。" },
        { q: "QuickCatch 免費嗎？", a: "安裝和盯貨免費。Pro 可同時盯住多個商品。" },
      ],
    },
    store: {
      title: "{store} 寶可夢補貨追蹤器 | QuickCatch",
      desc: "搶到 {store} 的寶可夢補貨。QuickCatch 盯住商品頁面，補貨的那一刻把它加入購物車。",
      h1: "搶到 {store} 寶可夢補貨",
      lede: "{store} 分批補貨寶可夢套裝，很快售罄。QuickCatch 盯住商品，補貨的那一刻把它加入購物車。",
      faqs: [
        { q: "QuickCatch 在 {store} 上能用嗎？", a: "能。它讀取 {store} 的商品頁面，補貨時把商品加入購物車。結帳由你完成。" },
        { q: "我需要讓頁面一直開著嗎？", a: "不需要。開啟「盯住這次補貨」，QuickCatch 會在背景盯住。保持 Chrome 開啟，補貨時它就把商品加入購物車。" },
        { q: "有費用嗎？", a: "安裝和盯貨免費。Pro 可同時盯住多個商品。" },
      ],
    },
    vs: {
      title: "QuickCatch 對比 {them}：免費寶可夢補貨搶購器",
      desc: "QuickCatch 對比 {them}。無需伺服器、無需代理、無需月費，在瀏覽器裡搶寶可夢和 TCG 補貨的免費方式。",
      h1: "QuickCatch 對比 {them}",
      lede: "{them} 透過付費代理在資料中心伺服器上運行，面向大量購買的轉賣者。QuickCatch 正相反：在你自己的瀏覽器和工作階段中運行，安裝免費，盯住你關注的寶可夢或 TCG 頁面，補貨的那一刻把它加入購物車。",
      faqs: [
        { q: "QuickCatch 是 {them} 的好替代品嗎？", a: "是的。{them} 為伺服器上的大規模購買而生。QuickCatch 為單一收藏家在你的瀏覽器中運行，免費，並盯住寶可夢和 TCG 頁面。" },
        { q: "我需要代理或伺服器嗎？", a: "不需要。QuickCatch 在你已經開啟的分頁、你的工作階段中運行。無需租用代理，無需設定伺服器。" },
        { q: "我會被封嗎？", a: "QuickCatch 以你的身分、在你開啟的頁面上運行，結帳由你完成。它不在資料中心運行。" },
      ],
      rows: [
        ["價格", "免費", "付費授權，常按季續費"],
        ["運行位置", "你的瀏覽器和工作階段", "帶付費代理的資料中心伺服器"],
        ["代理", "無需", "必須，另外收費"],
        ["面向", "想以原價買一個的收藏家", "大量購買的轉賣者"],
        ["封鎖風險", "以你的身分在你的工作階段中運行", "資料中心流量按 IP 標記"],
        ["設定", "在 Chrome 中新增，開啟頁面，點按盯住", "cook group、伺服器、代理清單、任務"],
        ["結帳", "你自己結帳", "自動結帳，常違反商店條款"],
        ["上手難度", "一個按鈕", "陡峭 — 需要指南和社群"],
      ],
    },
    combo: {
      title: "{store} 的 {name} 補貨 | QuickCatch",
      desc: "搶到 {store} 的 {name} 補貨。QuickCatch 盯住 {store} 頁面，補貨的那一刻把它加入購物車。",
      h1: "搶到 {store} 的 {name} 補貨",
      lede: "{name} 在 {store} 補貨時會很快售罄。QuickCatch 盯住 {store} 的商品頁面，補貨的那一刻把它加入購物車，讓你以原價買到。",
      faqs: [
        { q: "{name} 在 {store} 什麼時候補貨？", a: "補貨毫無預警。在 {store} 頁面上設定 QuickCatch，它會在背景盯住直到補貨。" },
        { q: "QuickCatch 在 {store} 上能用嗎？", a: "能。它讀取 {store} 頁面，補貨時把 {name} 加入購物車。結帳由你完成。" },
        { q: "免費嗎？", a: "安裝和盯貨免費。Pro 可同時盯住多個商品。" },
      ],
    },
  },
};

export const T: Record<Lang, L> = {
  en: EN, es: ES, fr: FR, de: DE, pt: PT, it: IT,
  nl: NL, pl: PL, ja: JA, ko: KO, zh: ZH, "zh-Hant": ZH_HANT,
};

// ---------------------------------------------------------------------------
// Paid plans (live Stripe). The buy buttons POST to /api/v1/stripe/checkout
// {email, plan} and redirect to the returned cs_live URL. Plans: pro ($99/mo),
// reseller ($299/mo). emailPrompt/checkoutErr are injected into the page script.
export interface PriceStrings {
  pricingH: string; perMo: string;
  proDesc: string; proCta: string;
  resellerDesc: string; resellerCta: string;
  popular: string; planFoot: string;
  emailPrompt: string; checkoutErr: string;
}

export const PRICING: Record<Lang, PriceStrings> = {
  en: {
    pricingH: "Go Pro and catch every drop", perMo: "/mo",
    proDesc: "Auto-cop several drops at once, with priority watching.", proCta: "Get Pro",
    resellerDesc: "For resellers: the most items watched at once, top priority, highest limits.", resellerCta: "Go Reseller",
    popular: "Most popular", planFoot: "Cancel anytime. Secure checkout by Stripe.",
    emailPrompt: "Enter your email to start checkout:", checkoutErr: "Couldn't start checkout — try again.",
  },
  es: {
    pricingH: "Hazte Pro y caza cada drop", perMo: "/mes",
    proDesc: "Compra automática de varios drops a la vez, con vigilancia prioritaria.", proCta: "Conseguir Pro",
    resellerDesc: "Para revendedores: el máximo de artículos vigilados a la vez, máxima prioridad y límites más altos.", resellerCta: "Hazte Reseller",
    popular: "Más popular", planFoot: "Cancela cuando quieras. Pago seguro con Stripe.",
    emailPrompt: "Introduce tu email para iniciar el pago:", checkoutErr: "No se pudo iniciar el pago — inténtalo de nuevo.",
  },
  fr: {
    pricingH: "Passez Pro et attrapez chaque drop", perMo: "/mois",
    proDesc: "Achat auto de plusieurs drops à la fois, avec surveillance prioritaire.", proCta: "Passer Pro",
    resellerDesc: "Pour les revendeurs : le plus d'articles surveillés à la fois, priorité maximale, limites les plus élevées.", resellerCta: "Passer Reseller",
    popular: "Le plus populaire", planFoot: "Annulez à tout moment. Paiement sécurisé par Stripe.",
    emailPrompt: "Entrez votre email pour lancer le paiement :", checkoutErr: "Impossible de lancer le paiement — réessayez.",
  },
  de: {
    pricingH: "Hol dir Pro und schnapp dir jeden Drop", perMo: "/Mon.",
    proDesc: "Auto-Kauf mehrerer Drops gleichzeitig, mit priorisierter Überwachung.", proCta: "Pro holen",
    resellerDesc: "Für Reseller: die meisten Artikel gleichzeitig überwacht, höchste Priorität, höchste Limits.", resellerCta: "Reseller holen",
    popular: "Am beliebtesten", planFoot: "Jederzeit kündbar. Sichere Zahlung über Stripe.",
    emailPrompt: "Gib deine E-Mail ein, um die Zahlung zu starten:", checkoutErr: "Zahlung konnte nicht gestartet werden — versuch es erneut.",
  },
  pt: {
    pricingH: "Seja Pro e garanta cada drop", perMo: "/mês",
    proDesc: "Compra automática de vários drops ao mesmo tempo, com vigilância prioritária.", proCta: "Assinar Pro",
    resellerDesc: "Para revendedores: o máximo de itens vigiados ao mesmo tempo, prioridade máxima e limites mais altos.", resellerCta: "Assinar Reseller",
    popular: "Mais popular", planFoot: "Cancele quando quiser. Pagamento seguro pela Stripe.",
    emailPrompt: "Digite seu e-mail para iniciar o pagamento:", checkoutErr: "Não foi possível iniciar o pagamento — tente de novo.",
  },
  it: {
    pricingH: "Passa a Pro e prendi ogni drop", perMo: "/mese",
    proDesc: "Acquisto automatico di più drop insieme, con sorveglianza prioritaria.", proCta: "Passa a Pro",
    resellerDesc: "Per i rivenditori: il massimo di articoli sorvegliati insieme, priorità più alta, limiti più alti.", resellerCta: "Passa a Reseller",
    popular: "Più popolare", planFoot: "Disdici quando vuoi. Pagamento sicuro con Stripe.",
    emailPrompt: "Inserisci la tua email per avviare il pagamento:", checkoutErr: "Impossibile avviare il pagamento — riprova.",
  },
  nl: {
    pricingH: "Word Pro en pak elke drop", perMo: "/mnd",
    proDesc: "Automatisch kopen van meerdere drops tegelijk, met voorrang bij het volgen.", proCta: "Word Pro",
    resellerDesc: "Voor verkopers: de meeste artikelen tegelijk gevolgd, hoogste prioriteit, hoogste limieten.", resellerCta: "Word Reseller",
    popular: "Populairst", planFoot: "Altijd opzegbaar. Veilig afrekenen via Stripe.",
    emailPrompt: "Voer je e-mailadres in om af te rekenen:", checkoutErr: "Afrekenen kon niet starten — probeer opnieuw.",
  },
  pl: {
    pricingH: "Przejdź na Pro i łap każdy drop", perMo: "/mies.",
    proDesc: "Automatyczny zakup kilku dropów naraz, z priorytetowym obserwowaniem.", proCta: "Kup Pro",
    resellerDesc: "Dla odsprzedawców: najwięcej obserwowanych produktów naraz, najwyższy priorytet i najwyższe limity.", resellerCta: "Kup Reseller",
    popular: "Najpopularniejsze", planFoot: "Anuluj w dowolnym momencie. Bezpieczna płatność przez Stripe.",
    emailPrompt: "Podaj e-mail, aby rozpocząć płatność:", checkoutErr: "Nie udało się rozpocząć płatności — spróbuj ponownie.",
  },
  ja: {
    pricingH: "Pro でどのドロップも逃さない", perMo: "/月",
    proDesc: "複数のドロップを同時に自動購入。優先的に見張ります。", proCta: "Pro を入手",
    resellerDesc: "転売者向け：最も多くの商品を同時に見張り、最優先、上限も最大。", resellerCta: "Reseller を入手",
    popular: "人気No.1", planFoot: "いつでも解約可能。Stripe による安全な決済。",
    emailPrompt: "決済を始めるにはメールアドレスを入力してください:", checkoutErr: "決済を開始できませんでした — もう一度お試しください。",
  },
  ko: {
    pricingH: "Pro로 모든 드롭을 잡으세요", perMo: "/월",
    proDesc: "여러 드롭을 동시에 자동 구매하고 우선 감시합니다.", proCta: "Pro 시작",
    resellerDesc: "리셀러용: 가장 많은 상품을 동시에 감시, 최우선, 가장 높은 한도.", resellerCta: "Reseller 시작",
    popular: "가장 인기", planFoot: "언제든 해지 가능. Stripe로 안전 결제.",
    emailPrompt: "결제를 시작하려면 이메일을 입력하세요:", checkoutErr: "결제를 시작할 수 없습니다 — 다시 시도하세요.",
  },
  zh: {
    pricingH: "升级 Pro，抢到每一次补货", perMo: "/月",
    proDesc: "同时自动抢购多个补货，优先盯货。", proCta: "升级 Pro",
    resellerDesc: "面向转卖者：同时盯住最多商品、最高优先级、最高额度。", resellerCta: "升级 Reseller",
    popular: "最受欢迎", planFoot: "随时取消。由 Stripe 安全结账。",
    emailPrompt: "输入邮箱以开始结账：", checkoutErr: "无法开始结账 — 请重试。",
  },
  "zh-Hant": {
    pricingH: "升級 Pro，搶到每一次補貨", perMo: "/月",
    proDesc: "同時自動搶購多個補貨，優先盯貨。", proCta: "升級 Pro",
    resellerDesc: "面向轉賣者：同時盯住最多商品、最高優先級、最高額度。", resellerCta: "升級 Reseller",
    popular: "最受歡迎", planFoot: "隨時取消。由 Stripe 安全結帳。",
    emailPrompt: "輸入電子郵件以開始結帳：", checkoutErr: "無法開始結帳 — 請重試。",
  },
};
