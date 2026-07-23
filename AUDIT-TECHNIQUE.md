# Audit technique — Dega Food

**Date :** 23 juillet 2026  
**Périmètre :** application Next.js, interface publique, parcours de commande, APIs internes, statistiques, configuration PostgreSQL et préparation Vercel.

## Synthèse

L’application a été auditée puis corrigée sur les axes UX, accessibilité, sécurité, performance, SEO et maintenabilité. Les contrôles automatisés finaux sont réussis. Aucun déploiement et aucun envoi WhatsApp réel n’ont été effectués pendant l’audit.

## Problèmes initiaux et corrections

### UX et accessibilité

- Le panier fixe pouvait sortir de l’écran sur mobile à cause d’un conteneur animé conservant une transformation CSS. L’animation se termine désormais sans transformation persistante.
- Plusieurs actions, libellés et mises en page étaient trop serrés sur petits écrans. Les zones tactiles, textes courts et points de rupture ont été ajustés.
- La navigation clavier manquait de continuité lors de l’ouverture du menu, d’une erreur de formulaire ou d’un changement de quantité. La gestion de `Escape`, la restitution du focus et le ciblage des champs invalides ont été ajoutés.
- Des annonces `aria-live` trop larges, des états de formulaire incomplets et des contrastes insuffisants ont été corrigés.
- Les états de vérification et de validation de la zone de livraison sont maintenant perceptibles sans dépendre uniquement de la couleur.

### Sécurité et confidentialité

- Les deux APIs de vérification d’adresse acceptaient insuffisamment les formes de corps reçues. Elles refusent désormais les JSON invalides, `null`, tableaux et primitives en HTTP 400.
- Les corps JSON sont limités à 8 Kio, y compris pour un flux sans en-tête `Content-Length` ; un dépassement renvoie HTTP 413.
- Les réponses liées aux adresses utilisent `Cache-Control: no-store` afin d’éviter la conservation d’adresses postales complètes.
- La lecture de `STATS_USER` et `STATS_PASSWORD` est confinée à un module protégé par `server-only`. Le parseur d’authentification pur reste séparé et testable.
- Toute création ou modification de schéma PostgreSQL a été retirée du runtime. La migration explicite reste dans `db/schema.sql`.
- Des en-têtes de sécurité ont été ajoutés. La CSP est volontairement minimale : elle bloque notamment l’intégration en iframe, les objets et les URI de base non autorisées, sans imposer une politique de scripts susceptible de casser le runtime Next.js sans stratégie de nonce dédiée.

### Performance

- La page d’accueil n’hydrate plus l’ensemble du parcours de commande : un îlot client plus léger est utilisé pour le choix initial.
- Les images sont locales, optimisées et servies dans des formats adaptés au web.
- Les appels contenant une adresse utilisent une politique sans cache afin de privilégier la confidentialité.
- Les composants et états clients inutiles sur les pages statiques ont été réduits.

### SEO

- Les métadonnées, URL canoniques, données Open Graph et Twitter ont été structurées.
- `robots.txt`, le sitemap et les pages d’erreur dédiées ont été ajoutés.
- La page privée de statistiques est exclue de l’indexation.
- Les anciennes URL du site statique sont redirigées vers leurs pages Next.js correspondantes.

### Maintenabilité

- Le script ESLint et sa configuration Next.js/TypeScript ont été ajoutés.
- L’ancien site statique et les fichiers devenus inutiles ont été retirés du périmètre publié.
- Les responsabilités ont été mieux séparées : accueil, parcours de commande, lecture JSON bornée, authentification pure et accès aux secrets serveur.
- Les migrations de données sont désormais explicites et indépendantes du démarrage de l’application.
- Des tests ciblés couvrent notamment les adresses, frais de livraison, statistiques, authentification et corps JSON.

## Validations finales

