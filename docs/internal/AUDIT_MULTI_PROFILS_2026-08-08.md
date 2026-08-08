# Audit multi-profils — Dega Food Express

Date : 8 août 2026  
Périmètre : copie locale `/home/jessy/Bureau/Dega food site`  
Stack observée : Next.js 16.3, React 19.2, TypeScript 5.9, PostgreSQL, Sharp, Playwright  
Nature : audit défensif, non destructif, avec données synthétiques uniquement

## 1. Résumé exécutif

Le site est globalement sain sur son parcours public : il se construit en production, les tests existants passent, les pages principales s’affichent sans débordement à 1440, 390 et 320 px, les images référencées chargent, les accents français s’affichent, les principaux contrôles clavier sont présents, les prix et commandes sont revérifiés côté serveur et l’administration refuse l’accès sans authentification.

Aucune vulnérabilité critique ou élevée n’a été confirmée. Le rapport ne dit pas que le site « est sécurisé » : il dit précisément ce qui a été vérifié, ce qui a résisté et ce qui reste inconnu.

Les risques les plus importants sont de niveau moyen :

1. un lien `/carte?mode=livraison` empêche réellement de passer au retrait ;
2. le dock mobile du panier n’est pas fixé à l’écran comme prévu à cause de la transition de page ;
3. sans JavaScript, les pages restent sur « La page se prépare. » ;
4. si le HTML traiteur est visible mais que React ne s’hydrate pas, le formulaire retombe sur un envoi GET et place les données personnelles dans l’URL ;
5. une panne GeoAdmin bloque entièrement la remise d’une commande livrée ;
6. le focus clavier doré n’atteint pas le contraste 3:1 sur les surfaces claires ;
7. la limitation distribuée, les alertes, les sauvegardes et la restauration sont documentées mais non prouvées dans l’infrastructure ;
8. l’authentification administrateur repose sur un secret Basic partagé, sans MFA ni identité individuelle ;
9. les avatars publics provoquent une lecture PostgreSQL par image et ne sont pas cacheables ;
10. la CI teste Playwright en mode développement et sans base applicative, pas le build réellement servi.

Il n’y a pas de paiement bancaire en ligne, de compte client, de session client, de dépôt public d’avis, de Google Reviews, de webhook, d’OAuth, de cookie applicatif ni de script publicitaire. Ces surfaces sont donc non applicables aujourd’hui et ne doivent pas être simulées artificiellement.

## 2. Verdict par gravité

| Niveau | Nombre | Lecture |
|---|---:|---|
| Critique | 0 | Aucun accès généralisé, perte majeure ou compromission confirmée |
| Élevé | 0 | Aucun défaut démontré ne justifie ce niveau dans le contexte actuel |
| Moyen | 17 | Parcours, résilience, confidentialité, administration et exploitation |
| Faible | 16 | Durcissement, dette, échelle future et qualité |
| Informationnel | 1 | Opportunité sans défaut immédiat |

Priorités recommandées : aucun P0 bloquant avant toute mise en ligne n’a été confirmé ; les P1 doivent être traités au prochain sprint ou vérifiés dans Vercel avant publication.

## 3. Méthode et preuves exécutées

### 3.1 Contrôles automatisés

- `npm run lint` : réussi.
- `npm test` : 23 fichiers de tests sur 23 réussis.
- `npm run typecheck` : réussi.
- `SITE_URL=https://audit.dega-food.invalid npm run build` : réussi.
- `npm audit --audit-level=high` : 0 vulnérabilité connue au moment du contrôle.
- PostgreSQL 17 local jetable : schéma neuf, schéma réappliqué, migration héritée et migration réappliquée, tous réussis. Aucune donnée réelle n’a été utilisée.
- Playwright contre `next start` : 19 tests réussis, 1 test volontairement ignoré sur le projet desktop.
- Chromium : 9 routes × 3 viewports, soit 27 combinaisons. Statuts attendus, aucun débordement horizontal, aucune image cassée, un seul `h1`, aucune erreur de page et aucune violation Axe critique/sérieuse.
- Firefox Playwright : 5 routes × 2 viewports, soit 10 combinaisons. Même résultat positif.
- Réseau synthétique lent : 50 Kio/s, 400 ms de latence et CPU ×4 ; état `networkidle` en 11,962 s et menu mobile utilisable ensuite.
- Retour navigateur : l’article du panier reste présent après `/carte` → `/presentation` → Retour.
- API locales : `GET` non autorisé = 405, mauvais type = 415, JSON invalide = 400, zone inconnue = 400, avatar invalide = 404, administration sans secret = 401.
- En-têtes réellement servis : CSP, HSTS, `nosniff`, anti-frame, COOP, CORP, Referrer-Policy, Permissions-Policy et identifiant de requête présents.
- Aucun source map de production public n’a été trouvé dans `.next/static`.

### 3.2 Mesures de poids

- `public/` : environ 2,0 Mio, 19 fichiers, tous référencés.
- Plus gros asset public : environ 240 Kio.
- `.next/static/` : environ 1,1 Mio.
- JavaScript client référencé, brut d’après l’artefact de build : environ 51 Kio pour accueil/avis, 70 Kio pour traiteur et 89 Kio pour carte.
- Les 513 Mio de `.next/` local proviennent surtout des caches de construction et ne représentent pas le poids téléchargé par un visiteur.

### 3.3 Limites

- Aucun accès au compte Vercel, au WAF, aux logs hébergeur, au fournisseur PostgreSQL ou aux sauvegardes réelles.
- Aucun test sur les données ou comptes de production.
- WebKit n’a pas pu démarrer : bibliothèques système manquantes. Chromium et Firefox ont été testés.
- Aucun test manuel avec VoiceOver, NVDA, TalkBack ou matériel mobile physique.
- Les contrôles 200 %/400 % sont approchés par des viewports CSS étroits ; un vrai zoom navigateur et les couleurs forcées restent à tester.
- La base locale a validé le schéma et la migration, pas un cycle complet administrateur connecté avec données volumineuses.
- L’historique Git n’était pas exploitable dans cet environnement ; aucune conclusion sur d’anciens secrets ne peut être donnée.

## 4. Cartographie et frontières de confiance

### Public

- `/`, `/presentation`, `/evenements`, `/avis`, `/contact`, pages légales : contenu public.
- `/carte` : panier client, validation serveur, géocodage GeoAdmin, redirection WhatsApp.
- `/api/address-suggestions` et `/api/delivery-zone` : JSON same-origin, corps limité, validation et timeout.
- `/api/review-avatars/[id]` : avatars approuvés et visibles seulement.
- `/api/health` : liveness minimale, sans état DB.

### Privé

- `/statistiques` et `/statistiques/avis` : HTTP Basic via `proxy.ts`, pages `no-store`, contrôle répété dans les actions.
- `/statistiques/avis/avatar/[id]` : route privée séparée.
- PostgreSQL : statistiques agrégées et témoignages/avatars ; aucune adresse complète de commande n’est stockée.

### Externe

- GeoAdmin : suggestion et validation d’adresse, hôte fixe, timeout 4,5–5 s.
- WhatsApp/Meta : message de commande ou devis dans le paramètre `text` de `wa.me`.
- Instagram : canal de contact et source manuelle des témoignages.

## 5. Constats détaillés

### UX-ORDER-001 — Le paramètre livraison verrouille le choix

- **Profil / contexte :** client suivant un lien partagé, mobile ou desktop.
- **Surface :** `/carte?mode=livraison`, `app/carte/page.tsx:31-42`, `components/order/order-experience.tsx:120-137,293-297`.
- **Statut / criticité :** confirmé par code et navigateur ; **moyen**, P1.
- **Reproduction sûre :** ouvrir l’URL, cliquer sur « Retrait », relire les radios après rendu.
- **Observation :** Livraison reste cochée. Test local : avant `{retrait:false, livraison:true}`, après clic identique.
- **Attendu :** le paramètre initialise le premier rendu, puis le choix utilisateur devient prioritaire.
- **Cause :** `initialFulfillmentMethod ?? storedFulfillmentMethod` est recalculé à chaque rendu ; la prop gagne toujours.
- **Impact / probabilité :** blocage fonctionnel pour tout lien externe contenant ce paramètre ; probabilité moyenne dès que le lien est partagé.
- **Correction :** consommer la query une seule fois pour initialiser l’état, puis utiliser le contexte comme source de vérité ; retirer ou mettre à jour le paramètre.
- **Défense en profondeur :** formaliser la priorité URL → initialisation → choix utilisateur dans un reducer.
- **Régression :** livraison initiale ; passage au retrait stable ; Retour/Rechargement ; paramètre invalide ignoré.
- **Observabilité / responsable / effort :** test E2E, pas besoin de tracer un choix personnel ; frontend ; faible.

