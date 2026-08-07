# Dega Food Express

Site de présentation et de commande construit avec Next.js, React, TypeScript
et CSS Modules.

## Pages

- `/` : accueil et accès à la commande
- `/presentation` : présentation et galerie
- `/carte` : carte interactive et préparation de la commande
- `/evenements` : service traiteur avec demande de devis
- `/avis` : témoignages Instagram administrés
- `/contact` : contacts distincts pour les commandes, le traiteur et Instagram
- `/confidentialite` et `/conditions` : informations légales publiques
- `/statistiques` : tableau de bord privé des demandes géographiques
- `/statistiques/avis` : gestion privée des témoignages

Le parcours de commande :

- calcule automatiquement le total et les frais dans la zone habituelle ;
- offre la livraison lorsque le sous-total dépasse 150 CHF dans cette zone ;
- propose des adresses, NPA ou localités suisses et synchronise les trois champs ;
- vérifie en interne la zone de livraison à partir de l’adresse ;
- laisse envoyer une demande hors de la zone habituelle sans inventer de frais
  ni de total final ;
- dirige toutes les commandes vers le numéro WhatsApp principal
  `076 603 60 11` ;
- conserve le panier pendant la navigation interne, sans conserver l’adresse ;
- comptabilise de façon agrégée les passages validés vers WhatsApp.

La livraison couvre Lausanne, Lucens, les communes environnantes et les
localités situées entre les deux secteurs. Toutes les demandes passent par le
même prestataire et le même numéro, `076 603 60 11`. Une adresse suisse hors
de la zone habituelle reste envoyable : la faisabilité et les frais sont alors
confirmés directement, sans montant calculé automatiquement.

Le service traiteur est disponible dans toute la Suisse. Le formulaire de
devis accepte librement le lieu de l’événement et ouvre WhatsApp vers le
`078 265 40 81`. Les deux numéros restent affichés à la fin de la page traiteur,
sans les limiter à une région linguistique. Le devis tient compte du lieu, du
nombre de personnes, du transport, du matériel, du personnel et des autres
contraintes logistiques. Aucun supplément n’est inventé par le site.

Le site ne peut pas confirmer qu’un message a ensuite été envoyé dans WhatsApp.
Les statistiques mesurent donc des passages vers WhatsApp, pas des commandes
confirmées. Le mode de paiement est choisi dans le parcours de commande et le
règlement s’effectue à la livraison, en espèces ou par TWINT. Aucun numéro de
paiement séparé n’est affiché sur le site.

La page d’accueil comporte un aperçu des témoignages et la page `/avis` les
rassemble. Aucun visiteur ne peut publier directement un avis sur le site. Les
témoignages reçus sur Instagram sont gérés uniquement dans l’espace privé
`/statistiques/avis`.

Les visuels culinaires vérifiés sont optimisés localement en WebP. Les preuves
de provenance, les licences et les décisions d’audit sont conservées dans les
documents internes du projet source ; elles ne sont pas affichées aux clients.

## Modifier le contenu

Les informations commerciales principales sont centralisées pour éviter les
contradictions :

- contacts, zone de livraison, zone traiteur, Instagram, identité et fonds
  visuels dans
  `config/site-config.ts` ;
- plats, prix et images dans `data/menu.ts` ;
- témoignages vérifiés dans l’espace privé `/statistiques/avis` ;
- textes des pages dans `app/` et des sections réutilisables dans `components/`.

Le guide détaillé et l’arborescence du projet sont dans
[`docs/MODIFIER-LE-SITE.md`](docs/MODIFIER-LE-SITE.md).

Les nouvelles photos peuvent être déposées par catégorie dans
`PHOTOS-DEGA-FOOD-A-INTEGRER/A-INTEGRER/`. Les images publiées restent dans
`public/images/` et les originaux dans `assets/source-images/`, afin d’éviter
les copies dispersées.

## Confidentialité des statistiques

PostgreSQL conserve uniquement des compteurs journaliers regroupés par zone,
mode de remise, NPA et localité. L’application ne conserve jamais dans cette
base la rue, le complément d’adresse, le panier, le message WhatsApp, le numéro
du client ou son adresse IP. Une localité n’est affichée qu’à partir de cinq
passages agrégés sur la période. Ce seuil réduit l’exposition des faibles
volumes, sans prétendre identifier des visiteurs uniques. Les agrégats datant
de plus de 730 jours sont supprimés automatiquement lors d’un nouveau passage.

## Lancer le projet

Prérequis : Node.js 24 et npm. PostgreSQL est facultatif pour consulter le site,
mais nécessaire pour les statistiques et l’administration des témoignages.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Variables disponibles dans `.env.local` :

```dotenv
SITE_URL=http://localhost:3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
STATS_USER=dega
STATS_PASSWORD=un-mot-de-passe-long-et-unique
```

