# Exploitation et mise en production

Ce document est une procédure à exécuter avant l’ouverture publique. Il ne
constitue pas une preuve que le pare-feu, les sauvegardes, les alertes ou la
supervision sont déjà configurés chez l’hébergeur.

## 1. Architecture et modes dégradés

L’application est un site Next.js avec fonctions serveur. PostgreSQL sert aux
compteurs agrégés de passages vers WhatsApp et aux témoignages Instagram.
GeoAdmin (swisstopo) est appelé uniquement pour proposer et vérifier les
adresses.

- Sans PostgreSQL, les pages publiques et le passage vers WhatsApp continuent
  de fonctionner. Les statistiques et témoignages administrés sont
  indisponibles.
- Sans identifiants administrateur valides, `/statistiques` et ses sous-pages
  répondent `503` et restent fermées.
- Si GeoAdmin ne répond pas, le site affiche une erreur courte accompagnée
  d’une référence ; il ne doit pas inventer une zone ni des frais.
- `GET` ou `HEAD /api/health` vérifie seulement que l’application répond. Ce
  contrôle ne teste ni PostgreSQL ni GeoAdmin.

## 2. Environnements et secrets

Créer des environnements distincts pour le développement, la prévisualisation
et la production. Ne pas réutiliser la base ni les secrets de production dans
les previews.

| Variable | Production | Rôle |
| --- | --- | --- |
| `SITE_URL` | requise et en HTTPS | origine canonique, sitemap et aperçus sociaux |
| `DATABASE_URL` | requise pour statistiques/avis | connexion PostgreSQL côté serveur |
| `STATS_USER` | requise pour ouvrir l’administration | identifiant HTTP Basic privé |
| `STATS_PASSWORD` | requise pour ouvrir l’administration | secret de 12 à 256 caractères ; 20+ caractères aléatoires recommandés |
| `VERCEL_PROJECT_PRODUCTION_URL` | fournie par Vercel | repli de build ; ne remplace pas une vérification de `SITE_URL` |

Règles obligatoires :

- stocker `DATABASE_URL` et `STATS_PASSWORD` dans le gestionnaire de secrets
  de la plateforme, jamais dans Git, un ticket, une capture ou un log ;
- ne jamais préfixer un secret par `NEXT_PUBLIC_` ;
- limiter les variables de production à l’environnement Production ;
- faire tourner `STATS_PASSWORD` après un partage accidentel, un départ ou un
  doute, puis tester l’ancien et le nouveau secret ;
- conserver le placeholder volontairement invalide de `.env.example` ; il
  empêche l’ouverture accidentelle de l’administration.

Le build de production doit échouer si aucune URL publique exploitable n’est
résolue. Vérifier explicitement l’URL canonique après chaque changement de
domaine.

## 3. PostgreSQL, schéma et migrations

Utiliser deux rôles lorsque le fournisseur le permet :

1. un rôle de migration, temporaire et autorisé à modifier le schéma ;
2. un rôle d’application avec uniquement les droits nécessaires.

Pour une base neuve :

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/schema.sql
```

Pour une ancienne base Dega Food qui possède déjà les tables, appliquer dans
l’ordre la migration versionnée :

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
  -f db/migrations/20260807_customer_review_admin.sql
```

Avant toute migration de production :

- prendre une sauvegarde vérifiée ;
- appliquer la migration sur une copie ou la base de preview ;
- contrôler les contraintes et index créés ;
- conserver la sortie de migration dans un journal d’exploitation sans URL de
  connexion ;
- déployer l’application seulement après succès.

Le rôle d’application a besoin de `SELECT`, `INSERT`, `UPDATE` et `DELETE` sur
`whatsapp_handoff_daily`, de `SELECT`, `INSERT` et `UPDATE` sur
`customer_reviews`, et de `USAGE` sur `customer_reviews_id_seq`. Le droit
`DELETE` sur les statistiques sert à la rétention automatique de 730 jours.
Les témoignages sont supprimés de façon douce ; leur purge définitive doit
faire l’objet d’une politique validée avant d’être automatisée.

## 4. Contrôles avant déploiement

La branche à publier doit passer la CI :

```bash
npm ci
npm run lint
npm test
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/dega_test \
  ALLOW_DESTRUCTIVE_DB_TESTS=true npm run test:db
npx playwright install chromium
npm run test:e2e
npm run typecheck
npm audit --audit-level=high
SITE_URL=https://build.dega-food.invalid npm run build
```

Quand un serveur de développement du même projet tourne déjà, lancer les E2E
avec `PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e`. Sans cette
variable, Playwright démarre son propre serveur isolé sur le port 3100.

