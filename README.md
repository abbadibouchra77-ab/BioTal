# Thème Shopify BioTal

Thème Shopify **Online Store 2.0** pour [BioTal.fr](https://biotal.fr), boutique française de
compléments alimentaires bien-être (routine sommeil / stress / minéraux), vendue en marque
blanche via Chance2Brand. Construit pour un lancement freemium (trafic organique/social,
3 produits + 3 bundles) avec une architecture prête à encaisser du trafic payant dès que la
publicité est activée.

## Sommaire

- [Installation et prévisualisation locale](#installation-et-prévisualisation-locale)
- [Connecter le thème à GitHub depuis Shopify](#connecter-le-thème-à-github-depuis-shopify)
- [Structure du projet](#structure-du-projet)
- [Réglages disponibles dans le customizer](#réglages-disponibles-dans-le-customizer)
- [Contenu à compléter avant mise en ligne](#contenu-à-compléter-avant-mise-en-ligne)
- [Choix techniques](#choix-techniques)
- [Limites connues](#limites-connues)
- [Tests à effectuer avant mise en ligne](#tests-à-effectuer-avant-mise-en-ligne)

## Installation et prévisualisation locale

### 1. Installer Shopify CLI

```bash
# macOS (Homebrew)
brew tap shopify/shopify
brew install shopify-cli

# Windows / autres plateformes : voir la doc officielle
# https://shopify.dev/docs/api/shopify-cli
```

Vérifier l'installation :

```bash
shopify version
```

### 2. Se connecter à la boutique

```bash
shopify auth login --store=votre-boutique.myshopify.com
```

### 3. Lancer le thème en preview locale

Depuis la racine du dépôt :

```bash
shopify theme dev --store=votre-boutique.myshopify.com
```

Cette commande synchronise le thème en temps réel sur une preview locale (rechargement à
chaque modification de fichier) sans affecter le thème publié en production.

### 4. Vérifier la qualité du code (Theme Check)

```bash
shopify theme check
```

Le thème doit passer cette commande **sans erreur bloquante** (des avertissements
`RemoteAsset` sur le chargement des polices Google Fonts sont attendus et documentés
ci-dessous).

### 5. Pousser le thème comme thème non publié (optionnel)

```bash
shopify theme push --unpublished --theme="BioTal"
```

## Connecter le thème à GitHub depuis Shopify

1. Dans l'admin Shopify : **Boutique en ligne → Thèmes**.
2. Cliquer sur **Ajouter un thème → Connecter depuis GitHub**.
3. Autoriser l'accès à votre compte/organisation GitHub si ce n'est pas déjà fait.
4. Sélectionner ce dépôt et la branche à connecter (ex. `main` ou la branche de production).
5. Shopify crée alors un thème lié à cette branche : chaque `push` sur la branche connectée
   met automatiquement à jour ce thème (déploiement continu). Utilisez une branche dédiée
   (ex. `main`) pour la production et des branches de travail pour le développement, à merger
   après revue.
6. Publiez le thème depuis l'admin une fois les contenus (produits, visuels, textes légaux)
   complétés.

## Structure du projet

```
/assets     → CSS (design system + un fichier par section) et JS vanilla (un fichier par
              composant interactif, chargé uniquement sur les pages qui en ont besoin)
/config     → settings_schema.json (charte couleurs, typographie, réglages) + settings_data.json
/layout     → theme.liquid (layout principal) et password.liquid (boutique fermée)
/locales    → fr.default.json (textes du site) et fr.default.schema.json (textes du customizer)
/sections   → toutes les sections réutilisables, en JSON templates / blocks Shopify 2.0
/snippets   → composants réutilisables (carte produit, prix, avis, accordéon, icônes SVG…)
/templates  → un template JSON par type de page (accueil, produit, collection, panier,
              page, blog, article, 404, recherche)
```

Aucun template `.liquid` monolithique : chaque page est composée de sections JSON
activables, réordonnables et configurables depuis le customizer (sauf le header, le footer et
le tiroir panier, qui sont des sections globales rendues dans `layout/theme.liquid` — c'est le
fonctionnement standard d'un thème Shopify 2.0 pour garantir leur présence sur 100 % des pages).

## Réglages disponibles dans le customizer

**Réglages du thème** (`Personnaliser le thème → Réglages du thème`) :

- **Couleurs** : les 6 couleurs de la charte BioTal (vert forêt, doré, crème, vert sauge,
  texte, blanc) + couleurs de succès/erreur — réutilisées partout via variables CSS, jamais
  codées en dur dans les fichiers Liquid.
- **Typographie** : choix de la police de titres (Fraunces / Playfair Display) et de texte
  (Inter / Work Sans), + échelles de taille.
- **Logo & favicon** : upload du logo et du favicon (décliné automatiquement en 16×16, 32×32
  et 180×180 apple-touch-icon).
- **Mise en page** : largeur du contenu, espacement entre sections, arrondi des éléments.
- **Panier** : type de panier (tiroir ou page dédiée), affichage de l'upsell bundle, produit
  déclencheur et produit bundle à suggérer, texte de livraison offerte.
- **Avis clients** : activation de l'affichage des avis (basé sur un métachamp produit,
  namespace configurable) — désactivé par défaut tant qu'aucune application n'est connectée.
- **Réseaux sociaux** : liens Instagram, TikTok, Facebook, Pinterest (affichés uniquement si
  renseignés).
- **Mentions légales** : raison sociale, SIRET, adresse, e-mail de contact (affichés en pied
  de page).

**Sections de la page d'accueil** (`templates/index.json`, chacune activable, réordonnable et
configurable) : Héros, Bandeau de réassurance, Produit vedette, Bundle vedette, Grille
produits, Comment ça marche, Avis clients, FAQ.

**Sections de la page produit** : galerie zoom, bloc achat (variantes, abonnement natif,
quantité), accordéons composition/dosage/mode d'emploi, allergènes (toujours visible),
bandeau de réassurance, cross-sell dynamique, FAQ produit.

## Contenu à compléter avant mise en ligne

Le thème est fonctionnel mais utilise volontairement des **placeholders clairement
identifiables** à remplacer avant le lancement :

- **Visuels produits** : les images utilisent le placeholder Shopify (`placeholder_svg_tag`)
  tant qu'aucun média n'est ajouté au produit. Ajouter les vraies photos une fois validées.
- **Fiches produit (Chance2Brand)** : composition, dosage et mode d'emploi sont lus depuis des
  métachamps produit (`product.metafields.custom.composition`, `.dosage`, `.usage`,
  `.allergens`) à créer dans **Admin → Paramètres → Métachamps → Produits** (type "Richtext" ou
  "Texte enrichi multiligne") et à remplir avec les données réelles fournisseur une fois
  vérifiées. Tant qu'un métachamp est vide, l'accordéon correspondant ne s'affiche pas — sauf
  le bloc allergènes, qui affiche un texte réglementaire générique par défaut (à ajuster avec
  votre référent qualité/réglementaire).
- **Textes légaux** : CGV, mentions légales, politique de confidentialité et politique de
  retour sont à rédiger dans **Admin → Boutique en ligne → Pages**, avec le template `page`
  (déjà stylé). Compléter aussi le SIRET et l'adresse réelle dans les réglages du thème.
- **Avis clients** : la section « Avis clients » accepte soit des témoignages saisis
  manuellement (blocs "Avis"), soit un bloc d'application (`@app`) une fois une app d'avis
  installée — les étoiles sur les fiches/cartes produit lisent un métachamp `reviews.rating`
  (namespace configurable) qui sera renseigné automatiquement par la plupart des applications
  d'avis du marché.
- **Abonnement récurrent** : le thème affiche la bascule achat unique / abonnement dès qu'un
  produit a un groupe de plans d'achat (Selling Plans) — à configurer via
  **Admin → Produits → Abonnements** avec l'app native Shopify Subscriptions (ou équivalent).
- **Menus** : créer les menus `main-menu` (navigation header) et `footer` (CGV, mentions
  légales, politique de retour) dans **Admin → Boutique en ligne → Menus**.
- **Bundles** : chaque bundle est un produit Shopify à part entière, avec un `compare_at_price`
  égal à la somme des prix unitaires pour afficher automatiquement l'économie réalisée.

## Choix techniques

- **Polices** : Fraunces (titres, par défaut) + Inter (texte, par défaut) via Google Fonts,
  chargées en `font-display: swap` avec préconnexion et fallback système (`media="print"` +
  `onload` pour un chargement non bloquant). Alternatives disponibles dans le customizer :
  Playfair Display / Work Sans.
- **CSS** : pas de framework — design system maison en variables CSS (`:root`, calculées à
  partir des réglages du thème dans `theme.liquid`), un fichier `base.css` pour les
  fondations/utilitaires, et un fichier CSS dédié par section chargé uniquement quand la
  section est rendue (code-splitting CSS).
- **JavaScript** : vanilla ES, Web Components natifs (`customElements`) pour les composants
  interactifs (`product-page`, `cart-drawer`, `product-quick-add`, `product-recommendations`),
  chargés en `defer` et uniquement sur les pages qui en ont besoin (code-splitting JS). Aucune
  dépendance externe.
- **Panier** : tiroir AJAX par défaut (API `/cart/add.js`, `/cart/change.js` +
  Section Rendering API pour rafraîchir le contenu), avec repli en page dédiée
  entièrement fonctionnelle sans JavaScript (`/cart`, formulaire natif).
- **Abonnement** : implémenté avec les Selling Plans natifs Shopify (aucune app tierce codée
  en dur).
- **Cross-sell** : implémenté avec l'API native de recommandations produits Shopify
  (`routes.product_recommendations_url`), chargée en différé (`IntersectionObserver`) pour ne
  pas impacter le LCP de la page produit.
- **Accessibilité** : accordéons en `<details>/<summary>` natifs (navigation clavier et lecteur
  d'écran gérés sans JS), focus visibles, libellés ARIA sur les composants interactifs, contrastes
  vérifiés sur la palette de marque, `alt` obligatoires sur toutes les images.
- **Anti-fausse urgence** : le composant de stock (`snippets/stock-indicator.liquid`) n'affiche
  un message que si le suivi d'inventaire Shopify est actif et que le stock réel est bas —
  jamais de compteur ou de stock fictif.

## Limites connues

- Les avertissements `RemoteAsset` remontés par `shopify theme check` sur les liens Google
  Fonts sont **attendus** : ils sont la conséquence directe du choix (demandé) de charger des
  polices Google Fonts plutôt que la bibliothèque de polices Shopify. Ils n'empêchent pas la
  publication du thème et n'ont pas d'impact mesurable sur les Core Web Vitals grâce au
  chargement non bloquant mis en place.
- Aucune page compte client (connexion, inscription, historique de commandes) n'est fournie :
  le tunnel d'achat repose sur le panier + checkout Shopify natif, conformément au périmètre du
  brief. Elles peuvent être ajoutées ultérieurement en suivant la même architecture de sections.
- La remise automatique du bundle dans le panier n'est pas implémentée (cela nécessite Shopify
  Functions ou Shopify Plus/Scripts, hors périmètre thème) : le thème propose à la place une
  **suggestion d'ajout du bundle** contextuelle et native, sans fausse promesse de remise
  automatique.
- Seul le français (`fr.default.json`) est activé, mais toutes les chaînes de texte du thème
  passent par le système de traduction Liquid (`| t`) : ajouter `en.default.json`,
  `de.default.json`, etc. dans `/locales` suffit à activer d'autres marchés sans toucher aux
  templates.

## Tests à effectuer avant mise en ligne

1. **Theme Check** : `shopify theme check` → doit rester à 0 erreur bloquante.
2. **Lighthouse mobile** (Chrome DevTools ou `npx lighthouse` sur l'URL de preview) : viser un
   score Performance ≥ 90, LCP < 2,5 s, CLS < 0,1, INP < 200 ms. Tester en priorité la page
   d'accueil et une page produit avec de vraies images produit compressées.
3. **Tunnel d'achat mobile** : depuis un mobile réel ou l'émulation Chrome DevTools, tester le
   parcours complet — ajout au panier depuis une carte produit, depuis la fiche produit (achat
   unique et abonnement), ouverture du tiroir panier, mise à jour de quantité, suppression,
   passage au checkout.
4. **Accessibilité clavier** : parcourir le header, le menu mobile, le panier et la FAQ
   uniquement au clavier (Tab / Entrée / Échap), et vérifier les contrastes avec un outil comme
   axe DevTools.
5. **Variantes et rupture de stock** : tester un produit multi-variantes et un produit en
   rupture pour vérifier l'état des boutons et messages.
6. **Test multi-résolutions** : 360 px (mobile), 768 px (tablette), 1440 px (desktop).
