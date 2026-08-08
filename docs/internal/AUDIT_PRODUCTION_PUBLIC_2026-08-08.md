# Audit public de production — Dega Food Express

Date de contrôle : 8 août 2026  
Site contrôlé : <https://dega-food-express.vercel.app/>  
Code local contrôlé : Next.js 16.3.0, React 19.2.8, TypeScript 5.9.3  
Périmètre : pages publiques, carte, panier, livraison/retrait, GeoAdmin, WhatsApp, traiteur, témoignages Instagram, confidentialité, API publiques, en-têtes, mobile, accessibilité, performance et qualité du déploiement.

## 1. Résumé exécutif

Aucune vulnérabilité critique, aucune injection SQL, aucune XSS exploitable et aucun secret publié n’ont été confirmés. Le serveur recalcule les articles, les quantités, les prix, la zone et les frais avant de préparer une commande WhatsApp. Les requêtes SQL sont paramétrées, les destinations externes sont fixes, les entrées JSON sont bornées et aucun script tiers n’est exécuté sur les pages contrôlées.

Le site n’est toutefois pas exempt de risques. Les cinq priorités sont :

1. le formulaire traiteur peut placer des données personnelles, y compris des allergies, dans l’URL lorsque JavaScript est absent ou pas encore chargé ;
2. le dock mobile du panier n’est pas réellement fixé à la fenêtre et peut être entièrement hors écran après l’ajout d’un article ;
3. le focus clavier doré n’atteint pas le contraste non textuel attendu sur les surfaces claires ;
4. la validation GeoAdmin rejette certaines graphies plausibles d’adresses et une panne GeoAdmin bloque toute finalisation de livraison ;
5. le dossier local et le site déployé divergent, et les tests actuels peuvent laisser passer une régression du choix Livraison/Retrait.

La production répond correctement sur les routes publiques contrôlées, renvoie une vraie 404, redirige HTTP vers HTTPS et expose de bons en-têtes de base. Le point de santé présent dans le code local n’est pas encore déployé : `/api/health` répond 404 en production.

## 2. Limites et règles respectées

- Aucune route d’administration n’a été visitée ou recherchée en production.
- Aucun identifiant n’a été essayé.
- Aucun message WhatsApp n’a été envoyé et aucun lien WhatsApp n’a été ouvert.
- Aucun témoignage, fichier ou donnée de production n’a été créé, modifié ou supprimé.
- Aucun brute force, scan de chemins, fuzzing, test de charge ou payload volumineux n’a été envoyé.
- GeoAdmin, Instagram, WhatsApp et Vercel n’ont pas été testés comme cibles de sécurité.
- Les erreurs ordinaires des deux API connues ont été vérifiées une seule fois avec un objet JSON vide, lequel ne déclenche pas d’appel GeoAdmin.
- Les scénarios risqués ou susceptibles d’écrire ont été analysés dans le code ou exécutés localement.

Ne sont pas vérifiables depuis ce contrôle : règles WAF réellement actives, sauvegardes PostgreSQL, restauration, chiffrement fournisseur, rôles réels de base, rétention des logs Vercel/Meta/GeoAdmin, alertes et MFA des comptes d’infrastructure.

## 3. Vérifications exécutées

### Production

- Routes 200 : `/`, `/carte`, `/presentation`, `/evenements`, `/avis`, `/contact`, `/conditions`, `/confidentialite`, `/robots.txt`, `/sitemap.xml`.
- Route inconnue : vraie réponse 404 avec issues de secours.
- `/api/health` : 404 sur le déploiement contrôlé.
- `POST {}` vers les deux API publiques connues : 400, JSON, `Cache-Control: no-store`, sans CORS permissif.
- HTTPS : redirection permanente 308 depuis HTTP.
- En-têtes observés : CSP, HSTS, `nosniff`, `DENY`, COOP, CORP, `Referrer-Policy` et `Permissions-Policy`.
- Playwright public non destructif : 15 tests réussis, 1 non applicable sur le projet desktop.
- Audit Axe : aucune violation critique ou sérieuse sur l’accueil, la carte et le traiteur, en desktop et mobile. Une passe élargie sur neuf pages et trois formats n’a relevé aucune violation automatique.
- Aucun débordement horizontal, aucune image cassée, aucun message console inattendu et un seul `h1` sur les pages mesurées.
- Aucun cookie, aucune clé `localStorage` et aucune clé `sessionStorage` créés pendant les parcours publics contrôlés.
- Origines réseau observées au chargement : uniquement `https://dega-food-express.vercel.app`.
- Mesures indicatives, une seule passe non assimilable à un benchmark : environ 833 Ko transférés sur l’accueil à froid, 300 Ko sur la carte, 242 Ko sur le traiteur, 29 Ko sur la page Témoignages vide et 21 Ko sur Contact.

### Projet local

- `npm test` : 23 fichiers réussis.
- `npm run lint` : réussi sans avertissement.
- `npm run typecheck` : réussi.
- `npm audit --audit-level=low` : 0 vulnérabilité connue au moment du contrôle.
- `SITE_URL=https://dega-food-express.vercel.app npm run build` : réussi ; 14 pages générées.
- Playwright local : 19 tests réussis, 1 test desktop non applicable.
- Le build sans `SITE_URL` échoue volontairement : le projet refuse une URL canonique locale en production. Ce garde-fou est sain et la CI fournit déjà une URL HTTPS.

## 4. Constats détaillés

### PROD-PRIV-001 — Fallback GET du formulaire traiteur

**Statut :** confirmé en production et dans le code  
**Criticité :** élevée  
**Page ou composant :** `/evenements`, `app/evenements/catering-form.tsx:160-173,269,620-635`

**Description :** le formulaire dépend de `preventDefault()` dans un composant client. Le `<form>` ne possède ni `method` ni `action`. Sans JavaScript ou avant l’hydratation, le navigateur utilise donc GET vers `/evenements`.

**Impact réel :** prénom, nom, téléphone, e-mail, lieu, événement, choix et détails peuvent apparaître dans l’URL, l’historique et des journaux intermédiaires. Le champ libre invite explicitement à saisir des allergies ou contraintes alimentaires.

**Conditions :** JavaScript désactivé, bundle non chargé, hydratation lente ou erreur client, puis soumission d’un formulaire complet.

**Reproduction sûre :** inspection sans JavaScript du `method` et de l’`action`; aucune donnée n’a été réellement soumise.

**Résultat observé :** `method=get`, action résolue vers `/evenements`.

**Résultat attendu :** aucune donnée personnelle dans une URL ; POST progressif ou formulaire désactivé avec contact alternatif lorsque JavaScript n’est pas disponible.

**Cause probable :** le flux WhatsApp a été conçu uniquement comme interaction React.