`SITE_URL` sert aux liens canoniques, au sitemap et aux aperçus sociaux. Le
build de production échoue volontairement si aucune adresse publique HTTPS
n’est disponible via `SITE_URL` ou `VERCEL_PROJECT_PRODUCTION_URL`. Le mot de
passe du tableau de bord doit contenir entre 12 et 256 caractères.

Le schéma PostgreSQL est fourni dans `db/schema.sql` et doit être appliqué une
fois avec un compte de migration :

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

Pour une base créée avec l’ancienne version du site, appliquer également la
migration idempotente :

```bash
psql "$DATABASE_URL" -f db/migrations/20260807_customer_review_admin.sql
```

Le compte utilisé ensuite par l’application a besoin de `SELECT`, `INSERT`,
`UPDATE` et `DELETE` sur `whatsapp_handoff_daily`, ainsi que de `SELECT` et
`INSERT`, `UPDATE` sur `customer_reviews` et de `USAGE` sur la séquence
`customer_reviews_id_seq`. La suppression d’un témoignage depuis
l’administration est douce et reste donc récupérable en base. Le droit
`DELETE` reste nécessaire uniquement pour la rétention automatique des
statistiques de plus de 730 jours. Aucune création ou modification de table
n’est exécutée pendant les requêtes.

Sans `DATABASE_URL`, le parcours WhatsApp continue de fonctionner, mais les
statistiques et les témoignages administrés sont indisponibles. Sans
identifiants privés valides, `/statistiques` et `/statistiques/avis` restent
fermés.

Ouvrir ensuite [http://localhost:3000](http://localhost:3000).

## Vérifications

```bash
npm run lint
npm test
npm run typecheck
SITE_URL=https://build.dega-food.invalid npm run build
npm audit --audit-level=high
```

La même suite est lancée automatiquement par
`.github/workflows/ci.yml` à chaque push sur `main` et pour chaque pull request.

## Publier sur GitHub

Le dossier contient plus de 100 fichiers : ne le glissez pas entièrement dans
l’interface web de GitHub, qui limite chaque envoi à 100 fichiers. Utilisez Git
avec les commandes ci-dessous, ou GitHub Desktop. Initialisez bien le dépôt
depuis ce dossier afin que `package.json`, `app/` et `public/` restent à la
racine du dépôt.

Créer un dépôt GitHub vide, puis exécuter depuis ce dossier :

```bash
git init -b main
git add .
git commit -m "Initialisation du site Dega Food Express"
git remote add origin https://github.com/VOTRE-COMPTE/VOTRE-DEPOT.git
git push -u origin main
```

Les dépendances, builds, caches et fichiers `.env*` privés sont ignorés.
`.env.example` ne contient aucun secret et reste versionné.

## Mettre le site en ligne

Ce projet utilise des fonctions serveur Next.js, PostgreSQL et des routes API.
Il ne doit donc pas être publié avec GitHub Pages.

Pour le déployer sur Vercel :

1. importer le dépôt GitHub dans Vercel ;
2. connecter un fournisseur PostgreSQL depuis le
   [Marketplace Vercel](https://vercel.com/marketplace?category=storage) ;
3. vérifier que `DATABASE_URL` est disponible dans le projet ;
4. ajouter `STATS_USER` et un `STATS_PASSWORD` unique d’au moins 12 caractères ;
5. ajouter `SITE_URL` avec l’URL HTTPS définitive du site ;
6. choisir Node.js 24 dans les réglages du projet ;
7. configurer puis vérifier les règles de limitation Vercel Firewall
   ci-dessous ;
8. appliquer le schéma ou la migration PostgreSQL ;
9. lancer le déploiement puis ouvrir `/statistiques` en HTTPS.

La limitation distribuée doit être appliquée au niveau Vercel, car un compteur
en mémoire dans une fonction serveur ne serait pas fiable. Point de départ
recommandé, par adresse IP et avec une fenêtre fixe de 60 secondes :

- `/api/address-suggestions` : 60 requêtes ;
- `/api/delivery-zone` : 30 requêtes ;
- `/statistiques/:path*` : 10 requêtes, afin de couvrir le tableau de bord,
  l’administration des avis et les essais d’authentification.

Commencez en mode journalisation, vérifiez les usages réels, puis activez le
blocage ou le challenge avant l’ouverture publique. Les deux API refusent déjà
les types de contenu inattendus, les corps JSON invalides et ceux de plus de
8 Kio.

## Données externes

Les propositions d’adresses et la vérification géographique utilisent le
service officiel GeoAdmin de swisstopo. Cette transmission est indiquée
directement à côté des champs d’adresse. La saisie nécessaire à ces fonctions
est envoyée au service, mais elle n’est ni enregistrée ni conservée par
l’application.
