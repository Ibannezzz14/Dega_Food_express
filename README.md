# Dega Food Express

Version de déploiement du site Next.js.

## Installation

```bash
npm ci
cp .env.example .env.local
npm run dev
```

## Variables nécessaires

- `SITE_URL` : adresse HTTPS publique du site ;
- `DATABASE_URL` : connexion PostgreSQL pour les statistiques et témoignages ;
- `STATS_USER` et `STATS_PASSWORD` : accès à l’administration privée.

Le site public et les commandes WhatsApp restent accessibles sans base de
données, mais l’administration et les témoignages nécessitent PostgreSQL.

## Base de données

Pour une nouvelle base :

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

Pour une ancienne base :

```bash
psql "$DATABASE_URL" -f db/migrations/20260807_customer_review_admin.sql
```

## Déploiement

Ce projet utilise des fonctions serveur et doit être déployé sur Vercel ou un
hébergement compatible avec Next.js, pas sur GitHub Pages. Utiliser Node.js 24.

```bash
npm run typecheck
SITE_URL=https://votre-domaine.example npm run build
```