**Correction recommandée :** ajouter une vraie Server Action POST validée, qui prépare une redirection sûre, ou afficher un `<noscript>` de contact et rendre le formulaire non soumettable sans JavaScript.

**Exemple de correction Next.js/TypeScript :**

```tsx
<form action={prepareCateringRequest}>
  {/* champs nommés, validation serveur et aucune donnée dans la query */}
</form>
```

**Défense supplémentaire :** limiter les champs, éviter les détails médicaux non nécessaires et ne jamais journaliser le corps.

**Tests de non-régression :** soumission factice sans JavaScript ; hydratation retardée ; vérification que l’URL ne contient aucun champ.

**Logs et alertes à ajouter :** uniquement statut, durée et référence technique ; jamais le nom, le téléphone, l’e-mail, l’adresse ou les allergies.

**Effort estimé :** moyen.

### PROD-MOBILE-001 — Dock du panier hors fenêtre

**Statut :** confirmé en production  
**Criticité :** élevée  
**Page ou composant :** `/carte`, `app/globals.css:79-94`, `app/template.tsx:7-8`, `components/order/order-experience.module.css:1569-1584`

**Description :** `.orderDock` est `position: fixed`, mais son ancêtre `.page-transition` conserve un `transform: matrix(...)` à cause de l’animation avec remplissage. Cet ancêtre devient le bloc de référence du dock.

**Impact réel :** après ajout d’un plat sur mobile, le bouton principal « Voir le panier » peut être entièrement hors écran. Il ne reste pas fixé au bas de la fenêtre lors du défilement.

**Conditions :** largeur mobile et panier non vide.

**Reproduction sûre :** ajouter un plat localement dans l’interface, sans soumettre la commande, puis mesurer le dock à plusieurs positions de défilement.

**Résultat observé :** à 390×844, le dock est passé de `top=1531` à `top=689`, puis `top=-168` selon le scroll, alors qu’il devrait rester proche du bas du viewport.

**Résultat attendu :** position constante, visible immédiatement après l’ajout.

**Cause probable :** `animation: page-enter ... both` conserve un transform identité qui reste un contenant CSS.

**Correction recommandée :** ne pas conserver le transform après l’entrée ou rendre le dock hors de l’ancêtre animé, par exemple via un portail.

**Exemple de correction :**

```css
.page-transition {
  animation: page-enter var(--motion-base) var(--ease-out);
}
```

**Défense supplémentaire :** réserver la safe area et contrôler le clavier virtuel.

**Tests de non-régression :** après ajout, dock visible à 10 px du bas ; position inchangée en haut, milieu et bas ; aucun recouvrement du footer.

**Logs et alertes à ajouter :** aucun log nécessaire ; assertion géométrique Playwright.

**Effort estimé :** faible.

### PROD-A11Y-001 — Contraste du focus clavier

**Statut :** confirmé en production  
**Criticité :** élevée pour l’accessibilité  
**Page ou composant :** `app/globals.css:129`, champs de `/evenements` et `/carte`

**Description :** l’anneau `#c9a35d` atteint environ 2,36:1 sur blanc et 2,08:1 sur le fond crème, sous le contraste non textuel de 3:1 attendu pour rendre le focus perceptible.

**Impact réel :** les personnes naviguant au clavier ou ayant une basse vision peuvent perdre la position du focus.

**Conditions :** contrôle clair sur surface claire.

**Reproduction sûre :** tabulation normale et calcul du contraste des couleurs calculées.

**Résultat observé :** `outline: 3px solid rgb(201, 163, 93)` sur blanc.

**Résultat attendu :** indicateur nettement visible sur chaque surface.

**Cause probable :** un seul token doré est utilisé pour les fonds clairs et foncés.

**Correction recommandée :** utiliser un vert sombre sur fond clair et un doré clair sur fond sombre.

**Exemple de correction :**

```css
:focus-visible { outline-color: var(--focus-on-light); }
.darkSurface :focus-visible { outline-color: var(--focus-on-dark); }
@media (forced-colors: active) { :focus-visible { outline: 2px solid CanvasText; } }
```

**Défense supplémentaire :** double anneau ou `box-shadow` intérieur/extérieur.

**Tests de non-régression :** calcul automatisé sur blanc, crème et vert ; parcours clavier à zoom 200 % et couleurs forcées.

**Logs et alertes à ajouter :** non applicable.

**Effort estimé :** faible.

### PROD-RELEASE-001 — Divergence entre production et dossier local

**Statut :** confirmé  
**Criticité :** moyenne  
**Page ou composant :** production, `app/api/health/route.ts`, `components/layout/site-footer.tsx`, `config/site-config.ts`

**Description :** la production contient encore « Retour en haut », affiche l’ancien libellé « Commandes & livraison » et renvoie 404 sur `/api/health`. Ces éléments ont déjà changé dans le dossier local.

**Impact réel :** les demandes validées localement ne correspondent pas au site visible ; les contrôles de santé et le support ne peuvent pas identifier précisément la version en ligne.

**Conditions :** déploiement effectué depuis un export ancien ou sans promotion du dernier artefact.

**Reproduction sûre :** comparaison du HTML public et des sources locales, sans route privée.

**Résultat observé :** production ancienne, source locale plus récente.

**Résultat attendu :** un artefact traçable et identique au dossier publié.

**Cause probable :** synchronisation et déploiement manuels.

**Correction recommandée :** déployer exclusivement depuis le dépôt Git, après CI verte, et exposer un identifiant de version non sensible dans la santé ou les logs.

**Exemple de correction :**

```ts
return Response.json({ status: "ok", version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) });
```

**Défense supplémentaire :** smoke test post-déploiement sur `/api/health`, contenu attendu et absence de textes retirés.

**Tests de non-régression :** comparaison SHA déployé/branche ; test production après promotion.

**Logs et alertes à ajouter :** version, environnement et heure de déploiement, sans variables sensibles.

**Effort estimé :** faible à moyen.

### SOURCE-CART-001 — Régression possible du deep-link Livraison

**Statut :** confirmé dans le code local, non reproduit sur la production actuellement déployée  
**Criticité :** moyenne, blocage avant prochain déploiement  
**Page ou composant :** `app/carte/page.tsx:35-42`, `components/order/order-experience.tsx:120-137,293-297`, `tests/order-cart.test.mts:67-76`

**Description :** le code local calcule toujours `initialFulfillmentMethod ?? storedFulfillmentMethod`. Après ouverture de `/carte?mode=livraison`, la prop initiale peut donc rester prioritaire sur un choix utilisateur ultérieur. Le test actuel vérifie seulement des chaînes source et non le comportement.

**Impact réel :** un futur déploiement peut empêcher de passer de Livraison à Retrait depuis un lien partagé, alors que la production actuelle permet ce changement.

**Conditions :** URL avec `?mode=livraison` et code local déployé tel quel.