### UX-ORDER-002 — Le dock mobile du panier n’est pas réellement fixe

- **Profil / contexte :** utilisateur pressé sur petit téléphone après ajout d’un plat.
- **Surface :** `app/template.tsx:8`, `app/globals.css:79-94`, `components/order/order-experience.module.css:938-968,1569-1584`.
- **Statut / criticité :** confirmé par navigateur ; **moyen**, P1.
- **Reproduction sûre :** viewport 320×568, ajouter un article, mesurer le dock avant et après défilement.
- **Observation :** le dock se trouve à `y≈1479` au lieu du bas du viewport puis à `y≈-571` en bas de page. La transition parente conserve un `transform: matrix(...)`, qui devient le bloc de référence du `position: fixed`.
- **Attendu :** dock visible à environ 10 px du bord inférieur tant qu’un article existe.
- **Impact :** CTA panier invisible pendant une partie importante du parcours ; l’utilisateur peut croire que l’ajout n’a rien fait.
- **Correction :** ne pas laisser de transform persistant sur l’ancêtre du dock, ou rendre le dock hors du wrapper animé via portail/layout.
- **Défense en profondeur :** test géométrique sur un élément `position:fixed`, avec scroll haut/milieu/bas et safe areas.
- **Régression :** 320/390/768 px, reduced motion, clavier virtuel, footer, ouverture du dialog et retour focus.
- **Responsable / effort :** frontend ; moyen.

### REL-JS-001 — Le site reste sur le chargement sans JavaScript

- **Profil / contexte :** appareil ancien, bloqueur, bundle en échec ou JavaScript désactivé.
- **Surface :** `app/loading.tsx:3-17`, boundary globale App Router.
- **Statut / criticité :** confirmé contre le build de production ; **moyen**, P1.
- **Reproduction sûre :** visiter `/`, `/carte` et `/evenements` avec JavaScript désactivé.
- **Observation :** statut HTTP 200, mais le seul `h1` visible est « La page se prépare. » ; aucun `<noscript>` utile.
- **Attendu :** les pages éditoriales et le menu restent lisibles ; les fonctions interactives expliquent leur limite.
- **Impact :** indisponibilité complète en cas d’échec des scripts, alors que la majorité du contenu pourrait être statique.
- **Cause :** le fallback streaming global dépend du script Next pour révéler le contenu final.
- **Correction :** retirer le `loading.tsx` global ou le limiter aux segments réellement dynamiques ; ajouter un fallback `<noscript>` utile pour les actions interactives.
- **Défense en profondeur :** smoke CI avec JavaScript désactivé et test d’abandon des chunks.
- **Régression :** contenu public visible sans JS ; carte et traiteur expliquent comment contacter directement ; aucune double région `main`/`h1` visible.
- **Responsable / effort :** frontend/Next.js ; faible à moyen.

### PRIV-FORM-001 — Le formulaire traiteur non hydraté envoie les données en GET

- **Profil / contexte :** client remplissant le devis lorsque les chunks React échouent ou arrivent très tard.
- **Surface :** `app/evenements/catering-form.tsx:160-260,269`.
- **Statut / criticité :** confirmé avec données synthétiques ; **moyen**, P1.
- **Reproduction sûre :** autoriser l’HTML/les scripts inline Next, bloquer les chunks, remplir nom/téléphone/e-mail fictifs et soumettre.
- **Observation :** le formulaire est visible mais n’a ni `method` ni `action`. La navigation locale devient `/evenements?firstName=…&phone=…&email=…`; les neuf noms de champs apparaissent dans la query.
- **Attendu :** aucune donnée personnelle dans l’URL ; un POST valide ou un message indiquant que le formulaire attend son activation.
- **Cause :** toute la sécurité du transport repose sur `preventDefault()` dans le gestionnaire React.
- **Impact :** PII dans historique, captures, journaux HTTP et outils d’observation lors d’une panne d’hydratation. L’envoi WhatsApp ne se fait pas.
- **Correction :** vraie Server Action/route POST validée, puis redirection sûre ; le client ne doit être qu’une amélioration progressive.
- **Défense en profondeur :** `method="post"`, aucune journalisation de corps/query sensible, page d’attente claire avant hydratation.
- **Régression :** soumission sans JS ; chunks bloqués ; réseau lent ; aucune PII dans URL/log ; cas normal ouvre uniquement la destination prévue.
- **Responsable / effort :** full-stack ; moyen.

### UX-STATE-001 — Le brouillon de commande est partiellement perdu

- **Profil / contexte :** client revenant, rechargement, navigation interrompue.
- **Surface :** `components/order/order-session-provider.tsx:30-36`, `components/order/order-experience.tsx:138-142`.
- **Statut / criticité :** confirmé ; **moyen**, P2.
- **Reproduction sûre :** ajouter un article puis recharger ; ou saisir une adresse, naviguer et revenir.
- **Observation :** article conservé après Retour SPA, mais panier remis à zéro après rechargement ; l’adresse, locale au composant, disparaît même lors de certains remontages.
- **Attendu :** comportement explicite et cohérent, avec conservation raisonnable du brouillon non sensible.
- **Impact :** perte de temps et abandon ; aucune fuite inter-utilisateur n’a été trouvée.
- **Correction :** conserver panier et brouillon en mémoire/session avec expiration courte ; ne pas mettre l’adresse en URL ni en stockage durable par défaut.
- **Défense en profondeur :** effacer après remise WhatsApp, bouton « Recommencer », versionner le format de brouillon.
- **Régression :** reload, crash d’onglet, Retour, changement de catégorie, fin réussie et expiration.
- **Responsable / effort :** frontend + produit ; moyen.

### A11Y-FOCUS-001 — Contraste insuffisant du focus sur fond clair

- **Profil / contexte :** clavier, basse vision, zoom.
- **Surface :** `app/globals.css:5,129-132` et contrôles sur surfaces claires.
- **Statut / criticité :** confirmé par mesure ; **moyen**, P1.
- **Observation :** `#c9a35d` produit environ 2,36:1 sur blanc et 2,08:1 sur `#f6f0e5`, sous 3:1.
- **Attendu :** indicateur visible, non dépendant de la couleur seule et conforme WCAG 2.2.
- **Impact :** difficulté à localiser le focus ; axe automatisé standard ne détecte pas fiablement ce défaut visuel.
- **Correction :** token sombre sur fonds clairs et clair sur fonds sombres, ou anneau double.
- **Défense en profondeur :** styles `forced-colors`, contrôle à 200/400 %.
- **Régression :** boutons, liens, inputs, radio, checkbox, dialog et header sur chaque famille de fond.
- **Responsable / effort :** frontend/design ; faible.

### A11Y-NAV-001 — Échap ne ferme plus le menu après sortie du header

- **Profil / contexte :** navigation clavier sur téléphone.
- **Surface :** `components/layout/site-header.tsx:47-68,82-97`.
- **Statut / criticité :** confirmé par navigateur ; **moyen**, P1.
- **Reproduction sûre :** ouvrir le menu, tabuler jusqu’au contenu principal, appuyer sur Échap.
- **Observation :** le focus arrive sur « Découvrir notre carte » hors du header ; le menu reste visible après Échap.
- **Attendu :** Échap ferme un menu ouvert et rend le focus au bouton, quel que soit l’élément actuellement focalisé.
- **Cause :** le handler clavier est attaché uniquement au `<header>` ; le document ne gère que `pointerdown`.
- **Correction :** écouter Échap sur `document` pendant l’ouverture ; décider aussi si la sortie Tab ferme le disclosure.
- **Défense en profondeur :** inert/aria cohérents, retour focus et absence de piège.
- **Régression :** Échap dans et hors header, clic extérieur, resize desktop, même-route et Retour.
- **Responsable / effort :** frontend ; faible.

### A11Y-HISTORY-001 — Retour/Avance force le focus sur le contenu principal