- **ESLint :** réussi, 0 avertissement.
- **Tests automatisés :** 26/26 réussis.
- **TypeScript :** vérification réussie.
- **Build :** réussi avec Next.js 16.2.11 sous Node.js 24.
- **Dépendances :** `npm audit` réussi, 0 vulnérabilité connue.
- **Accessibilité automatisée :** axe-core 4.12.1 ne relève aucune violation WCAG A/AA sur les cinq pages publiques contrôlées en 320 px et 1 440 px.
- **Responsive :** contrôles réels en 320, 390, 430, 768, 1 024, 1 280 et 1 440 px, sans débordement horizontal, image cassée, identifiant dupliqué ou niveau de titre incohérent.
- **Navigation :** conservation du panier entre pages, fermeture du menu au clavier et au passage desktop, focus après erreur ou suppression d’un article vérifiés.
- **Parcours livraison :** autocomplétion, validation de l’adresse, sélection interne du numéro, frais de 7.90 CHF et gratuité au-delà de 150 CHF vérifiés.
- **Production locale :** pages publiques en HTTP 200, page inconnue en 404, statistiques non configurées en 503, anciennes URL en 308 et en-têtes de sécurité présents.
- **Images :** 23 fichiers WebP locaux, 1.61 Mio au total, sans dépendance à une URL externe au chargement.

## Principaux fichiers concernés

- Interface et responsive : `app/globals.css`, `app/site-header.tsx`, `app/site-header.module.css`, `app/order-experience.tsx`, `app/order-experience.module.css`.
- Navigation et état de commande : `app/order-session.tsx`, `app/home-hero.tsx`, `app/carte/carte-content.tsx`.
- Accessibilité et pages : `app/presentation/`, `app/evenements/`, `app/statistiques/`, `app/site-footer.tsx`.
- Sécurité et APIs : `next.config.ts`, `proxy.ts`, `lib/read-json-object.ts`, `lib/stats-auth.ts`, `app/api/`.
- Données et base : `data/`, `lib/order-statistics.ts`, `db/schema.sql`.
- SEO et erreurs : `app/layout.tsx`, `lib/page-metadata.ts`, `lib/site-url.ts`, `app/robots.ts`, `app/sitemap.ts`, `app/not-found.tsx`, `app/error.tsx`.
- Qualité et publication : `eslint.config.mjs`, `.github/workflows/ci.yml`, `.gitignore`, `.nvmrc`, `README.md`.

## Actions manuelles avant et après déploiement Vercel

1. Configurer les variables d’environnement Vercel :
   - `SITE_URL` : URL HTTPS définitive du site, sans chemin.
   - `DATABASE_URL` : chaîne de connexion PostgreSQL de production.
   - `STATS_USER` : identifiant privé du tableau de statistiques.
   - `STATS_PASSWORD` : mot de passe long, unique et conservé dans Vercel.
2. Exécuter une seule fois `db/schema.sql` sur la base PostgreSQL de production avant d’utiliser les statistiques.
3. Configurer Vercel Firewall et des règles de limitation de débit pour les APIs d’adresse et de zone de livraison.
4. Associer le domaine définitif, vérifier ses DNS et faire correspondre `SITE_URL` à ce domaine.
5. Tester sur le site déployé le parcours complet de retrait et de livraison, l’adresse suggérée, le calcul des frais et l’ouverture de WhatsApp.
6. Effectuer un envoi WhatsApp réel contrôlé vers chaque numéro prévu, puis vérifier le contenu de la commande avec les responsables.
7. Vérifier l’accès privé aux statistiques avec les identifiants de production et confirmer l’enregistrement d’un passage vers WhatsApp.

## Limites de l’audit

- Aucun déploiement Vercel n’a été réalisé.
- Aucun message ni commande WhatsApp réel n’a été envoyé.
- Les règles Firewall et de limitation de débit dépendent du compte Vercel et doivent être configurées après publication.
- Les variables et la base de production n’ont pas été renseignées ou modifiées pendant l’audit.