Ne pas contourner un contrôle en échec. Un échec réseau de `npm audit` n’est
pas un résultat d’audit : relancer lorsque le registre est accessible.

La CI GitHub utilise Node.js 24, démarre un PostgreSQL jetable nommé `dega_ci`,
valide le schéma et la migration, installe Chromium, exécute les parcours E2E,
puis produit un build de production. `test:db` est destructif par conception :
il exige `ALLOW_DESTRUCTIVE_DB_TESTS=true` et refuse une base dont le nom ne se
termine pas par `_ci` ou `_test`. Ne jamais lui fournir `DATABASE_URL` de
production. Les actions GitHub utilisent actuellement des tags majeurs ; leur
épinglage par SHA reste une mesure de durcissement à planifier (voir l’audit
sécurité).

## 5. Déploiement Vercel

1. Importer le dépôt en gardant sa racine (`package.json` à la racine).
2. Choisir Node.js 24.
3. Renseigner les variables par environnement et vérifier qu’aucun secret
   n’est exposé au navigateur.
4. Créer ou migrer PostgreSQL avec le rôle de migration.
5. Déployer une preview et exécuter les contrôles fonctionnels ci-dessous.
6. Configurer et tester les règles WAF avant la mise en production.
7. Promouvoir le déploiement validé, puis refaire les contrôles publics.
8. Noter l’identifiant du déploiement, la migration appliquée et l’heure.

`.vercelignore` retire du paquet de déploiement les archives photo, la
documentation, les tests, la CI et les scripts SQL. Ces fichiers restent dans
le dépôt Git et sont donc disponibles pendant la CI ou une intervention ; ils
ne sont pas nécessaires au runtime Next.js.

## 6. WAF et limitation distribuée

Le dépôt n’implémente pas de compteur distribué. Ces règles doivent être
créées dans Vercel Firewall, ou dans le reverse proxy équivalent. Commencer en
mode journalisation, observer les usages réels, exclure les robots de
supervision connus, puis passer en challenge ou blocage. Les valeurs suivantes
sont des points de départ, pas des limites déjà actives :

| Cible | Méthode | Point de départ par IP | Risque couvert |
| --- | --- | ---: | --- |
| `/api/address-suggestions` | `POST` | 60/minute | rafales GeoAdmin et coût serveur |
| `/api/delivery-zone` | `POST` | 30/minute | appels GeoAdmin et calcul de zone |
| `/carte` | `POST` | 20/minute | Server Action de commande et écritures agrégées |
| `/api/review-avatars/:path*` | `GET` | 120/minute | énumération et lectures PostgreSQL répétées |
| `/statistiques/:path*` hors avatars | toutes | 10/minute | essais d’authentification et actions privées |
| `/statistiques/avis/avatar/:path*` | `GET` | 120/minute | chargement normal de la liste administrateur |

Pour `/statistiques`, journaliser le statut `401` sans journaliser l’en-tête
`Authorization`. Une hausse de `admin_auth_denied` doit déclencher une revue,
puis un blocage ou challenge plus strict. Les deux API GeoAdmin contrôlent déjà
le type de contenu et limitent le JSON à 8 Kio ; la limite des Server Actions
est de 1 Mio. Le WAF reste nécessaire contre le volume distribué.

Si le site est auto-hébergé, placer un reverse proxy devant Next.js et y
configurer les mêmes limites, les délais de lecture, la taille des requêtes et
la protection contre les connexions lentes.

## 7. Santé, logs et alertes

Configurer un moniteur externe sur `GET /api/health` toutes les 1 à 5 minutes.
La réponse attendue est `200`, `{"status":"ok"}`, `Cache-Control: no-store`
et un `X-Request-Id`. Alerter après plusieurs échecs consécutifs plutôt qu’au
premier incident réseau.

Les logs serveur sont structurés en JSON et limités à une liste de champs sans
adresse, corps de formulaire, cookie, secret ou en-tête d’authentification. Les
événements utiles sont notamment :

- `next_request_failed` ;
- `geoadmin_suggestions_failed` et `geoadmin_delivery_failed` ;
- `customer_reviews_database_failed` et
  `order_statistics_database_failed` ;
- `review_avatar_database_failed` ;
- `admin_auth_unconfigured` et `admin_auth_denied`.

Les messages visibles peuvent inclure une référence courte. Chercher cette
référence dans les logs via le `requestId` correspondant ; ne jamais remplacer
ce mécanisme par l’affichage d’une pile d’erreur au visiteur.