- **Profil / contexte :** clavier ou lecteur d’écran utilisant l’historique.
- **Surface :** `components/layout/navigation-focus.tsx:59-88`.
- **Statut / criticité :** confirmé par code ; **faible**, P2.
- **Observation :** tout changement de pathname focalise `#contenu`, même si la navigation vient de `popstate`.
- **Attendu :** nouvelle navigation annonce le contenu ; Retour restaure autant que possible le contrôle et la position antérieurs.
- **Impact :** perte de contexte et répétition de navigation.
- **Correction :** distinguer clic interne et historique, mémoriser le dernier élément focalisé par entrée.
- **Régression :** lien normal, Retour, Avance, hash, 404 et élément supprimé.
- **Responsable / effort :** frontend ; moyen.

### UX-CATEGORY-001 — Les catégories de carte sont entièrement dépendantes de JavaScript

- **Profil / contexte :** lien partagé, rechargement, indexation, JS absent.
- **Surface :** `components/order/order-experience.tsx:124,345-351,655-687`.
- **Statut / criticité :** confirmé ; **faible**, P2.
- **Observation :** seul « Plats » est rendu initialement ; les catégories sont des boutons sans URL et ne survivent pas au reload.
- **Attendu :** une URL canonique peut ouvrir chaque catégorie.
- **Correction :** liens `?categorie=…` lus côté serveur, avec mise à jour client progressive.
- **Régression :** direct URL, rechargement, Retour, paramètre invalide et sans JS.
- **Responsable / effort :** frontend/SEO ; moyen.

### RESP-ADDRESS-001 — Les suggestions longues sont tronquées

- **Profil / contexte :** 320 px, zoom fort, adresses proches.
- **Surface :** `components/order/order-experience.module.css:389-394`, `components/order/address-autocomplete.tsx:316`.
- **Statut / criticité :** confirmé par CSS ; **faible**, P2.
- **Observation :** `nowrap`, ellipse et overflow caché ne donnent aucun accès visuel au suffixe.
- **Impact :** deux adresses partageant le même préfixe deviennent difficiles à distinguer.
- **Correction :** deux lignes, `overflow-wrap:anywhere`, hauteur adaptable.
- **Régression :** chaînes longues, accents, 320 px, 400 %, navigation clavier.
- **Responsable / effort :** frontend ; faible.

### REL-GEO-001 — GeoAdmin bloque toute commande livrée en cas de panne

- **Profil / contexte :** livraison pendant timeout/503/microcoupure.
- **Surface :** `lib/validate-delivery-zone.ts:22-90`, `app/carte/order-actions.ts:196-218`, `components/order/order-experience.tsx:536-559`.
- **Statut / criticité :** confirmé par code ; **moyen**, P1.
- **Observation :** timeout 5 s puis `service_error`; la commande est refusée et l’UI propose seulement Réessayer.
- **Attendu :** reprise explicite compatible avec la politique métier, sans inventer un tarif.
- **Impact :** indisponibilité totale du parcours livraison lors d’une panne externe.
- **Correction :** si le métier l’accepte, transformer l’échec en demande manuelle « zone et frais à confirmer » ; sinon offrir immédiatement le contact direct.
- **Défense en profondeur :** circuit breaker, retry unique avec jitter, cache court de réponses non personnelles et métriques amont.
- **Régression :** timeout, 429, 503, JSON invalide, reprise, hors-zone et absence de faux frais.
- **Responsable / effort :** produit + backend ; moyen.

### PERF-AVATAR-001 — Avatars publics N+1, sans cache et énumérables

- **Profil / contexte :** page Avis avec plusieurs témoignages, trafic automatisé.
- **Surface :** `app/avis/page.tsx:16-22`, `lib/customer-reviews.ts:151-162`, `app/api/review-avatars/[id]/route.ts:18-78`, `lib/postgres.ts:17-24`.
- **Statut / criticité :** confirmé ; **moyen**, P1.
- **Observation :** jusqu’à 24 URLs numériques provoquent chacune un `SELECT`; réponse `private, no-store` malgré `?v=updatedAt`; pool à une connexion par instance.
- **Impact :** latence, charge DB sérialisée et balayage d’identifiants. Aucun avatar masqué n’est divulgué : SQL exige approuvé + visible.
- **Correction :** route publique distincte avec identifiant opaque et cache contrôlé, ou stockage objet/CDN ; route admin privée `no-store` conservée.
- **Défense en profondeur :** WAF, cache négatif bref, monitoring 404/latence, invalidation au masquage.
- **Régression :** visible=200 ; pending/masqué/supprimé=404 ; cache HIT ; invalidation ; balayage borné.
- **Responsable / effort :** backend/plateforme ; moyen.

### CACHE-REVIEWS-001 — Une erreur DB peut être mise en cache 60 secondes

- **Profil / contexte :** visiteur pendant une panne PostgreSQL transitoire.
- **Surface :** `lib/customer-reviews.ts:219-268`.
- **Statut / criticité :** code confirmé, comportement ISR précis à revalider avec DB ; **faible**, P2.
- **Observation :** l’exception devient `{status:"error"}`, puis ce résultat est enveloppé par `unstable_cache`.
- **Attendu :** conserver le dernier contenu sain lorsque le refresh échoue.
- **Correction :** ne cachez que `ready`, ou laissez échouer le refresh ISR afin de servir le stale sain.
- **Régression :** sain → panne → stale sain ; démarrage sans DB → récupération ; mutation et invalidation.
- **Responsable / effort :** backend ; moyen.

### ADMIN-ERROR-001 — Une erreur d’édition perd le brouillon administrateur

- **Profil / contexte :** administrateur, validation invalide ou panne DB.
- **Surface :** `app/statistiques/avis/actions.ts:152-253`, `app/statistiques/avis/page.tsx:289-389`.
- **Statut / criticité :** confirmé par code ; **moyen**, P1.
- **Observation :** toute erreur redirige ; les champs sont reconstruits depuis la DB et le fichier choisi disparaît.
- **Attendu :** erreurs locales, brouillon conservé, focus sur résumé/champ.
- **Correction :** `useActionState`, retours structurés et redirection seulement après succès.
- **Défense en profondeur :** désactivation pending déjà présente ; avertir que le fichier doit être resélectionné si nécessaire.
- **Régression :** erreur de date, image trop grande, DB indisponible, double clic et succès.
- **Responsable / effort :** full-stack ; moyen.

### ADMIN-CONC-001 — Écritures concurrentes et créations rejouées non détectées

- **Profil / contexte :** administrateur avec deux onglets, double réponse réseau ou resoumission.
- **Surface :** `lib/customer-reviews.ts:321-374,423-465`, `app/statistiques/avis/actions.ts:157-216`.
- **Statut / criticité :** confirmé par code ; **faible**, P2.
- **Observation :** la dernière mise à jour gagne sans version optimiste ; aucune clé d’idempotence persistée pour la création.
- **Impact :** changement silencieusement écrasé ou témoignage dupliqué après réponse incertaine. Portée faible avec un seul administrateur actuel.
- **Correction :** `WHERE updated_at = versionSoumise` avec conflit explicite ; clé d’opération unique pour la création.
- **Défense en profondeur :** conserver transactions, advisory lock de création, `FOR UPDATE` du tri et bouton pending.
- **Régression :** deux updates concurrentes ; même clé rejouée ; panne injectée après commit.
- **Responsable / effort :** backend/frontend ; moyen.

### ADMIN-SCALE-001 — Liste admin non bornée et déplacement en O(n)

- **Profil / contexte :** administrateur avec plusieurs centaines de témoignages.
- **Surface :** `lib/customer-reviews.ts:270-318,479-543`, `app/statistiques/avis/page.tsx:232-389`.
- **Statut / criticité :** confirmé, impact futur ; **faible**, P3.
- **Observation :** tous les avis et leurs formulaires sont chargés ; un déplacement renormalise toute la liste.
- **Correction :** pagination/recherche et échange local de positions ou clés d’ordre espacées.
- **Régression :** fixture 500 avis, DOM borné, transaction courte, deux déplacements concurrents.
- **Responsable / effort :** full-stack/DB ; élevé.

### CONTENT-REVIEWS-001 — Les avis au-delà du 24e sont inaccessibles au public