**Reproduction sûre :** test Playwright local, sans commande envoyée.

**Résultat observé :** invariant de code problématique ; le test unitaire reste vert.

**Résultat attendu :** la query initialise une fois, puis le choix de l’utilisateur devient la source de vérité.

**Cause probable :** priorité URL recalculée à chaque rendu.

**Correction recommandée :** consommer l’override une seule fois et l’effacer dès la première modification.

**Exemple de correction :**

```tsx
const [urlOverride, setUrlOverride] = useState(initialFulfillmentMethod);
const fulfillmentMethod = urlOverride ?? storedFulfillmentMethod;
function changeFulfillmentMethod(value: FulfillmentMethod) {
  setUrlOverride(null);
  setFulfillmentMethod(value);
}
```

**Défense supplémentaire :** supprimer la query après consommation ou initialiser l’état dans un reducer explicite.

**Tests de non-régression :** ouvrir la query, choisir Retrait, attendre un rerender, naviguer arrière/avant et vérifier l’état stable.

**Logs et alertes à ajouter :** aucun contenu de commande ; seulement test E2E obligatoire.

**Effort estimé :** faible.

### PROD-NAV-001 — Menu mobile et touche Échap

**Statut :** confirmé en production  
**Criticité :** moyenne  
**Page ou composant :** `components/layout/site-header.tsx:47-88`

**Description :** Échap ferme le menu lorsque le focus reste dans le header. Après Tab depuis le dernier lien vers le contenu, le focus sort du header et Échap ne ferme plus le menu superposé.

**Impact réel :** navigation clavier confuse et couche ouverte pendant la lecture du contenu.

**Conditions :** menu mobile ouvert, puis sortie du header au clavier.

**Reproduction sûre :** ouverture, Tab jusqu’au lien suivant, puis Échap.

**Résultat observé :** `aria-expanded` reste `true`.

**Résultat attendu :** fermeture et retour du focus au déclencheur.

**Cause probable :** gestionnaire clavier attaché au seul élément `<header>`.

**Correction recommandée :** écouter `keydown` sur `document` uniquement pendant l’ouverture et fermer lors de la sortie du disclosure.

**Exemple de correction :**

```tsx
useEffect(() => {
  if (!open) return;
  const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && closeMenu();
  document.addEventListener("keydown", onKeyDown);
  return () => document.removeEventListener("keydown", onKeyDown);
}, [open]);
```

**Défense supplémentaire :** conserver la restitution du focus ; ne pas transformer ce menu non modal en piège de focus.

**Tests de non-régression :** Échap depuis le header et depuis le contenu ; Tab après le dernier lien.

**Logs et alertes à ajouter :** non applicable.

**Effort estimé :** faible.

### PROD-RESP-002 — Hero peu utile en paysage mobile

**Statut :** confirmé en production  
**Criticité :** moyenne  
**Page ou composant :** accueil, `components/home/home-hero.module.css:1`

**Description :** à 844×390, le titre commence vers 376 px et se termine vers 501 px. Presque aucun texte et aucun CTA principal ne sont visibles dans le premier écran.

**Impact réel :** l’utilisateur en paysage voit surtout le fond et ne comprend pas immédiatement la proposition.

**Conditions :** téléphone en paysage ou fenêtre de faible hauteur.

**Reproduction sûre :** viewport 844×390.

**Résultat observé :** environ 14 px du titre dans le premier écran.

**Résultat attendu :** titre et action principale visibles sans défilement initial excessif.

**Cause probable :** `min-height: 680px` sans adaptation à la hauteur.

**Correction recommandée :** media query combinant paysage et faible hauteur.

**Exemple de correction :**

```css
@media (orientation: landscape) and (max-height: 500px) {
  .hero { min-height: 32rem; }
  .heroInner { padding-block: 5rem 2rem; }
}
```

**Défense supplémentaire :** vérifier le header sticky et les safe areas.

**Tests de non-régression :** captures 844×390 et 667×375 ; portrait inchangé.

**Logs et alertes à ajouter :** non applicable.

**Effort estimé :** faible.

### PROD-NOJS-002 — Navigation et carte fortement dépendantes de JavaScript

**Statut :** confirmé en production  
**Criticité :** moyenne  
**Page ou composant :** `components/layout/site-header.tsx:137-164`, `components/order/order-experience.tsx:124,655-687`

**Description :** sans JavaScript, le bouton du menu mobile est inactif tandis que la navigation est `inert`. Sur la carte, les catégories sont des boutons sans URL et seule la catégorie initiale est rendue ; les ajouts ne fonctionnent pas.

**Impact réel :** un bundle bloqué ou très lent rend la navigation principale et la commande inutilisables. Le footer reste un secours partiel.

**Conditions :** JavaScript indisponible ou échec d’hydratation.

**Reproduction sûre :** contexte navigateur avec JavaScript désactivé.

**Résultat observé :** menu fermé impossible à ouvrir ; Entrées, Desserts et Boissons inaccessibles.

**Résultat attendu :** navigation et moyen de contact minimal toujours utilisables.

**Cause probable :** composants conçus comme application cliente sans fallback progressif.

**Correction recommandée :** navigation visible par défaut puis améliorée par JS ; liens de catégories avec query serveur ; `<noscript>` de commande par téléphone/WhatsApp.

**Exemple de correction :**

```tsx
<Link href="/carte?categorie=entrees">Entrées</Link>
<noscript><a href="tel:+41766036011">Commander par téléphone</a></noscript>
```

**Défense supplémentaire :** smoke E2E avec JavaScript désactivé.

**Tests de non-régression :** tous les liens de navigation et catégories accessibles sans JS.

**Logs et alertes à ajouter :** taux d’erreurs de bundles si une solution RUM respectueuse de la vie privée est adoptée.

**Effort estimé :** moyen.

### CART-STATE-001 — Panier perdu au rechargement et état incohérent entre onglets

**Statut :** confirmé dans le code  
**Criticité :** moyenne  
**Page ou composant :** `components/order/order-session-provider.tsx:30-53`, `components/order/order-experience.tsx:138-145`

**Description :** panier, remise et paiement résident uniquement dans un contexte React. Ils survivent à certaines navigations internes tant que le layout reste monté, mais pas au rechargement ni dans un autre onglet. L’adresse est encore plus locale au composant.

**Impact réel :** perte d’une commande en cours après actualisation, reprise du navigateur ou ouverture parallèle.

**Conditions :** reload, nouvel onglet ou remontage complet.

**Reproduction sûre :** ajouter un article puis recharger, sans soumettre.

**Résultat observé :** état mémoire réinitialisé.

**Résultat attendu :** choix produit explicite : soit persistance temporaire annoncée, soit avertissement avant perte.

**Cause probable :** absence de modèle de brouillon.