Configurer au minimum des alertes sur : taux de `5xx`, santé indisponible,
latence élevée, erreurs PostgreSQL répétées, erreurs GeoAdmin durables et
rafales d’échecs d’authentification. Les seuils doivent être définis après une
période d’observation ; aucune alerte externe n’est créée par ce dépôt.

## 8. Sauvegarde, restauration et rétention

Avant l’ouverture publique, choisir et consigner un objectif de perte de
données (RPO) et de rétablissement (RTO). Activer les sauvegardes automatiques
du fournisseur PostgreSQL, vérifier leur rétention et chiffrage, puis réaliser
un test de restauration. Ne pas considérer une option affichée dans un tableau
de bord comme validée tant qu’une restauration n’a pas abouti.

Procédure sûre :

1. créer une sauvegarde cohérente via le fournisseur ou `pg_dump` au format
   personnalisé ;
2. restaurer d’abord dans une base de récupération vide, jamais par-dessus la
   production pendant un test ;
3. appliquer les contrôles de schéma, compter les lignes et ouvrir
   `/statistiques/avis` sur une preview reliée à cette base ;
4. documenter la durée et le résultat ;
5. supprimer la copie de récupération conformément à la politique interne.

Les compteurs de passages sont supprimés automatiquement au-delà de 730 jours.
Le site ne stocke pas la rue, le panier, le message WhatsApp, le téléphone ou
l’adresse IP dans cette table. Les témoignages, avatars et suppressions douces
n’ont pas encore de durée de purge automatique : fixer une durée justifiée,
traiter les demandes de suppression et aligner la rétention des sauvegardes.

## 9. Contrôles fonctionnels après déploiement

Effectuer en preview, puis en production sans créer de fausse commande :

- `/`, `/presentation`, `/carte`, `/evenements`, `/avis`, `/contact`, pages
  légales et une URL inexistante ;
- navigation mobile, clavier, menu, panier et fermeture des fenêtres modales ;
- affichage du numéro principal `076 603 60 11` pour commande/livraison et des
  deux numéros sur la page traiteur ;
- génération du message WhatsApp sans l’envoyer ;
- suggestions d’adresse et cas dans/hors zone ;
- réponse de `/api/health` et présence des en-têtes de sécurité ;
- `/statistiques` sans identifiants (`401` si configuré, `503` sinon), avec
  mauvais identifiants (`401`) et avec les bons identifiants (`200`) ;
- consultation d’un avatar public visible et refus d’un identifiant invalide ;
- absence de secret ou détail technique dans le HTML et les réponses d’erreur.

La création, modification et suppression d’un témoignage doivent être testées
en preview. En production, préférer un témoignage réel masqué temporairement,
puis le supprimer selon la procédure métier, afin d’éviter de publier du faux
contenu.

## 10. Retour arrière et incident

Pour un défaut applicatif sans corruption de données :

1. arrêter la promotion de nouveaux déploiements ;
2. repasser au dernier déploiement Vercel connu comme sain ;
3. vérifier `/api/health` et les parcours critiques ;
4. conserver les références d’erreur et l’intervalle de l’incident.

Les migrations actuelles sont additives, mais un retour de code n’autorise pas
à annuler automatiquement le schéma. Si les données sont affectées, couper les
écritures concernées, restaurer la sauvegarde dans une base séparée, valider
cette copie, puis basculer `DATABASE_URL` selon la procédure du fournisseur.
Ne jamais lancer une restauration destructive directement sur la production
sans sauvegarde, validation et décision explicite.

Après l’incident : faire tourner les secrets potentiellement exposés, vérifier
les règles WAF, consigner cause/impact/correction et ajouter un test de
non-régression.

## 11. Limites connues avant ouverture publique

- L’authentification administrateur est un HTTP Basic partagé, sans MFA ni
  comptes nominatifs.
- Les limites distribuées et alertes doivent être configurées sur
  l’infrastructure ; elles ne sont pas prouvées par le dépôt.
- Les identifiants d’avatars publics sont numériques et prévisibles.
- La CSP publique autorise les scripts inline nécessaires au rendu statique de
  Next.js ; l’administration utilise une CSP avec nonce.
- La purge définitive des témoignages supprimés reste à définir.
- `/api/health` est un contrôle de vie, pas un contrôle de disponibilité de la
  base ni de GeoAdmin.
- La dépendance à GeoAdmin peut rendre la vérification d’adresse indisponible ;
  les délais d’attente et le mode d’erreur évitent toutefois une validation
  incorrecte.

Le détail, les preuves et les mesures compensatoires sont dans
[`internal/SECURITY_AUDIT.md`](internal/SECURITY_AUDIT.md).
