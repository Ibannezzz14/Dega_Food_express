# Dega Food Express

Site de présentation et de commande construit avec Next.js, React, TypeScript
et CSS Modules.

## Pages

- `/` : accueil et accès à la commande
- `/presentation` : présentation et galerie
- `/carte` : carte interactive et préparation de la commande
- `/evenements` : service traiteur avec demande de devis
- `/statistiques` : tableau de bord privé des demandes géographiques

Le parcours de commande :

- calcule automatiquement le total et les frais de livraison ;
- offre la livraison lorsque le sous-total dépasse 150 CHF ;
- propose des adresses, NPA ou localités suisses et synchronise les trois champs ;
- vérifie en interne la zone de livraison à partir de l’adresse ;
- dirige la demande vers le bon numéro WhatsApp ;
- comptabilise de façon agrégée les passages validés vers WhatsApp.

Le site ne peut pas confirmer qu’un message a ensuite été envoyé dans WhatsApp.
Les statistiques mesurent donc des passages vers WhatsApp, pas des commandes
confirmées.

## Confidentialité des statistiques

PostgreSQL conserve uniquement des compteurs journaliers regroupés par zone,
mode de remise, NPA et localité. L’application ne conserve jamais dans cette
base la rue, le complément d’adresse, le panier, le message WhatsApp, le numéro
du client ou son adresse IP. Les localités ayant une seule demande sur la
période ne sont pas affichées dans le tableau de bord. Les agrégats datant de
plus de 730 jours sont supprimés automatiquement lors d’un nouveau passage.

## Lancer le projet

Prérequis : Node.js 22, npm et une base PostgreSQL pour activer les statistiques.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Renseigner dans `.env.local` :

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
STATS_USER=dega
STATS_PASSWORD=un-mot-de-passe-long-et-unique
```

Le mot de passe du tableau de bord doit contenir au moins 12 caractères. Le
schéma PostgreSQL est fourni dans `db/schema.sql`. L’application sait aussi le
créer automatiquement en solution de secours.

Sans `DATABASE_URL`, le parcours WhatsApp continue de fonctionner mais aucune
statistique n’est enregistrée. Sans identifiants statistiques valides,
`/statistiques` reste fermé.

Ouvrir ensuite [http://localhost:3000](http://localhost:3000).

## Vérifications

```bash
npm test
npm run typecheck
npm run build
```

## Publier sur GitHub

Créer un dépôt GitHub vide, puis exécuter depuis ce dossier :

```bash
git init -b main
git add .
git commit -m "Initialisation du site Dega Food Express"
git remote add origin https://github.com/VOTRE-COMPTE/VOTRE-DEPOT.git
git push -u origin main
```

Les fichiers `.env*` privés sont ignorés. `.env.example` ne contient aucun
secret et reste versionné.

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
6. lancer le déploiement puis ouvrir `/statistiques` en HTTPS.

## Données externes

Les propositions d’adresses et la vérification géographique utilisent le
service officiel GeoAdmin de swisstopo. La saisie nécessaire à ces fonctions
est envoyée au service, mais elle n’est ni enregistrée ni conservée par
l’application.