- **Profil / contexte :** visiteur lorsque le contenu Instagram grandit.
- **Surface :** `app/avis/page.tsx:16-22`, `lib/customer-reviews.ts:219-251`.
- **Statut / criticité :** confirmé, non gênant tant que la liste est courte ; **faible**, P3.
- **Observation :** limite 24 sans pagination ou lien « Afficher plus ».
- **Correction :** pagination stable par curseur et URL partageable.
- **Régression :** 25e avis accessible sans doublon/omission, Retour et rechargement.
- **Responsable / effort :** full-stack ; moyen.

### PRIV-WHATSAPP-001 — Les messages contiennent des données personnelles dans l’URL WhatsApp

- **Profil / contexte :** client commandant une livraison ou demandant un devis.
- **Surface :** `config/site-config.ts:158-163`, `app/carte/order-actions.ts:254-309`, `lib/catering-whatsapp.ts:25-48`, `app/evenements/catering-form.tsx:242-260`.
- **Statut / criticité :** conception confirmée, inhérente au flux choisi ; **moyen**, P1.
- **Observation :** adresse de livraison, téléphone, e-mail, lieu, détails et panier sont encodés dans `https://wa.me/...?...text=`.
- **Attendu :** minimisation et information claire avant transfert à Meta ; aucune PII dans l’URL du domaine Dega.
- **Impact :** l’URL de destination contient le message et peut rester dans l’historique ou être exposée par une capture/outil tiers. La Referrer-Policy du site évite de transmettre le chemin complet comme referrer, mais elle ne retire pas le paramètre envoyé directement à WhatsApp.
- **Correction :** afficher un avis court avant départ, rendre l’e-mail facultatif comme aujourd’hui et réduire les champs au strict nécessaire. Évaluer un bouton « Copier le message puis ouvrir WhatsApp » ou une intégration Business appropriée si le risque métier l’exige.
- **Défense en profondeur :** ne jamais logger l’URL complète, corps ou message ; effacer les brouillons après départ ; documenter Meta.
- **Régression :** inspection URL/logs/historique avec données synthétiques ; aucune PII dans analytics ou références d’erreur.
- **Responsable / effort :** produit/confidentialité + frontend ; faible à moyen.

### PRIV-CONSENT-001 — L’autorisation des témoignages Instagram n’est pas traçable

- **Profil / contexte :** client cité/photographié, administrateur, responsable confidentialité.
- **Surface :** `app/confidentialite/page.tsx:24-31`, `db/schema.sql:45-82`, formulaire admin.
- **Statut / criticité :** **à vérifier** ; absence de preuve technique confirmée ; **faible**, P2.
- **Observation :** le texte affirme l’autorisation, mais ni date, canal, retrait ni référence minimale ne sont enregistrés.
- **Impact :** publication accidentelle et difficulté à démontrer l’accord ou son retrait.
- **Correction :** procédure métier datée ; éventuellement champ de confirmation obligatoire avant visibilité, sans conserver inutilement la capture Instagram.
- **Régression :** avis sans confirmation invisible ; retrait rend texte/avatar indisponibles puis purge.
- **Responsable / effort :** produit/confidentialité ; faible à moyen.

### PRIV-RETENTION-001 — La purge des statistiques dépend d’une nouvelle commande

- **Profil / contexte :** responsable confidentialité pendant une longue période sans commande.
- **Surface :** `lib/order-statistics.ts:75-125`, `app/confidentialite/page.tsx:65-74`.
- **Statut / criticité :** confirmé ; **faible**, P2.
- **Observation :** le `DELETE` au-delà de 730 jours n’est exécuté que dans `trackOrderHandoff`.
- **Attendu :** durée respectée même sans trafic.
- **Correction :** tâche planifiée idempotente ; garder le nettoyage à l’écriture comme filet.
- **Régression :** bornes 729/730/731 jours, Europe/Zurich, purge sans handoff.
- **Responsable / effort :** backend/ops ; faible à moyen.

### PRIV-RETENTION-002 — Les témoignages supprimés ne sont jamais purgés

- **Profil / contexte :** personne demandant retrait définitif.
- **Surface :** `lib/customer-reviews.ts:553-589`, `db/schema.sql:45-82`, politique de confidentialité.
- **Statut / criticité :** confirmé ; **faible**, P2.
- **Observation :** suppression douce `deleted_at`, aucune tâche de `DELETE` définitif.
- **Impact :** nom, commentaire et avatar peuvent rester indéfiniment en base et sauvegardes.
- **Correction :** durée explicite, job de purge, procédure de retrait et politique sauvegarde cohérente.
- **Régression :** absence publique immédiate, purge à échéance, restauration contrôlée.
- **Responsable / effort :** confidentialité/backend/DBA ; moyen.

### SEC-RATE-001 — Les limites distribuées ne sont pas démontrées

- **Profil / contexte :** trafic automatisé, scraping ou essais Basic répétés.
- **Surface :** APIs GeoAdmin, Server Action `/carte`, avatars, `/statistiques`, `docs/PRODUCTION.md:140-165`.
- **Statut / criticité :** absence applicative confirmée ; état WAF **à vérifier** ; **moyen**, P1.
- **Observation :** aucun limiteur distribué dans le dépôt ; la documentation demande de configurer Vercel Firewall.
- **Impact :** appels GeoAdmin, lectures DB, inflation des agrégats et brute force Basic si le WAF n’est pas actif.
- **Correction :** vérifier et activer règles edge par route/IP/fenêtre avec 429 ou challenge, incluant le POST Server Action `/carte`.
- **Défense en profondeur :** limites déjà présentes sur corps, délais GeoAdmin/DB, cache négatif et déduplication des handoffs.
- **Régression :** rafale graduelle en staging, trafic normal accepté, multi-instance borné.
- **Observabilité :** 429, volume par modèle de route, auth refusée, p95 amont ; jamais IP en clair au-delà du besoin/rétention.
- **Responsable / effort :** plateforme + backend ; moyen.

### SEC-AUTH-001 — Administration par secret Basic partagé

- **Profil / contexte :** administrateur, secret compromis, départ d’un collaborateur.
- **Surface :** `proxy.ts:23-84`, `lib/stats-auth-core.ts:11-82`, actions/pages privées.
- **Statut / criticité :** confirmé ; **moyen**, P1.
- **Observation :** un seul utilisateur/mot de passe donne tout l’accès. Pas de MFA, identité nominative, rôle, révocation individuelle, expiration de session ni logout fiable du cache Basic du navigateur.
- **Impact :** attribution impossible et rotation globale après compromission.
- **Correction :** à terme identité gérée avec MFA et audit ; immédiatement secret aléatoire long, rotation, HTTPS, WAF et accès réseau restreint.
- **Défense existante :** fail-closed, validation de longueur, SHA-256 + `timingSafeEqual`, contrôle proxy + action, `no-store`, logs sans secret.
- **Régression :** absent/mauvais/malformé refusé partout ; rotation ; ancien secret refusé ; futur MFA/révocation.
- **Responsable / effort :** plateforme/sécurité ; faible pour mitigation, élevé pour IdP.

### SEC-CSP-001 — La CSP publique autorise les scripts inline

- **Profil / contexte :** défense en profondeur contre une future injection.
- **Surface :** `lib/content-security-policy.ts:6-41`, `next.config.ts:84-91`.
- **Statut / criticité :** confirmé ; **faible**, P3.
- **Observation :** `script-src 'self' 'unsafe-inline'` sur le public. L’admin utilise nonce + `strict-dynamic`.
- **Impact :** réduit la barrière CSP si une future faille HTML apparaît. Aucun sink `dangerouslySetInnerHTML`, `innerHTML`, `eval` ou `document.write` n’a été trouvé.
- **Correction :** tester nonce/hash en Report-Only puis retirer `unsafe-inline` si Next le permet sans régression.
- **Régression :** scripts Next, hydration, erreurs CSP, injection texte bénigne et admin nonce.
- **Responsable / effort :** frontend/plateforme ; moyen à élevé.

### SEC-SUPPLY-001 — Références CI mutables

- **Profil / contexte :** chaîne logicielle GitHub Actions.
- **Surface :** `.github/workflows/ci.yml:18-38`.
- **Statut / criticité :** confirmé ; **faible**, P3.
- **Observation :** `actions/checkout@v7`, `actions/setup-node@v6`, `postgres:17-alpine` non épinglés à SHA/digest.
- **Correction :** épingler immuablement et automatiser les mises à jour revues.
- **Régression :** règle CI refusant `uses:` non SHA et image sans digest ; permissions `contents: read` préservées.
- **Responsable / effort :** DevOps ; faible.