**Correction recommandée :** persister uniquement le panier non sensible dans `sessionStorage`, avec version de schéma et validation stricte. Ne pas persister l’adresse/allergies sans nécessité et information.

**Exemple de correction :**

```ts
const parsed = CartSchema.safeParse(JSON.parse(sessionStorage.getItem("dega-cart-v1") ?? "null"));
```

**Défense supplémentaire :** borner quantités/IDs après lecture et effacer le brouillon après transmission.

**Tests de non-régression :** reload, retour, deux onglets, stockage corrompu et version ancienne.

**Logs et alertes à ajouter :** aucun contenu de panier ; éventuellement compteur agrégé de restauration.

**Effort estimé :** moyen.

### GEO-001 — Adresse plausible rejetée selon sa graphie

**Statut :** confirmé localement par fonction pure  
**Criticité :** moyenne  
**Page ou composant :** `lib/address-suggestions.ts:211-242`, `lib/validate-delivery-zone.ts:65-79`, `app/carte/order-actions.ts:196-218`

**Description :** la correspondance exige l’égalité normalisée de la rue, du NPA et de la ville. Des formes plausibles comme une abréviation ou `10A`/`10 A` peuvent ne pas correspondre au libellé GeoAdmin.

**Impact réel :** livraison refusée malgré une adresse réelle, notamment après le conseil « Continuez la saisie manuellement ».

**Conditions :** saisie manuelle avec graphie différente du premier résultat GeoAdmin.

**Reproduction sûre :** test pur avec fixture locale ; aucun appel externe.

**Résultat observé :** forme exacte acceptée, plusieurs variantes plausibles rejetées.

**Résultat attendu :** adresse certaine acceptée ; variante plausible envoyée en revue manuelle, jamais validée automatiquement par un fuzzy match faible.

**Cause probable :** égalité textuelle utilisée comme preuve d’identité.

**Correction recommandée :** conserver l’identifiant de la suggestion sélectionnée et le revérifier côté serveur, ou classer les variantes plausibles en `on_request`.

**Exemple de correction :**

```ts
if (!exactMatch && samePostalLocality && plausibleHouseNumber) {
  return { status: "on_request" };
}
```

**Défense supplémentaire :** ne jamais journaliser l’adresse ; conserver le refus pour une ville/NPA/numéro réellement différents.

**Tests de non-régression :** accents, apostrophes, abréviations, espace dans suffixe, NPA faux, ville fausse, numéro faux.

**Logs et alertes à ajouter :** compteurs agrégés `exact`, `manual_review`, `not_found`, `service_error` et latence.

**Effort estimé :** moyen.

### GEO-002 — GeoAdmin bloque toute livraison lors d’une panne

**Statut :** confirmé dans le code, conditionnel à une panne amont  
**Criticité :** moyenne  
**Page ou composant :** `lib/validate-delivery-zone.ts:42-90`, `components/order/order-experience.tsx:227-285`, `app/carte/order-actions.ts:212-218`

**Description :** timeout, 429, 5xx ou JSON inexploitable produit `service_error`. L’interface propose de réessayer et l’action serveur refuse la redirection WhatsApp.

**Impact réel :** plus aucune demande de livraison ne peut être transmise pendant l’incident, même avec mention « frais à confirmer ».

**Conditions :** panne ou forte latence GeoAdmin.

**Reproduction sûre :** interception locale du réseau ; aucun test contre GeoAdmin.

**Résultat observé :** blocage après un timeout maximal de 4,5/5 secondes.

**Résultat attendu :** comportement métier explicite : soit demande manuelle prudente, soit contact direct clairement accessible.

**Cause probable :** service externe utilisé comme autorité unique.

**Correction recommandée :** si le métier l’accepte, convertir l’échec en demande `on_request` sans tarif promis ; sinon afficher le contact direct et un circuit breaker.

**Exemple de correction :**

```ts
return { status: "on_request", reason: "verification_unavailable" };
```

**Défense supplémentaire :** cache court minimisé, circuit breaker, un retry borné avec jitter au maximum.

**Tests de non-régression :** fixtures 200, 400, 429, 503, timeout, reprise ; aucun tarif standard lors du fallback.

**Logs et alertes à ajouter :** succès, timeout, statut amont et p95, jamais l’adresse.

**Effort estimé :** moyen.

### WA-001 — URL de devis WhatsApp excessivement longue

**Statut :** confirmé localement sans navigation externe  
**Criticité :** moyenne  
**Page ou composant :** `app/evenements/catering-form.tsx:503-522,625-630`, `config/site-config.ts:162-163`, `lib/catering-whatsapp.ts:25-48`

**Description :** les détails acceptent 5 000 caractères et le nombre de convives n’a pas de borne supérieure/longueur. Tout le message est encodé dans la query `text` de `wa.me`.

**Impact réel :** URL refusée ou tronquée par navigateur, OS ou WhatsApp ; perte silencieuse de détails, potentiellement les allergies.

**Conditions :** texte long, accents ou emoji, nombreux choix.

**Reproduction sûre :** génération locale seulement. Une demande synthétique avec 5 000 `é` a produit environ 30 723 caractères d’URL.

**Résultat observé :** aucune limite finale sur l’URL encodée.

**Résultat attendu :** message borné et fallback fiable avant toute navigation.

**Cause probable :** limite de caractères définie avant encodage, sans budget URL.

**Correction recommandée :** réduire les bornes métier, limiter les convives, calculer la longueur encodée et proposer « Copier le message » si nécessaire. Ne jamais tronquer silencieusement.

**Exemple de correction :**

```ts
if (new TextEncoder().encode(whatsappUrl).byteLength > MAX_WHATSAPP_URL_BYTES) {
  return { status: "too_long", message };
}
```

**Défense supplémentaire :** rendre les allergies structurées et courtes.

**Tests de non-régression :** N−1/N/N+1, accents, emoji, convives très long, navigation mockée.

**Logs et alertes à ajouter :** seulement `prepared`, `too_long`, `copy_fallback`, sans message ni PII.

**Effort estimé :** faible à moyen.

### WA-002 — Absence de confirmation/fallback d’ouverture WhatsApp

**Statut :** probable, limite de plateforme  
**Criticité :** faible  
**Page ou composant :** `app/evenements/catering-form.tsx:258-260`, `app/carte/order-actions.ts:298-309`

**Description :** le site navigue vers `wa.me` mais ne peut pas savoir si l’application ou la page finale s’ouvre correctement. Le formulaire traiteur ne propose pas simultanément de copier le message.

**Impact réel :** sur un appareil bloquant la navigation, hors ligne ou sans application compatible, la saisie peut sembler perdue.

**Conditions :** échec de navigation externe ou retour imprévu.

**Reproduction sûre :** interception locale de la destination.

