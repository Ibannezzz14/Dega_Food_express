# Dega Food Express

Projet Next.js prêt pour un déploiement sur Vercel.

## Installation

```bash
npm ci
npm run dev
```

## Variables d’environnement

Copier `.env.example` vers `.env.local` pour le développement. Sur Vercel,
configurer `SITE_URL`, `DATABASE_URL`, `STATS_USER` et `STATS_PASSWORD` dans les
variables du projet. Ne jamais publier `.env.local`.

## Base de données

- Nouvelle base : appliquer `db/schema.sql`.
- Base existante : appliquer
  `db/migrations/20260807_customer_review_admin.sql`.

Sans `DATABASE_URL`, la carte et les demandes WhatsApp restent accessibles,
mais les statistiques et la gestion des témoignages sont indisponibles.

## Production

```bash
SITE_URL=https://votre-domaine.ch npm run build
npm start
```