### OBS-REFERENCE-001 — La référence publique ne correspond pas au texte journalisé

- **Profil / contexte :** support lors d’un incident DB/GeoAdmin.
- **Surface :** `lib/observability.ts:42-76`, usages `reportDatabaseError`.
- **Statut / criticité :** confirmé ; **moyen**, P1.
- **Observation :** le client voit les 10 premiers caractères alphanumériques en majuscules ; le log contient le UUID avec tirets. La chaîne publique exacte n’existe pas dans le log.
- **Impact :** recherche support difficile malgré la promesse de corrélation.
- **Correction :** calculer une fois `publicReference` et la journaliser dans un champ autorisé distinct du UUID interne.
- **Défense en profondeur :** ne jamais ajouter message, stack, corps ou PII.
- **Régression :** même référence UI/log pour DB, GeoAdmin et erreurs globales.
- **Responsable / effort :** backend ; faible.

### OPS-MONITORING-001 — WAF, métriques et alertes restent externes et non prouvés

- **Profil / contexte :** SRE/responsable incident.
- **Surface :** `app/api/health/route.ts`, `instrumentation.ts`, `lib/observability.ts`, `docs/PRODUCTION.md`.
- **Statut / criticité :** **à vérifier**, **moyen**, P1.
- **Observation :** `/api/health` répond seulement `{status:"ok"}` ; logs structurés locaux, mais aucun drain, dashboard, alerte ou moniteur externe n’est visible dans le dépôt.
- **Attendu :** liveness peu profonde + sondes synthétiques privées des dépendances et parcours.
- **Correction :** uptime, p95/p99, erreurs par route/dépendance, auth refusée, saturation DB, déploiement et alertes.
- **Régression :** couper DB/GeoAdmin en staging et vérifier que la liveness reste explicable mais que les sondes métier alertent.
- **Responsable / effort :** plateforme/ops ; moyen.

### OPS-DR-001 — Sauvegarde, restauration et rollback non démontrés

- **Profil / contexte :** corruption DB, mauvaise migration, mauvais déploiement.
- **Surface :** `docs/PRODUCTION.md:194-251`, pipeline CI.
- **Statut / criticité :** **à vérifier**, **moyen**, P1.
- **Observation :** procédures documentées, mais aucun RPO/RTO fixé, preuve PITR, exercice de restauration ou promotion/rollback automatisé.
- **Impact :** perte de témoignages/statistiques et reprise non prédictible. La commande WhatsApp reste majoritairement disponible sans DB.
- **Correction :** activer/vérifier snapshots/PITR, définir RPO/RTO, restaurer périodiquement dans une base isolée, smoke post-déploiement.
- **Régression :** restauration chronométrée, validation schéma/volumes, preview malsaine bloquée, rollback testé.
- **Responsable / effort :** ops + responsable métier ; moyen.

### CI-E2E-001 — La CI ne teste pas le serveur de production avec PostgreSQL

- **Profil / contexte :** équipe avant déploiement.
- **Surface :** `playwright.config.ts:27-40`, `.github/workflows/ci.yml:52-73`.
- **Statut / criticité :** confirmé ; **moyen**, P1.
- **Observation :** E2E lance `next dev` avec `DATABASE_URL=""`, puis le build arrive après. Le test DB ne couvre que schéma/migration.
- **Impact :** régressions `next start`, ISR, cache, Server Actions, CRUD et avatars peuvent passer.
- **Correction :** build avant E2E, `next start`, projet DB-backed et cycle admin complet.
- **Défense présente :** cet audit a exécuté manuellement 19 tests contre `next start` et le schéma local, tous réussis.
- **Régression :** créer → masquer → publier → avatar → ordre → supprimer, plus en-têtes/ISR et panne DB.
- **Responsable / effort :** QA/full-stack ; moyen à élevé.

### QA-MATRIX-001 — Matrice automatisée encore partielle

- **Profil / contexte :** QA, navigateurs et aides techniques.
- **Surface :** `playwright.config.ts:41-55`, `e2e/`.
- **Statut / criticité :** confirmé ; **faible**, P2.
- **Observation :** CI Chromium desktop/Pixel portrait seulement ; trois pages Axe ; pas de paysage, zoom, no-JS, réseau lent, Firefox/WebKit ou données volumineuses.
- **Mesure complémentaire :** Firefox a réussi pendant cet audit ; WebKit reste non testé faute de bibliothèques hôte.
- **Correction :** projets Firefox/WebKit, paysage/tablette, no-JS, zoom/reflow, fixtures longues/nombreuses et admin authentifié.
- **Responsable / effort :** QA/frontend ; élevé.

### ARCH-COMPONENT-001 — Deux composants concentrent trop de responsabilités

- **Profil / contexte :** développeur maintenant commandes et traiteur.
- **Surface :** `order-experience.tsx` 875 lignes ; `catering-form.tsx` 650 lignes.
- **Statut / criticité :** dette confirmée ; **faible**, P3.
- **Impact :** coût de changement et risque de couplage état/transport/rendu ; UX-ORDER-001 illustre ce risque.
- **Correction :** extraire hooks de domaine, transitions pures et contrats partagés, sans découpage visuel artificiel.
- **Régression :** tests unitaires des transitions, réponses obsolètes, prix et soumission.
- **Responsable / effort :** frontend ; moyen.

### DB-MIGRATION-001 — Pas de registre/version de migrations

- **Profil / contexte :** plusieurs futures migrations et rollback.
- **Surface :** `db/migrations/20260807_customer_review_admin.sql`, `scripts/check-database-schema.mjs`.
- **Statut / criticité :** dette confirmée ; **faible**, P3.
- **Observation :** une migration transactionnelle/idempotente, mais aucun journal ordre/checksum.
- **Correction :** runner versionné avec table de migrations et contrôle avant promotion.
- **Régression :** base vide, chaque schéma antérieur, checksum modifié refusé.
- **Responsable / effort :** backend/plateforme ; moyen.

### SEO-OG-001 — Dimension Open Graph traiteur incohérente

- **Profil / contexte :** partage social et robots.
- **Surface :** `app/evenements/page.tsx:15-25`, asset `alloco-poisson-braise-retouche.webp`.
- **Statut / criticité :** confirmé ; **faible**, P3.
- **Observation :** metadata 720×720, fichier 960×960.
- **Correction :** déclarer 960×960 ou valider automatiquement les dimensions.
- **Régression :** test transversal metadata ↔ fichier.
- **Responsable / effort :** frontend/SEO ; faible.

### SEO-STRUCTURED-001 — Pas encore de données structurées locales

- **Profil / contexte :** moteur de recherche local.
- **Surface :** metadata/sitemap.
- **Statut / criticité :** opportunité **informationnelle**, P3.
- **Observation :** titres, canonical, Open Graph, sitemap et robots sont présents ; aucun JSON-LD LocalBusiness/FoodEstablishment.
- **Condition :** l’adresse publique, les horaires et la fiche Google ne sont pas encore définis ; il ne faut rien inventer.
- **Correction :** après création de la fiche Google et validation des informations officielles, ajouter un JSON-LD cohérent avec le site et la fiche.
- **Responsable / effort :** produit/SEO ; faible.

## 6. Protections vérifiées et points ayant résisté