**Résultat observé :** pas de fallback dédié.

**Résultat attendu :** message conservé, bouton Copier et numéro de contact visible.

**Cause probable :** redirection traitée comme succès final.

**Correction recommandée :** afficher un écran intermédiaire avec « Ouvrir WhatsApp », « Copier » et « Appeler ».

**Exemple de correction :**

```tsx
<button onClick={() => navigator.clipboard.writeText(message)}>Copier le message</button>
```

**Défense supplémentaire :** ne pas stocker le message de façon durable.

**Tests de non-régression :** navigation bloquée, offline, retour arrière, presse-papiers refusé.

**Logs et alertes à ajouter :** événements agrégés sans contenu.

**Effort estimé :** moyen.

### SEC-ABUSE-001 — Rate limiting distribué non démontré

**Statut :** à vérifier dans Vercel ; aucun limiteur applicatif trouvé  
**Criticité :** moyenne  
**Page ou composant :** `app/api/address-suggestions/route.ts:56-247`, `app/api/delivery-zone/route.ts:35-81`, `app/carte/order-actions.ts:62-310`, `app/api/review-avatars/[id]/route.ts:18-78`

**Description :** les surfaces publiques peuvent déclencher des appels GeoAdmin, des lectures DB ou une écriture statistique. Le dépôt documente des règles WAF à créer, mais ne prouve pas qu’elles sont actives.

**Impact réel :** hausse de coût, saturation d’une dépendance, inflation des statistiques et dégradation du service.

**Conditions :** appels automatisés ou distribués.

**Reproduction sûre :** inspection du code et de la documentation seulement ; aucun test de volume.

**Résultat observé :** bornes de taille et timeouts présents, limite distribuée non visible.

**Résultat attendu :** quotas par route/méthode, avec burst raisonnable et réponse 429.

**Cause probable :** protection laissée à la configuration fournisseur.

**Correction recommandée :** vérifier et exporter la configuration WAF couvrant `/carte`, GeoAdmin, avatars et les routes privées.

**Exemple de correction Next.js/TypeScript :** ne pas utiliser une Map mémoire en serverless ; appeler un limiteur distribué avant le fetch/SQL et refuser en 429.

**Défense supplémentaire :** déduplication des handoffs, cache contrôlé et circuit breaker.

**Tests de non-régression :** test contrôlé en preview, jamais une charge sur la production.

**Logs et alertes à ajouter :** 429, route, fenêtre et seuil ; aucune IP brute conservée plus longtemps que nécessaire.

**Effort estimé :** moyen, plateforme.

### PRIV-002 — Politique de confidentialité incomplète pour le traiteur

**Statut :** confirmé  
**Criticité :** moyenne  
**Page ou composant :** `app/confidentialite/page.tsx:24-74`, `app/evenements/catering-form.tsx:163-179,620-635`

**Description :** la politique décrit commande, statistiques, GeoAdmin, WhatsApp et Instagram, mais pas explicitement les catégories collectées pour le devis traiteur ni le contenu potentiellement sensible des allergies.

**Impact réel :** transparence insuffisante sur les données envoyées à Meta/WhatsApp et leur finalité.

**Conditions :** envoi d’une demande traiteur.

**Reproduction sûre :** comparaison des champs et de la politique.

**Résultat observé :** catégories traiteur non détaillées.

**Résultat attendu :** catégories, finalité, destinataire, stockage premier-parti et droits expliqués simplement.

**Cause probable :** politique écrite avant le formulaire complet.

**Correction recommandée :** ajouter un paragraphe spécifique ; vérifier le texte avec la personne responsable de la conformité.

**Exemple de correction :** contenu éditorial, sans changement technique obligatoire.

**Défense supplémentaire :** minimiser le champ libre et rappeler de ne fournir que les informations utiles à la sécurité alimentaire.

**Tests de non-régression :** test source garantissant la présence des catégories et du destinataire.

**Logs et alertes à ajouter :** non applicable.

**Effort estimé :** faible.

### DATA-001 — Rétention non garantie par une tâche planifiée

**Statut :** confirmé dans le code ; éventuelle purge fournisseur à vérifier  
**Criticité :** faible  
**Page ou composant :** `lib/order-statistics.ts:90-125`, `lib/customer-reviews.ts:553-589`, `app/confidentialite/page.tsx:65-74`

**Description :** les agrégats de plus de 730 jours sont supprimés uniquement lors d’un nouveau passage WhatsApp. Un témoignage supprimé est seulement marqué `deleted_at`; aucune purge définitive n’est présente.

**Impact réel :** dépassement de la durée annoncée en période inactive et conservation indéfinie possible des noms/photos supprimés.

**Conditions :** aucune nouvelle commande ou absence de maintenance externe.

**Reproduction sûre :** lecture du SQL ; aucun accès DB production.

**Résultat observé :** purge opportuniste et soft delete.

**Résultat attendu :** calendrier documenté et exécution prouvée.

**Cause probable :** absence de tâche planifiée.

**Correction recommandée :** job idempotent, traitement par lots, rétention des sauvegardes alignée.

**Exemple de correction :** tâche cron protégée appelant une fonction SQL dédiée plutôt qu’un DELETE dans l’écriture métier.

**Défense supplémentaire :** index date, verrou de job et rapport de purge.

**Tests de non-régression :** horloge avancée sans nouveau handoff ; purge concurrente ; restauration de sauvegarde.

**Logs et alertes à ajouter :** date la plus ancienne, lignes purgées, durée et échec.

**Effort estimé :** moyen.

### REVIEWS-001 — Avatars publics coûteux et identifiants prévisibles

**Statut :** confirmé dans le code ; page vide pendant le contrôle production  
**Criticité :** moyenne sous charge  
**Page ou composant :** `db/schema.sql:45-46`, `lib/customer-reviews.ts:151-176`, `app/api/review-avatars/[id]/route.ts:18-78`

**Description :** l’URL expose un ID séquentiel et chaque avatar provoque un SELECT PostgreSQL avec `private, no-store`, malgré une query de version.

**Impact réel :** N+1 requêtes par page, énumération du volume approximatif et charge DB répétée.

**Conditions :** témoignages avec avatars publiés et trafic répété.

**Reproduction sûre :** inspection source ; aucun ID n’a été balayé.

**Résultat observé :** une requête DB par image, aucun cache public.

**Résultat attendu :** identifiant public opaque, cache contrôlé et séparation stricte public/admin.

**Cause probable :** blob DB utilisé directement comme serveur d’images.

**Correction recommandée :** stockage objet ou vignette publique versionnée ; stratégie de révocation explicite lorsqu’un avis est masqué.

**Exemple de correction :**

```ts
headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" }
```

Cette valeur n’est acceptable qu’avec une politique claire sur le délai de masquage.

