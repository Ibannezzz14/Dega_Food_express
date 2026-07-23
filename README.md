# Dega Food Express

Site de présentation et de commande construit avec Next.js, React, TypeScript
et CSS Modules.

## Pages

- `/` : accueil et accès à la commande
- `/presentation` : présentation et galerie
- `/carte` : carte interactive et préparation de la commande
- `/evenements` : service traiteur avec demande de devis
- `/contact` : téléphone, WhatsApp, Instagram et formulaire de contact
- `/statistiques` : tableau de bord privé des demandes géographiques

Le parcours de commande :

- calcule automatiquement le total et les frais de livraison ;
- offre la livraison lorsque le sous-total dépasse 150 CHF ;
- propose des adresses, NPA ou localités suisses et synchronise les trois champs ;
- vérifie en interne la zone de livraison à partir de l’adresse ;
- dirige la demande vers le bon numéro WhatsApp ;
- conserve le panier pendant la navigation interne, sans conserver l’adresse ;
- comptabilise de façon agrégée les passages validés vers WhatsApp.

Le site ne peut pas confirmer qu’un message a ensuite été envoyé dans WhatsApp.
Les statistiques mesurent donc des passages vers WhatsApp, pas des commandes
confirmées.

Les visuels culinaires vérifiés sont optimisés localement en WebP. Les preuves
de provenance, les licences et les décisions d’audit sont conservées dans les
documents internes du projet source ; elles ne sont pas affichées aux clients.

## Confidentialité des statistiques

PostgreSQL conserve uniquement des compteurs journaliers regroupés par zone,
mode de remise, NPA et localité. L’application ne conserve jamais dans cette
base la rue, le complément d’adresse, le panier, le message WhatsApp, le numéro
du client ou son adresse IP. Les localités ayant une seule demande sur la
période ne sont pas affichées dans le tableau de bord. Les agrégats datant de
plus de 730 jours sont supprimés automatiquement lors d’un nouveau passage.

## Lancer le projet

Prérequis : Node.js 24 et npm. PostgreSQL est facultatif pour le site public,
mais nécessaire pour activer les statistiques.

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

`SITE_URL` sert aux liens canoniques, au sitemap et aux aperçus sociaux. En
production, indiquez l’adresse publique en HTTPS. Le mot de passe du tableau de
bord doit contenir au moins 12 caractères.

Le schéma PostgreSQL est fourni dans `db/schema.sql` et doit être appliqué une
fois avec un compte de migration :

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

Le compte utilisé ensuite par l’application n’a besoin que des droits de
lecture et d’écriture sur `whatsapp_handoff_daily`. Aucune création ou
modification de table n’est exécutée pendant les requêtes.

Sans `DATABASE_URL`, le parcours WhatsApp continue de fonctionner mais aucune
statistique n’est enregistrée. Sans identifiants statistiques valides,
`/statistiques` reste fermé.

Ouvrir ensuite [http://localhost:3000](http://localhost:3000).

## Vérifications

```bash
npm run lint
npm test
npm run typecheck
npm run build
npm audit --audit-level=high
```

La même suite est lancée automatiquement par
`.github/workflows/ci.yml` à chaque push sur `main` et pour chaque pull request.

## Publier sur GitHub

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
4. appliquer `db/schema.sql` une fois dans la console SQL du fournisseur ;
5. ajouter `STATS_USER` et un `STATS_PASSWORD` unique d’au moins 12 caractères ;
6. ajouter `SITE_URL` avec l’URL HTTPS définitive du site ;
7. choisir Node.js 24 dans les réglages du projet ;
8. lancer le déploiement puis ouvrir `/statistiques` en HTTPS.

Pour limiter les appels automatisés, configurez aussi des règles Vercel
Firewall sur `/api/address-suggestions`, `/api/delivery-zone` et
`/statistiques`. Commencez en mode journalisation avant d’activer un blocage ou
un challenge. Les deux API refusent déjà les corps JSON invalides et ceux de
plus de 8 Kio.

## Données externes

Les propositions d’adresses et la vérification géographique utilisent le
service officiel GeoAdmin de swisstopo. La saisie nécessaire à ces fonctions
est envoyée au service, mais elle n’est ni enregistrée ni conservée par
l’application.