- Le serveur reconstruit les articles, quantités, prix, mode, zone et frais ; le client ne peut pas imposer son total.
- Les requêtes SQL applicatives sont paramétrées ; transactions et verrous sont utilisés aux endroits sensibles.
- Les actions administrateur revérifient l’authentification côté serveur.
- L’administration échoue fermée et utilise `private, no-store`, `noindex` et CSP nonce.
- Les APIs JSON refusent méthode/type/taille/forme invalides et limitent les délais amont.
- Aucun CORS permissif ni destination SSRF contrôlée par l’utilisateur n’a été trouvé.
- Aucun sink XSS dangereux n’a été trouvé ; React échappe le texte des témoignages et retours GeoAdmin.
- Upload avatar : admin seulement, JPEG/PNG/WebP, 512 Kio, signature, 16 Mpx, Sharp, rotation, resize 192×192 et réencodage WebP.
- Les 19 images publiques inspectées ne contiennent pas de métadonnées EXIF/XMP/ICC/IPTC.
- Aucun secret client ou `NEXT_PUBLIC_*` sensible n’a été trouvé ; `.env*` est ignoré et le placeholder admin est volontairement invalide.
- Logs structurés sur liste blanche, sans corps, cookie, header d’authentification, message d’erreur ou stack.
- Headers navigateur réellement présents et 401 Basic réellement servi sur l’administration.
- Menu mobile, dialog panier, résumé d’erreurs traiteur, skip link et réduction de mouvement possèdent de bonnes bases accessibles.
- Autocomplétion : debounce, annulation, contrôle de réponse obsolète, saisie manuelle et états explicites.
- Accueil et Avis sont ISR 60 s ; pages éditoriales statiques ; aucun tracker/script publicitaire tiers.
- Retour navigateur SPA conserve le panier dans le scénario testé.
- Aucun débordement horizontal, image cassée ou violation Axe critique/sérieuse sur 27 combinaisons Chromium et 10 Firefox.

## 7. Synthèse par domaine

| Domaine | Résultat principal | Références |
|---|---|---|
| Expérience visiteur | Proposition culinaire, carte, zones, contacts et CTA compréhensibles ; trois défauts d’état/CTA | UX-ORDER-001/002, UX-STATE-001 |
| Responsive | 320–1440 px sans overflow ; suggestions longues à améliorer | RESP-ADDRESS-001 |
| Accessibilité | Axe bloquant vide sur routes testées ; focus et menu mobile à corriger | A11Y-FOCUS-001, A11Y-NAV-001, A11Y-HISTORY-001 |
| Performance | Assets compacts ; avatars N+1 et réseau lent mesuré | PERF-AVATAR-001 |
| Fiabilité | Build et parcours réussis ; no-JS et dépendance GeoAdmin fragiles | REL-JS-001, REL-GEO-001 |
| Frontend/React | Bon typage et états explicites ; query initiale et gros composants | UX-ORDER-001, ARCH-COMPONENT-001 |
| Backend/API | Validation stricte, timeouts et statuts corrects ; limite distribuée externe | SEC-RATE-001 |
| Données | Schéma/migration réussis ; rétention et concurrence à durcir | PRIV-RETENTION-001/002, ADMIN-CONC-001 |
| Authentification | Basic correctement vérifié, mais partagé et sans MFA | SEC-AUTH-001 |
| Autorisation | Aucun contournement trouvé ; contrôle répété dans les actions | protections vérifiées |
| Sessions | Pas de session client ; cache Basic admin sans logout/expiration applicative | SEC-AUTH-001 |
| Cache | ISR public correct ; erreur DB susceptible d’être cachée | CACHE-REVIEWS-001 |
| Sécurité navigateur | En-têtes solides ; `unsafe-inline` public à réduire | SEC-CSP-001 |
| Sécurité serveur | Pas de XSS/SQLi/SSRF confirmé ; anti-abus à vérifier | SEC-RATE-001 |
| Confidentialité | Stockage minimal des commandes ; URL WhatsApp et rétention à encadrer | PRIV-WHATSAPP-001, PRIV-* |
| Administration | Fail-closed ; brouillon, concurrence et échelle à améliorer | ADMIN-* |
| Observabilité | Logs sûrs ; corrélation et alertes à compléter | OBS-REFERENCE-001, OPS-MONITORING-001 |
| Continuité | Procédure écrite ; preuve de restauration absente | OPS-DR-001 |
| SEO/partage | Metadata/canonical/sitemap présents ; OG traiteur et futur JSON-LD | SEO-* |
| Qualité/CI | Base de tests utile ; production DB et matrice navigateurs manquent | CI-E2E-001, QA-MATRIX-001 |

## 8. Surfaces non applicables

Les contrôles suivants ont été examinés puis classés non applicables à l’état actuel :

- inscription, compte client, mot de passe client, récupération de compte et onboarding ;
- cookies applicatifs, JWT, session client, OAuth/OIDC, passkey et SSO ;
- paiement bancaire, carte, token PCI, transaction ou webhook de paiement ;
- dépôt public d’avis et Google Reviews ;
- rôles multi-tenant, organisation, invitation, impersonation et support délégué ;
- export utilisateur, action de masse publique, WebSocket, GraphQL et temps réel ;
- e-mail ou SMS sortant ;
- service worker, mode offline et stockage navigateur persistant ;
- géolocalisation, caméra et microphone, explicitement interdits par Permissions-Policy ;
- fichiers utilisateurs écrits dans `public/` ; les avatars sont normalisés puis stockés en BLOB PostgreSQL ;
- publicité, analytics tiers, tag manager et scripts de support.

## 9. Matrice de scénarios réellement couverts

| Contexte | Couvert | Résultat / limite |
|---|---:|---|
| Desktop 1440×900 | Oui | 9 routes Chromium, 5 Firefox, aucun overflow/axe bloquant |
| Mobile 390×844 | Oui | mêmes routes principales, menu/dialog/formulaire |
| Petit écran 320×568 | Oui | 9 routes, aucun overflow ; dock défectueux confirmé |
| Firefox | Oui | 10 combinaisons réussies |
| WebKit/Safari | Non | dépendances hôte manquantes |
| Réseau lent + CPU faible | Oui | accueil `networkidle` 11,962 s, menu ensuite utilisable |
| JavaScript désactivé | Oui | défaut REL-JS-001 confirmé |
| Chunks bloqués avant hydratation | Oui | défaut PRIV-FORM-001 confirmé |
| Retour navigateur | Oui | panier conservé ; focus reste à améliorer |
| Rechargement | Oui | panier perdu, UX-STATE-001 |
| Clavier | Partiel | menu/dialog/formulaire ; Échap hors header échoue |
| Lecteur d’écran physique | Non | Axe + sémantique seulement |
| Zoom 200/400 % | Partiel | reflow via viewports étroits ; zoom natif non testé |
| Paysage téléphone/tablette | Non | à ajouter à la CI |
| Données longues/Unicode | Partiel | validations unitaires ; suggestions longues non rendues en fixture |
| 500 témoignages | Non | risque d’échelle déduit du code |
| Base indisponible | Partiel | fallback lu/testé, pas de chaos E2E complet |
| GeoAdmin indisponible | Code/tests | blocage confirmé par logique, pas d’attaque du service externe |
| Double action/concurrence | Partiel | pending présent, absence d’idempotence/version observée |
| Expiration/changement de rôle | N/A | pas de session ni rôles applicatifs ; Basic partagé |
| Sauvegarde/restauration | Non | nécessite fournisseur DB et autorisation ops |

## 10. Stratégie de test P0–P3

### P0 — Bloquants vitaux

Aucun constat actuel ne justifie un P0 confirmé. Les contrôles P0 à conserver dans la CI : build, validation serveur des prix/articles, administration refusée sans secret, schéma/migration et génération du message sans donnée réelle.

### P1 — Parcours essentiels

| Parcours | Succès | Erreur | Permission | Lent/double | Mobile/desktop/a11y |
|---|---|---|---|---|---|
| Ouvrir la carte et choisir retrait/livraison | Testé, sauf bug query | Paramètre invalide à automatiser | Public | réseau lent couvert | 320/390/1440, clavier à renforcer |
| Ajouter, ouvrir panier, revenir | Testé | reload révèle perte | Public | double clic borné par quantité | dialog et retour focus testés |
| Valider livraison | Validation serveur présente | GeoAdmin 503 bloque | Public | timeout présent, WAF à vérifier | messages accessibles |
| Envoyer devis traiteur | Succès client testé | erreurs/focus testés | Public | hydratation cassée révèle GET | mobile/desktop couverts |
| Lire avis/avatars | états ready/empty/error | panne DB à compléter | public filtre visible | N+1/cache à corriger | cartes sémantiques testées |
| Administrer avis | logique/auth auditées | brouillon perdu | Basic + actions | concurrence à ajouter | admin E2E DB absent |

### P2 — Fonctions secondaires

- pagination avis et catégories partageables ;
- persistance de brouillon ;
- Retour/Avance avec restauration focus ;
- rétention planifiée et consentement ;
- monitoring, corrélation et source cache stale.

### P3 — Cas rares/durcissement