**Défense supplémentaire :** rate limit des misses et 404, taille 96/192 px, ID aléatoire.

**Tests de non-régression :** cache HIT au second chargement ; avatar masqué inaccessible dans le délai contractuel.

**Logs et alertes à ajouter :** latence, HIT/MISS, 404 agrégés et requêtes DB par page.

**Effort estimé :** moyen.

### CACHE-001 — Dégradation DB pouvant être mise en cache

**Statut :** confirmé dans le code ; non déclenché en production  
**Criticité :** faible à moyenne  
**Page ou composant :** `lib/customer-reviews.ts:219-268`, `app/page.tsx`, `app/avis/page.tsx`

**Description :** une erreur DB devient un résultat `{status: "error"}` puis peut être mise en cache 60 secondes. La production contrôlée renvoyait en outre `private, no-store` sur l’accueil et Témoignages, contrairement à l’intention ISR du build local.

**Impact réel :** une panne transitoire remplace le dernier contenu sain par un état indisponible, et une configuration de cache divergente augmente latence/coût.

**Conditions :** erreur pendant revalidation ou déploiement ancien.

**Reproduction sûre :** analyse source et en-têtes ; aucune DB production coupée.

**Résultat observé :** erreurs transformées en valeur cacheable ; cache runtime divergent.

**Résultat attendu :** conserver le dernier résultat sain lors d’un rafraîchissement raté.

**Cause probable :** fallback implémenté à l’intérieur de la fonction cacheable.

**Correction recommandée :** ne mettre en cache que `ready`, ou laisser la revalidation échouer et servir le stale valide.

**Exemple de correction :**

```ts
const result = await getPublishedCustomerReviews(limit);
if (result.status === "error") throw new Error("reviews_refresh_failed");
return result;
```

**Défense supplémentaire :** circuit breaker DB et état vide seulement au premier démarrage.

**Tests de non-régression :** résultat sain, DB en panne au refresh, ancien HTML toujours servi, reprise.

**Logs et alertes à ajouter :** âge du dernier résultat sain, erreurs de refresh et stale servi.

**Effort estimé :** moyen.

### QA-001 — CI et tests comportementaux incomplets

**Statut :** confirmé  
**Criticité :** moyenne  
**Page ou composant :** `.github/workflows/ci.yml:58-73`, `playwright.config.ts:27-39`, `tests/order-cart.test.mts:67-76`

**Description :** Playwright utilise `next dev`, force `DATABASE_URL` vide et s’exécute avant le build. Quatorze fichiers de tests lisent surtout les sources. Les parcours DB, ISR, avatars et Server Actions en mode production ne sont pas testés.

**Impact réel :** une CI verte peut accompagner un comportement cassé, comme le risque du deep-link Livraison.

**Conditions :** régression comportementale non exprimée par une chaîne source.

**Reproduction sûre :** comparaison test/code ; suite locale exécutée sans mutation production.

**Résultat observé :** 23/23 fichiers verts malgré l’invariant local problématique.

**Résultat attendu :** E2E contre `next start` et PostgreSQL jetable, dépendances externes mockées.

**Cause probable :** tests ajoutés progressivement comme garde-fous statiques.

**Correction recommandée :** build avant E2E, fixture DB, tests fonctionnels des parcours et artefacts conservés.

**Exemple de correction CI :**

```yaml
- run: npm run build
  env:
    SITE_URL: https://ci.dega-food.invalid
- run: npm run start &
- run: npm run test:e2e
```

Un script de démarrage/attente robuste doit remplacer le `&` dans la version finale.

**Défense supplémentaire :** Firefox/WebKit, paysage, no-JS, offline, DB down/recovery et budgets.

**Tests de non-régression :** deep-link, GeoAdmin 200/429/503/timeout, devis long, témoignages/avatars, cache et reprise DB.

**Logs et alertes à ajouter :** rapport HTML, traces/captures/vidéos en échec, durée et flakiness.

**Effort estimé :** moyen à élevé.

### STATS-001 — Handoff rejouable et petites cellules stockées

**Statut :** confirmé dans le code  
**Criticité :** faible  
**Page ou composant :** `app/carte/order-actions.ts:298-307`, `lib/order-statistics.ts:90-125`, `lib/order-statistics-model.ts:1-11`

**Description :** chaque soumission valide incrémente l’agrégat sans clé d’idempotence. Le seuil de cinq est appliqué à l’affichage, pas au stockage journalier NPA/localité.

**Impact réel :** double POST ou réponse incertaine gonfle les chiffres ; une cellule rare indique qu’au moins une demande a existé dans une localité un jour donné.

**Conditions :** resoumission ou accès DB.

**Reproduction sûre :** lecture du code ; aucune écriture production.

**Résultat observé :** `ON CONFLICT ... handoff_count + 1` sans identifiant d’opération.

**Résultat attendu :** déduplication bornée et granularité explicitement acceptée.

**Cause probable :** statistique conçue comme compteur simple.

**Correction recommandée :** UUID de tentative non dérivé de l’adresse, contrainte unique courte, puis agrégation ; évaluer une granularité hebdomadaire.

**Exemple de correction :** table de handoffs dédupliqués à rétention courte ou fonction SQL acceptant une clé unique.

**Défense supplémentaire :** seuil d’affichage actuel conservé et aucun identifiant client.

**Tests de non-régression :** même clé deux fois = 1 ; deux clés = 2 ; reprise après réponse perdue.

**Logs et alertes à ajouter :** doublons agrégés, sans adresse/IP brute.

**Effort estimé :** moyen.

### SEC-CSP-001 — `unsafe-inline` dans la CSP publique

**Statut :** confirmé dans le code et les en-têtes production  
**Criticité :** faible, défense en profondeur  
**Page ou composant :** `lib/content-security-policy.ts:13-18`, `next.config.ts:4-10`

**Description :** `script-src` public contient `'unsafe-inline'`. L’administration locale utilise une politique nonce plus stricte.

**Impact réel :** une future injection de script inline serait moins bien contenue. Aucune XSS exploitable n’a été trouvée aujourd’hui.

**Conditions :** présence préalable d’une injection HTML/script.

**Reproduction sûre :** inspection de l’en-tête.

**Résultat observé :** CSP globale stricte sur les autres directives, mais script inline autorisé.

**Résultat attendu :** nonce/hash ou justification documentée.

**Cause probable :** bootstrap inline des pages statiques Next.js.

**Correction recommandée :** évaluer un nonce global ou Trusted Types dans une évolution séparée, sans casser ISR/statique.

**Exemple de correction :** suivre le guide CSP officiel Next.js et transmettre un nonce aux scripts nécessaires.

**Défense supplémentaire :** conserver `script-src-attr 'none'`, absence de scripts tiers, JSX échappé et aucun sink HTML.

**Tests de non-régression :** CSP report-only, puis enforcement ; navigation/hydratation complète.

**Logs et alertes à ajouter :** endpoint de rapports CSP sans données sensibles, avec rétention courte.

**Effort estimé :** moyen.

### SEO-001 — Métadonnées de la 404 héritées de l’accueil

**Statut :** confirmé en production  
**Criticité :** faible  
**Page ou composant :** `app/not-found.tsx`

**Description :** la 404 répond correctement et porte `noindex`, mais conserve le titre et le canonical de l’accueil.

**Impact réel :** onglet/historique trompeurs et diagnostic SEO moins clair ; impact d’indexation limité par `noindex`.

**Conditions :** URL inexistante.

**Reproduction sûre :** une route fictive unique.

**Résultat observé :** titre accueil et canonical `/`.

**Résultat attendu :** titre « Page introuvable » et aucun canonical vers l’accueil.

**Cause probable :** métadonnées racine héritées.

**Correction recommandée :** définir des métadonnées spécifiques compatibles avec le mécanisme 404 de Next.js.

**Exemple de correction :** `metadata` dédiée ou layout de segment selon la stratégie App Router retenue.

**Défense supplémentaire :** conserver `noindex`.

**Tests de non-régression :** statut 404, titre dédié, noindex, canonical absent.

**Logs et alertes à ajouter :** volume agrégé de 404 par chemin normalisé, sans query.

**Effort estimé :** faible.

## 5. Contrôles positifs