- CSP nonce publique ;
- SHA/digest CI ;
- registre de migrations ;
- échelle 500+ avis ;
- JSON-LD après données officielles ;
- refactor des deux grands composants.

## 11. Dix risques les plus importants

1. **PRIV-FORM-001** — PII en query lorsque le formulaire visible n’est pas hydraté.
2. **UX-ORDER-001** — retrait impossible depuis un lien livraison.
3. **UX-ORDER-002** — dock panier mobile non fixe et CTA invisible.
4. **REL-JS-001** — site bloqué sur le chargement sans JavaScript.
5. **REL-GEO-001** — dépendance GeoAdmin bloquante pour toute livraison.
6. **SEC-RATE-001** — anti-abus distribué non démontré.
7. **SEC-AUTH-001** — secret administrateur partagé sans MFA/identité.
8. **PERF-AVATAR-001** — avatars N+1 sans cache, IDs énumérables.
9. **OPS-DR-001** — restauration et rollback non prouvés.
10. **CI-E2E-001** — absence de parcours production + DB dans la CI.

## 12. Dix améliorations UX à plus fort impact

1. Corriger la priorité du choix retrait/livraison.
2. Rendre le dock mobile réellement fixe et visible après ajout.
3. Fournir un vrai contenu/fallback sans JavaScript.
4. Sécuriser la soumission traiteur avant hydratation.
5. Conserver un brouillon de panier/adresse à durée courte.
6. Rendre le focus contrasté sur toutes les surfaces.
7. Fermer le menu avec Échap où que se trouve le focus.
8. Prévoir un chemin manuel clair lorsque GeoAdmin est indisponible.
9. Afficher les suggestions d’adresse longues sur deux lignes.
10. Donner une URL aux catégories et une pagination aux témoignages.

## 13. Dix améliorations fiabilité à plus fort impact

1. Faire tourner Playwright contre `next start` en CI.
2. Relier un projet E2E à PostgreSQL local de CI.
3. Définir un fallback métier sûr lors d’une panne GeoAdmin.
4. Ne pas cacher un résultat d’erreur DB comme contenu normal.
5. Ajouter idempotence aux créations et statistiques de handoff.
6. Ajouter version optimiste aux modifications admin.
7. Planifier les purges indépendamment du trafic.
8. Mettre en cache/déporter les avatars publics.
9. Ajouter sondes synthétiques et alertes par dépendance.
10. Tester réellement restauration, rollback et migration avant promotion.

## 14. Dix mesures sécurité prioritaires

1. Vérifier le WAF Vercel sur APIs, Server Action carte, avatars et admin.
2. Protéger le formulaire non hydraté contre le GET de PII.
3. Restreindre/faire tourner le secret Basic et planifier MFA.
4. Séparer/cacher la route avatar publique avec identifiants opaques.
5. Journaliser la référence publique sans loguer les données métier.
6. Établir une preuve minimale d’autorisation Instagram.
7. Définir et automatiser la purge des témoignages supprimés.
8. Réduire les données du message WhatsApp et informer avant transfert.
9. Tester une CSP publique sans `unsafe-inline` en Report-Only.
10. Épingler GitHub Actions et image PostgreSQL par SHA/digest.

## 15. Corrections réalisables en moins d’une journée

- UX-ORDER-001 : initialiser le mode une seule fois et ajouter un E2E.
- A11Y-FOCUS-001 : remplacer le token de focus clair sur surfaces claires.
- A11Y-NAV-001 : écouteur document Échap conditionnel.
- OBS-REFERENCE-001 : ajouter `publicReference` au log sûr.
- SEO-OG-001 : corriger 720×720 en 960×960 et tester les dimensions.
- PRIV-WHATSAPP-001 : ajouter une phrase courte avant redirection et vérifier la minimisation.
- SEC-SUPPLY-001 : épingler les références CI.
- RESP-ADDRESS-001 : permettre deux lignes.
- Ajouter tests no-JS, query livraison, reload et dock géométrique.
- Vérifier dans Vercel que les règles WAF documentées existent réellement.

## 16. Corrections nécessitant une refonte ou une décision métier

- Auth administrateur nominative avec MFA et audit.
- Fallback GeoAdmin : décision métier sur demande manuelle et frais à confirmer.
- Stockage/cache public des avatars avec invalidation sûre.
- Vraie soumission progressive du formulaire traiteur.
- Persistance privée/éphémère et cohérente du brouillon de commande.
- Idempotence + contrôle optimiste des mutations admin.
- Pagination admin/public et réorganisation à grande échelle.
- Runner de migrations versionné.
- Observabilité fournisseur, backup/PITR et promotion/rollback.
- Refactor progressif des composants commande et traiteur.

## 17. Plan d’action

### Dans les 24 heures

1. Corriger UX-ORDER-001, UX-ORDER-002 et A11Y-NAV-001.
2. Corriger le contraste du focus.
3. Ajouter des tests de régression pour ces quatre défauts.
4. Vérifier manuellement les règles WAF, secrets Vercel et HTTPS.
5. Confirmer qu’une sauvegarde PostgreSQL récente existe avant toute migration.
6. Corriger la dimension OG traiteur et la corrélation de référence.

### Dans les 7 jours

1. Traiter REL-JS-001 et PRIV-FORM-001.
2. Définir avec le métier le fallback GeoAdmin.
3. Faire tourner E2E sur `next start` + PostgreSQL dans la CI.
4. Formaliser autorisation Instagram et retrait.
5. Ajouter purge planifiée stats/témoignages.
6. Mesurer requêtes/latence avatars et choisir cache ou stockage objet.

### Dans les 30 jours

1. Ajouter monitoring, alertes, dashboards et sondes synthétiques.
2. Mettre en place version optimiste/idempotence admin.
3. Tester restauration et rollback chronométrés ; fixer RPO/RTO.
4. Ajouter Firefox/WebKit, paysage, zoom et fixtures volumineuses à la CI.
5. Améliorer persistance du brouillon et catégories partageables.
6. Déployer le durcissement avatar public.

### Dans les 90 jours

1. Migrer l’administration vers une identité nominative avec MFA si l’activité le justifie.
2. Adopter un registre de migrations.
3. Refactorer progressivement les composants monolithiques.
4. Ajouter pagination/recherche admin et public.
5. Tester CSP publique stricte puis l’activer.
6. Ajouter les données structurées seulement après création de la fiche Google et validation des données officielles.

## 18. Checklist avant production

- [ ] `npm ci`, lint, tests, typecheck, audit et build réussissent depuis un clone propre.
- [ ] E2E exécutés contre `next start`, desktop et mobile.
- [ ] Schéma/migrations appliqués sur une copie ou base prévue, avec sauvegarde préalable.
- [ ] `SITE_URL`, `DATABASE_URL`, `STATS_USER`, `STATS_PASSWORD` configurés sans placeholder.
- [ ] Domaine et certificat HTTPS vérifiés.
- [ ] WAF/rate limits actifs pour APIs, avatars, `/carte` et `/statistiques/:path*`.
- [ ] Secret admin long, unique, stocké côté serveur et rotation planifiée.
- [ ] Accès DB à privilèges minimaux et réseau restreint vérifiés.
- [ ] Headers de sécurité vérifiés sur public et admin.
- [ ] Aucun source map, `.env`, photo brute ou artefact local publié.
- [ ] 401 admin, 404, erreurs API et fallback DB vérifiés.
- [ ] Commande retrait/livraison testée avec prix et numéros définitifs.
- [ ] Formulaire traiteur testé normal, lent et chunks bloqués sans PII en URL.
- [ ] Numéros, zones Lausanne/Lucens et traiteur Suisse relus.
- [ ] Consentements des témoignages publiés disponibles.
- [ ] Backup récent et procédure de rollback identifiée.
- [ ] Moniteur `/api/health` et sondes métier configurés.
- [ ] Propriétaire d’incident et canal d’alerte connus.

## 19. Checklist après déploiement

- [ ] Ouvrir chaque route publique et vérifier canonical/robots/sitemap.
- [ ] Tester 320, 390, tablette, desktop, Chromium, Firefox et Safari/WebKit réel.
- [ ] Tester menu, clavier, focus, panier dialog et formulaire traiteur.
- [ ] Vérifier une commande synthétique jusqu’avant le départ vers WhatsApp.
- [ ] Vérifier un devis synthétique jusqu’avant le départ vers WhatsApp.
- [ ] Vérifier admin 401 sans secret et accès avec le secret prévu.
- [ ] Vérifier témoignage public, avatar et invalidation après masquage.
- [ ] Contrôler logs sans PII et retrouver une référence publique.
- [ ] Contrôler cache HIT accueil/avis et absence de cache privé admin.
- [ ] Contrôler erreurs/latence GeoAdmin et PostgreSQL.
- [ ] Vérifier événements WAF/429 avec un test gradué autorisé.
- [ ] Confirmer snapshot/PITR et horodatage de la dernière sauvegarde.
- [ ] Observer erreurs 5xx, p95/p99, saturation DB et abandons pendant 24 h.
- [ ] Conserver artefact, version, résultat smoke et chemin de rollback.

## 20. Points non testés et raison

1. Configuration Vercel/WAF : aucun connecteur ni accès au compte.
2. TLS/domaine de production : audit limité au localhost.
3. PostgreSQL de production : protection des données réelles.
4. Backups/PITR/restauration : nécessite compte fournisseur et exercice autorisé.
5. WebKit : dépendances système absentes dans l’hôte d’audit.
6. Lecteurs d’écran réels : aucun dispositif/logiciel AT piloté.
7. Appareils mobiles physiques, clavier virtuel et safe areas iOS : émulation seulement.
8. Zoom natif 400 %/couleurs forcées : reflow approché, contrôle manuel restant.
9. Charge distribuée/rate limit : pas de test de stress sans staging autorisé.
10. Concurrence réelle multi-instance : pas d’environnement serverless distribué.
11. Gros volumes avis/statistiques : aucune fixture 500+ dans la base locale.
12. Historique Git et secrets anciens : dépôt Git inaccessible ici.
13. Consentements Instagram réels : processus humain externe au code.
14. Chiffrement au repos/rôle DB : configuration fournisseur non accessible.
15. Logs/alertes/dashboards réels : aucun drain connecté à l’audit.

## 21. Preuves à obtenir pour lever les hypothèses

- captures des règles WAF actives, seuils et chemins ;
- paramètres secrets Vercel montrant uniquement noms/portées, jamais valeurs ;
- preuve HTTPS/HSTS du domaine final ;
- grants du rôle PostgreSQL et restrictions réseau expurgés ;
- preuve chiffrement, PITR, date de sauvegarde et rapport de restauration ;
- dashboard GeoAdmin/DB/routes, alertes et exemple de référence corrélée ;
- procédure de consentement/retrait Instagram et dates des avis publiés ;
- résultats Safari/WebKit physique, VoiceOver/NVDA et zoom 400 % ;
- rapport E2E `next start` avec DB et cycle CRUD complet ;
- métriques cache HIT/MISS et requêtes DB pour les avatars ;
- test de concurrence/idempotence en staging ;
- version/digest des actions CI et de l’image PostgreSQL ;
- RPO/RTO validés par le responsable métier ;
- smoke et rollback d’un déploiement de test.

## 22. Matrice de régression après correction

| ID | Succès à couvrir | Négatif/erreur | Contextes |
|---|---|---|---|
| UX-ORDER-001 | livraison initiale puis retrait | paramètre inconnu | reload, Retour, mobile/desktop |
| UX-ORDER-002 | dock au bas écran | footer/dialog/clavier | 320/390/768, reduced motion |
| REL-JS-001 | contenu public lisible | chunks absents | no-JS, lent, 404 |
| PRIV-FORM-001 | POST/WhatsApp prévu | chunks bloqués, validation | aucune PII URL/log |
| UX-STATE-001 | brouillon cohérent | expiration/format ancien | Retour, reload, crash |
| A11Y-FOCUS-001 | contraste ≥3:1 | tous fonds/états | 200/400 %, forced colors |
| A11Y-NAV-001 | Échap ferme | focus hors header | clavier, SR, mobile |
| REL-GEO-001 | adresse éligible | timeout/429/503/invalide | prix jamais inventé |
| PERF-AVATAR-001 | visible + cache | caché/supprimé/ID absent | multi-visites, invalidation |
| CACHE-REVIEWS-001 | contenu sain | panne au refresh | ISR/stale/recovery |
| ADMIN-ERROR-001 | succès persiste | validation/DB/upload | brouillon et focus |
| ADMIN-CONC-001 | update versionné | conflit/rejeu | 2 onglets/instances |
| PRIV-RETENTION-* | purge à échéance | limites temporelles | Zurich, backup |
| SEC-RATE-001 | trafic normal | rafale graduelle | routes et multi-instance |
| SEC-AUTH-001 | bon acteur | absent/mauvais/rotaté | pages/actions/avatars |
| OBS-REFERENCE-001 | référence retrouvée | erreur DB/GeoAdmin | aucun contenu sensible |
| OPS-DR-001 | restauration valide | backup absent/corrompu | RPO/RTO/rollback |
| CI-E2E-001 | build + DB + CRUD | DB down/migration ancienne | prod server, artifacts |

## 23. Priorités P0–P3

| Priorité | Constats | Action |
|---|---|---|
| P0 — avant production | Aucun défaut confirmé à ce niveau | Ne pas créer artificiellement un P0 ; conserver les contrôles vitaux |
| P1 — prochain sprint | UX-ORDER-001/002, REL-JS-001, PRIV-FORM-001, A11Y-FOCUS-001, A11Y-NAV-001, REL-GEO-001, PERF-AVATAR-001, ADMIN-ERROR-001, PRIV-WHATSAPP-001, SEC-RATE-001, SEC-AUTH-001, OBS-REFERENCE-001, OPS-MONITORING-001, OPS-DR-001, CI-E2E-001 | Corriger ou vérifier l’infrastructure |
| P2 — planifié | UX-STATE-001, A11Y-HISTORY-001, UX-CATEGORY-001, RESP-ADDRESS-001, CACHE-REVIEWS-001, ADMIN-CONC-001, PRIV-CONSENT-001, PRIV-RETENTION-001/002, QA-MATRIX-001 | Fiabilité, confidentialité, accessibilité |
| P3 — durcissement | ADMIN-SCALE-001, CONTENT-REVIEWS-001, SEC-CSP-001, SEC-SUPPLY-001, ARCH-COMPONENT-001, DB-MIGRATION-001, SEO-OG-001, SEO-STRUCTURED-001 | Échelle, dette et optimisation |

## 24. Plan de retest complet

1. Rejouer d’abord les quatre reproductions certaines : query livraison, dock fixe, no-JS et formulaire non hydraté.
2. Rejouer les contrôles transversaux : lint, 23 tests, types, audit dépendances, build et DB/migrations.
3. Lancer `next start` avec PostgreSQL jetable et fixtures déterministes.
4. Exécuter P1 sous Chromium, Firefox et WebKit : 320, 390, 768, 1024 et 1440 px.
5. Ajouter paysage, zoom/reflow, reduced motion, forced colors, clavier et lecteur d’écran manuel.
6. Simuler proprement timeout/429/503 GeoAdmin, DB down et récupération.
7. Tester deux requêtes concurrentes et rejeu avec clés d’idempotence.
8. Vérifier headers, cache public/privé, CSP Report-Only et absence de PII dans URL/logs.
9. Tester WAF graduellement en staging puis vérifier métriques/alertes.
10. Restaurer une sauvegarde isolée, exécuter smoke, mesurer RPO/RTO et tester rollback.
11. Comparer les métriques avant/après : p95, erreurs, DB/page, cache HIT, abandon commande et accessibilité.
12. Archiver les preuves non sensibles avec commit/build, date, environnement et responsable.

## 25. Conclusion

Le socle applicatif a résisté aux contrôles les plus importants : validation serveur de commande, accès admin refusé par défaut, upload normalisé, SQL paramétré, en-têtes de sécurité, build, schéma/migration, Chromium et Firefox. Les priorités ne sont pas une réécriture globale : elles consistent d’abord à corriger quatre régressions frontend reproductibles, sécuriser la dégradation du formulaire et de GeoAdmin, puis prouver les protections d’exploitation qui vivent hors du dépôt.

La prochaine décision utile est de traiter les P1 dans l’ordre du plan 24 h/7 jours, puis de rejouer la matrice de régression ci-dessus avant synchronisation et déploiement.