- Pas de compte public, session client, cookie d’authentification ou token Web Storage.
- Pas de `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, script tiers ou service worker détecté.
- Pas de secret réel dans les fichiers accessibles ; `.env*` est ignoré sauf exemple volontairement invalide.
- `next/font/google` auto-hébergé, sans requête Google Fonts au runtime.
- CSP avec `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`; clickjacking aussi bloqué par `X-Frame-Options: DENY`.
- HTTPS forcé et HSTS présent.
- API JSON : content type strict, objet racine, flux plafonné à 8 Kio, réponses `no-store` et références techniques.
- GeoAdmin : hôte HTTPS fixe, pas de SSRF, timeout 4,5/5 s, pas de journalisation de l’adresse.
- Commande : validation serveur de la zone, remise, paiement, adresse, articles, IDs uniques, quantités entières 1–20 et prix issus de la carte serveur.
- Panier UI : bornes 0–20, suppression du dernier article, dialogue natif, Échap et restitution du focus.
- SQL paramétré ; aucune concaténation d’entrée dans les requêtes.
- Logs en allowlist : référence, route, opération, statut, durée, type/code d’erreur ; pas de body, cookie, `Authorization`, message ou pile.
- Upload avatar : taille, signature, type, pixels, rotation, redimensionnement et réencodage WebP.
- Témoignages publics : seulement `approved`, visibles, Instagram et non supprimés ; aucun dépôt public.
- Liens externes : destinations fixes et `noopener noreferrer`.
- Accents français correctement rendus ; une seule langue déclarée `fr`.
- Les numéros et zones observés ne contiennent plus Genève, Lucerne ou un numéro finissant par 69.

## 6. Problèmes propres au panier

1. Dock mobile hors viewport à cause du transform de page.
2. État perdu au rechargement/nouvel onglet.
3. Risque de régression locale du deep-link `?mode=livraison`.
4. Catégories et ajout inopérants sans JavaScript.
5. Les quantités négatives, décimales, supérieures à 20, IDs inconnus et doublons sont correctement refusés côté serveur.
6. Le serveur recalcule les prix ; une modification du formulaire client ne permet pas d’imposer un prix.

## 7. Problèmes propres à WhatsApp

1. URL traiteur potentiellement supérieure à 30 000 caractères.
2. Données personnelles placées dans la query `text` du lien `wa.me`.
3. Pas de fallback Copier/Appeler si l’ouverture échoue.
4. Statistique de passage rejouable, même si elle n’enregistre ni panier, téléphone, rue ou identité.
5. Aucune requête ni message WhatsApp réel n’a été envoyé pendant l’audit.

## 8. Problèmes propres à GeoAdmin

1. Égalité textuelle trop stricte pour certaines graphies d’adresse.
2. Panne amont bloquante pour toute livraison.
3. Absence de rate limit distribué prouvé.
4. L’adresse complète est transmise par le serveur à GeoAdmin pour validation, sans être stockée dans la DB applicative.
5. Les protections positives sont : destination fixe, HTTPS, longueur bornée, timeout et absence de logs d’adresse.

## 9. Données personnelles réellement traitées

### Commande

- panier, quantités, mode livraison/retrait ;
- choix de paiement espèces/TWINT à la livraison ;
- rue, numéro, NPA, localité et complément pour une livraison ;
- message complet placé dans l’URL WhatsApp.

La base applicative ne conserve pas la rue, le panier, le téléphone ou l’identité. Elle conserve date, zone technique, mode, NPA, localité normalisée et compteur.

### Traiteur

- prénom, nom, téléphone, e-mail facultatif ;
- type/date/lieu d’événement, nombre de convives ;
- plats, services et détails libres ;
- allergies ou contraintes alimentaires éventuellement saisies.

Ces données sont préparées dans le navigateur et envoyées à WhatsApp/Meta lorsque l’utilisateur continue. Le site ne les stocke pas côté serveur dans l’implémentation contrôlée.

### Témoignages Instagram

- nom affiché, note éventuelle, commentaire, date, source ;
- photo/avatar éventuel ;
- visibilité, mise en avant, ordre, statut et dates techniques en base.

### Logs publics

- référence/UUID technique, route, opération, statut, durée et type/code d’erreur ;
- aucune PII ou adresse prévue dans l’allowlist du code.

## 10. Incohérences avec la confidentialité

1. Le formulaire traiteur et les allergies ne sont pas détaillés précisément.
2. La promesse de suppression des statistiques après 730 jours dépend actuellement d’un nouveau handoff.
3. La suppression définitive des témoignages n’est pas automatisée.
4. La politique exige une autorisation Instagram, mais le schéma ne conserve pas de preuve/date/référence de consentement. Une procédure externe peut exister et doit être vérifiée.
5. La rétention et les règles propres à Meta/WhatsApp et GeoAdmin restent celles de ces fournisseurs.

## 11. Principaux risques d’abus

- répétition d’appels GeoAdmin et des validations publiques ;
- répétition de lectures avatars et énumération d’IDs ;
- inflation des agrégats de passage WhatsApp ;
- essais répétés contre l’authentification Basic privée si le WAF n’est pas actif ;
- coûts et latence DB/fonctions.

Les limites de payload, timeouts, validations serveur et absence de CORS permissif réduisent le risque, mais ne remplacent pas un rate limit distribué.

## 12. Fiabilité mobile

- priorité : rendre le dock du panier réellement fixe ;
- adapter le hero aux écrans paysage courts ;
- fermer le menu mobile après sortie clavier ;
- conserver un moyen de navigation/commande lorsque JavaScript échoue ;
- tester clavier virtuel, arrière-plan/reprise, offline/retour réseau et changements d’orientation ;
- conserver des cibles tactiles d’au moins 44 px, déjà respectées sur les contrôles principaux mesurés.

## 13. Corrections avant prochaine mise en production

1. Corriger le dock mobile.
2. Empêcher tout fallback GET du formulaire traiteur.
3. Ajouter le test E2E du deep-link Livraison avant de déployer le code local.
4. Corriger les tokens de focus sur fond clair.
5. Borner le message/URL traiteur et prévoir Copier.
6. Décider le fallback métier GeoAdmin et accepter les variantes plausibles en revue manuelle.
7. Compléter la politique de confidentialité.
8. Vérifier les règles WAF et le smoke `/api/health`.

## 14. Plan d’action

### Sous 24 heures

- bloquer la promotion tant que le deep-link et le dock mobile n’ont pas un test navigateur ;
- ajouter `method/action` sûrs ou un fallback `<noscript>` au traiteur ;
- réduire la longueur des détails et borner les convives ;
- compléter la confidentialité ;
- vérifier WAF, variables Vercel et correspondance du SHA déployé.

### Sous 7 jours

- corriger focus, menu Échap et hero paysage ;
- définir le fallback GeoAdmin/WhatsApp ;
- exécuter les E2E contre `next start` avec DB jetable ;
- ajouter logs/alertes GeoAdmin, santé et déploiement ;
- rendre le cache témoignages résilient et définir la stratégie avatars.

### Sous 30 jours

- mettre en place rate limits distribués et idempotence handoff ;
- purge planifiée et preuve de consentement Instagram ;
- tests Firefox/WebKit, zoom, no-JS, offline, paysage et reprise ;
- budgets JS/images et Web Vitals respectueux de la vie privée ;
- smoke post-déploiement et artefacts Playwright conservés.

### Sous 90 jours

- tester restauration/PITR et fixer RPO/RTO ;
- envisager auth administrateur nominative avec MFA ;
- sortir les avatars du chemin SQL direct ;
- durcir la CSP publique avec nonces/hashes après essai report-only ;
- mettre en place une revue trimestrielle sécurité, dépendances, données et accessibilité.

## 15. Checklist complète de retest

### Déploiement et en-têtes

- [ ] SHA production identique au commit validé.
- [ ] `/api/health` répond 200 JSON, `no-store`, avec version non sensible.
- [ ] HTTP redirige vers HTTPS ; HSTS, CSP, `nosniff`, frame protection présents.
- [ ] Aucun secret ou source map sensible publiquement accessible.
- [ ] 404 avec titre dédié, `noindex` et sans canonical accueil.

### Carte et panier

- [ ] ajout, retrait, quantité zéro et suppression du dernier produit ;
- [ ] plafond 20 dans UI et serveur ; négatif/décimal/très élevé refusés ;
- [ ] double clic sans ligne dupliquée ni total faux ;
- [ ] panier vide et focus après suppression ;
- [ ] dialogue, Échap et restitution du focus ;
- [ ] dock visible et fixe à tous les scrolls, sans recouvrir le footer ;
- [ ] Livraison → Retrait depuis `/carte?mode=livraison` ;
- [ ] reload, Retour/Avance, onglets et stockage corrompu ;
- [ ] catégories utilisables sans JavaScript ou contact alternatif clair.

### Adresse et GeoAdmin

- [ ] accents, apostrophes, abréviations et suffixes de numéro ;
- [ ] NPA, ville et numéro réellement différents refusés ;
- [ ] sélection suggestion et saisie manuelle ;
- [ ] réponses vide/malformée, 400, 429, 503 et timeout simulés localement ;
- [ ] retour réseau et retry borné ;
- [ ] fallback sans tarif ou éligibilité inventés ;
- [ ] aucun log d’adresse.

### WhatsApp et traiteur

- [ ] aucun GET ni PII dans l’URL du site sans JavaScript ;
- [ ] champs obligatoires, e-mail/téléphone/date/convives ;
- [ ] plats et services séparément invalides ;
- [ ] lien du résumé focalise le bon contrôle ;
- [ ] limites ASCII, accents et emoji ;
- [ ] URL trop longue bloquée avec Copier ;
- [ ] navigation WhatsApp interceptée dans les tests ; aucun message réel ;
- [ ] offline, application absente, retour arrière et presse-papiers refusé ;
- [ ] politique de confidentialité visible et cohérente.

### Témoignages

- [ ] états vide, indisponible et peuplé ;
- [ ] seulement approuvé/visible/Instagram/non supprimé ;
- [ ] avatar visible/masqué, cache et rétablissement DB ;
- [ ] 25e témoignage accessible par pagination si le volume augmente ;
- [ ] consentement et retrait documentés ; purge vérifiée.

### Accessibilité et responsive

- [ ] clavier complet sur toutes les routes publiques ;
- [ ] skip link et focus après navigation/Retour ;
- [ ] menu mobile : Tab, Maj+Tab, Échap et sortie du header ;
- [ ] contrastes texte et focus ; couleurs forcées ;
- [ ] zoom 200 %/400 % sans perte ;
- [ ] 320/375/390/430/768/1024/1440 px et paysage 844×390 ;
- [ ] clavier virtuel, safe areas et orientation ;
- [ ] `prefers-reduced-motion` ;
- [ ] Axe sur toutes les pages, puis contrôle manuel lecteur d’écran.

### Fiabilité, données et exploitation

- [ ] WAF/rate limits prouvés par export et test preview contrôlé ;
- [ ] aucune PII dans logs, références retrouvables par support ;
- [ ] alertes GeoAdmin, DB, santé, 5xx et déploiement ;
- [ ] handoff idempotent ;
- [ ] purge 730 jours indépendante du trafic ;
- [ ] sauvegarde récente et restauration testée ;
- [ ] CI `next start` + PostgreSQL + fixtures + artefacts ;
- [ ] `npm audit`, lint, tests, types, build et E2E verts avant promotion.

## 16. Conclusion

Le socle de sécurité applicative est sain pour un site sans compte ni paiement en ligne : validation serveur, SQL paramétré, destinations externes fixes, en-têtes solides et absence de scripts tiers. Les risques les plus concrets sont aujourd’hui des défauts de confidentialité en mode dégradé, de fiabilité mobile, de dépendance à GeoAdmin et de discipline de déploiement. La prochaine production doit être bloquée tant que le dock mobile, le fallback GET traiteur et le test du deep-link Livraison ne sont pas traités ou explicitement acceptés.
