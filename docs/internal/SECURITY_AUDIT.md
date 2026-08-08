# Audit de sécurité — Dega Food Express

Date de revue : 8 août 2026  
Périmètre : code Next.js/React/TypeScript, routes serveur, Server Actions,
configuration Next.js, schéma PostgreSQL, dépendances et CI du dossier de
travail.  
Hors périmètre : configuration réelle Vercel/Firewall/PostgreSQL, DNS, compte
GitHub, historique Git complet, test d’intrusion et analyse dynamique depuis
Internet.

## Synthèse exécutive

Aucune vulnérabilité critique ou élevée confirmée n’a été trouvée dans le
périmètre statique après les correctifs intégrés. Les entrées serveur sont
validées, les requêtes SQL observées sont paramétrées, les fichiers envoyés
sont contrôlés et normalisés, les erreurs publiques sont expurgées et les
pages privées échouent en mode fermé si leurs secrets manquent.

Deux risques moyens doivent être traités avant ou immédiatement après
l’ouverture publique : la limitation distribuée n’est pas prouvée dans
l’infrastructure et l’administration dépend d’un identifiant HTTP Basic
partagé sans MFA. L’énumération des avatars publics reste également un risque
moyen de consommation de ressources. Trois durcissements faibles concernent
la CSP publique, la rétention des témoignages supprimés et l’épinglage des
actions GitHub.

`npm audit --audit-level=high` a retourné zéro vulnérabilité connue lors de la
revue. Ce résultat est ponctuel et ne remplace pas les mises à jour continues.

| ID | Sévérité | État | Sujet |
| --- | --- | --- | --- |
| SEC-001 | Moyenne | Ouvert, infrastructure | Absence de limitation distribuée prouvée |
| SEC-002 | Moyenne | Ouvert | Authentification administrateur partagée sans MFA |
| SEC-003 | Moyenne | Ouvert | Avatars publics énumérables et coûteux en base |
| SEC-004 | Faible | Risque accepté à réévaluer | CSP publique avec `unsafe-inline` |
| SEC-005 | Faible | Ouvert, décision métier | Pas de purge définitive des témoignages supprimés |
| SEC-006 | Faible | Ouvert | Actions GitHub référencées par tags majeurs |

## Constats moyens

### SEC-001 — Limitation distribuée non démontrée

- **Rule ID :** `NEXT-DOS-001`
- **Sévérité :** Moyenne
- **Lieu :** `app/api/address-suggestions/route.ts:56-247`,
  `app/api/delivery-zone/route.ts:35-72`,
  `app/carte/order-actions.ts:62-310`,
  `app/api/review-avatars/[id]/route.ts:18-78`, `proxy.ts:23-84`.
- **Preuve :** les surfaces exposent directement des gestionnaires ou actions,
  par exemple `export async function POST(request: Request)` et
  `export async function prepareWhatsAppOrder(...)`. Aucun limiteur distribué
  n’est appelé dans ces chemins. Le dépôt ne contient pas de configuration
  Vercel Firewall déclarative vérifiable.
- **Impact :** un acteur peut multiplier les appels GeoAdmin, les lectures ou
  écritures PostgreSQL et les essais d’authentification. Cela peut augmenter la
  latence, les coûts et provoquer une indisponibilité partielle.
- **Correctif :** configurer et vérifier les règles WAF décrites dans
  `docs/PRODUCTION.md`, notamment `POST /carte`, les deux API GeoAdmin, les
  avatars et `/statistiques`. Passer de journalisation à challenge/blocage
  après observation et tester les réponses réelles.
- **Mitigation :** les API JSON refusent les types inattendus, limitent le corps
  à 8 Kio (`lib/read-json-object.ts:5-79`) et les appels GeoAdmin expirent après
  4,5 ou 5 secondes. Les Server Actions restent limitées à 1 Mio
  (`next.config.ts:44-48`).
- **Faux positifs :** des règles peuvent déjà exister dans le tableau de bord
  Vercel, un CDN ou un reverse proxy. Elles ne sont pas visibles dans le dépôt ;
  confirmer par export/configuration et par un test contrôlé.

### SEC-002 — HTTP Basic partagé sans MFA ni comptes nominatifs

- **Rule ID :** `AUTH-ASSURANCE-001` (contrôle projet), `NEXT-DOS-001`
- **Sévérité :** Moyenne
- **Lieu :** `proxy.ts:23-84`, `lib/stats-auth.ts:9-20`,
  `lib/stats-auth-core.ts:9-80`,
  `app/statistiques/avis/actions.ts:23-29`.
- **Preuve :** le proxy protège tout `/statistiques/:path*` et renvoie
  `WWW-Authenticate: Basic realm="Dega Food - Administration"`. Les mêmes
  `STATS_USER` et `STATS_PASSWORD` servent à toute l’administration. Les
  actions revérifient l’en-tête `authorization`, mais il n’existe ni second
  facteur ni identité individuelle.
- **Impact :** la compromission du secret donne accès à toutes les statistiques
  et opérations sur les témoignages ; les actions ne sont pas attribuables à
  une personne précise. Sans limitation externe, les essais de mot de passe
  sont répétables.
- **Correctif :** à terme, remplacer HTTP Basic par un fournisseur d’identité
  avec MFA, comptes nominatifs, révocation et journal d’audit. Avant cela,
  utiliser un secret aléatoire d’au moins 20 caractères, imposer HTTPS,
  configurer la limitation WAF, restreindre le nombre de personnes qui le
  connaissent et organiser sa rotation.
- **Mitigation :** l’espace échoue en mode fermé (`503`) si la configuration est
  invalide, le secret doit faire 12 à 256 caractères, la comparaison utilise
  SHA-256 et `timingSafeEqual`, les refus sont journalisés sans en-tête
  d’autorisation, les réponses privées sont `no-store` et l’administration
  reçoit une CSP avec nonce.
- **Faux positifs :** une protection SSO/VPN/Access en amont réduirait le risque,
  mais elle doit être vérifiée dans l’infrastructure. HTTP Basic ne doit jamais
  être considéré sûr sans HTTPS.

### SEC-003 — Identifiants d’avatars prévisibles et lecture PostgreSQL par requête

- **Rule ID :** `GEN-ID-001` (contrôle projet), `NEXT-DOS-001`
- **Sévérité :** Moyenne
- **Lieu :** `db/schema.sql:45-46`,
  `lib/customer-reviews.ts:111-128,151-162`,
  `app/api/review-avatars/[id]/route.ts:18-70`.
- **Preuve :** `customer_reviews.id` est un `bigint GENERATED ALWAYS AS
  IDENTITY`; l’URL publique est `/api/review-avatars/${id}`. Chaque identifiant
  numérique valide déclenche un `SELECT` et la réponse est `private, no-store`.
- **Impact :** un acteur peut parcourir les identifiants, estimer le volume de
  témoignages et provoquer de nombreuses lectures en base. La requête ne
  retourne toutefois que les avatars de témoignages approuvés et visibles ;
  aucune donnée privée confirmée n’est exposée.
- **Correctif :** ajouter un identifiant public aléatoire (UUID ou jeton
  opaque), séparer strictement les routes publique et administrateur, puis
  mettre en cache les seuls avatars publiés ou les placer dans un stockage
  objet avec clé imprévisible. Migrer les URL sans exposer l’identifiant
  interne.
- **Mitigation :** appliquer immédiatement la règle WAF dédiée. Le parseur
  borne les entiers, les ressources absentes ou masquées répondent `404`, le
  type MIME est allowlisté et les nouveaux avatars sont normalisés en WebP
  192 × 192, au plus 512 Kio.
- **Faux positifs :** la prévisibilité n’entraîne pas ici une lecture de
  témoignage masqué grâce au filtre SQL. Si une couche de cache/limitation
  externe est déjà active, le risque de charge est réduit mais doit être testé.

## Constats faibles

### SEC-004 — CSP publique autorisant les scripts inline

- **Rule ID :** `JS-CSP-002`, `REACT-CSP-001`
- **Sévérité :** Faible
- **Lieu :** `lib/content-security-policy.ts:6-41`,
  `next.config.ts:4-10,84-91`, `proxy.ts:23-33`.
- **Preuve :** sans nonce, la fabrique ajoute `scriptSources.push("'unsafe-inline'")`
  pour le bootstrap des pages statiques Next.js. La politique globale utilise
  ce mode ; le proxy privé crée au contraire un nonce par requête.
- **Impact :** si une future vulnérabilité permet d’injecter un script inline,
  cette directive réduit la capacité de la CSP à le bloquer. Aucun chemin
  confirmé de données non fiables vers `dangerouslySetInnerHTML`, `innerHTML`,
  `eval` ou un gestionnaire inline n’a été trouvé pendant la revue.
- **Correctif :** réévaluer un CSP strict par nonce ou hash lors d’un changement
  d’architecture. Mesurer explicitement le coût d’un rendu dynamique avec
  nonce et la compatibilité de la stratégie SRI avec l’outil de build avant de
  modifier le mode de rendu.
- **Mitigation :** conserver `script-src-attr 'none'`, ne jamais autoriser
  `unsafe-eval` en production, maintenir l’échappement JSX et interdire les
  puits HTML non sûrs. La page privée utilise déjà nonce + `strict-dynamic`.
- **Faux positifs :** une CSP différente peut être remplacée à l’edge. Vérifier
  l’en-tête réellement reçu sur une page publique et une page privée. Ce
  constat est un durcissement, pas une XSS exploitable démontrée.

### SEC-005 — Témoignages supprimés conservés sans durée définie

- **Rule ID :** `PRIV-RETENTION-001` (contrôle projet)
- **Sévérité :** Faible
- **Lieu :** `db/schema.sql:45-68`,
  `lib/customer-reviews.ts:553-589`,
  `lib/order-statistics.ts:90-125`.
- **Preuve :** supprimer un témoignage positionne `deleted_at = now()` mais
  aucune requête ne purge ensuite `customer_reviews`. À l’inverse, les agrégats
  de commande suppriment les lignes de plus de 730 jours.
- **Impact :** le prénom, le message et l’avatar d’une personne peuvent rester
  en base et dans les sauvegardes plus longtemps que nécessaire, même s’ils ne
  sont plus affichés.
- **Correctif :** valider une durée avec le responsable métier/juridique,
  ajouter une purge planifiée et testée, traiter les demandes de suppression,
  puis aligner la rétention des sauvegardes. Ne pas automatiser une durée
  arbitraire sans décision.
- **Mitigation :** les suppressions sont immédiatement masquées, les lectures
  publiques filtrent `deleted_at IS NULL` et les données agrégées ont déjà une
  rétention de 730 jours.
- **Faux positifs :** une purge externe ou politique du fournisseur peut
  exister sans être dans le dépôt. Vérifier les tâches planifiées, snapshots et
  procédures de suppression.

### SEC-006 — Actions GitHub non épinglées à un commit

- **Rule ID :** `JS-SUPPLY-001`, `CI-SUPPLY-001` (contrôle projet)
- **Sévérité :** Faible
- **Lieu :** `.github/workflows/ci.yml:19-26`.
- **Preuve :** la CI utilise `actions/checkout@v7` et
  `actions/setup-node@v6`, qui sont des tags majeurs mobiles plutôt que des SHA
  immuables.
- **Impact :** une modification ou compromission du tag amont pourrait changer
  le code exécuté dans la CI sans modification du dépôt.
- **Correctif :** épingler chaque action à un SHA vérifié et ajouter en
  commentaire sa version lisible. Automatiser les mises à jour contrôlées avec
  Dependabot ou Renovate.
- **Mitigation :** le workflow limite `GITHUB_TOKEN` à `contents: read`, utilise
  des actions GitHub officielles, installe via `npm ci`, audite les dépendances
  et ne déploie pas directement.
- **Faux positifs :** une politique GitHub d’organisation peut restreindre les
  actions autorisées ou imposer des versions. Elle ne rend pas le tag immuable ;
  vérifier les règles effectives et les SHA résolus dans les exécutions.

## Contrôles positifs observés

- **En-têtes :** CSP, protection anti-frame, `nosniff`, Referrer Policy,
  Permissions Policy, COOP/CORP et HSTS sont déclarés dans
  `next.config.ts:4-39`. HSTS doit être vérifié uniquement sur le domaine HTTPS
  de production.
- **Autorisation en profondeur :** le proxy protège toutes les routes
  `/statistiques/:path*` et chaque Server Action administrateur revérifie
  l’autorisation (`app/statistiques/avis/actions.ts:23-29`).
- **Entrées :** les API contrôlent le type de contenu, la taille et la forme du
  JSON. La commande revalide côté serveur région, remise, paiement, adresse,
  articles, quantités et prix (`app/carte/order-actions.ts:62-253`).
- **Téléchargement d’avatar :** types JPEG/PNG/WebP allowlistés, signature
  vérifiée, taille et pixels limités, décodage via Sharp, rotation, redimensionnement
  et conversion WebP (`app/statistiques/avis/actions.ts:64-129`).
- **SQL :** les valeurs variables sont passées comme paramètres du client
  `postgres`; aucune concaténation SQL confirmée n’a été trouvée. Les délais de
  connexion et de requête sont bornés (`lib/postgres.ts:11-33`).
- **SSRF :** GeoAdmin utilise une origine HTTPS codée en dur et des délais
  d’attente (`app/api/address-suggestions/route.ts:109-145`,
  `lib/validate-delivery-zone.ts:30-49`).
- **Logs et erreurs :** le journal structuré n’autorise qu’une liste de champs,
  ne sérialise ni message ni pile d’exception, et les erreurs visibles utilisent
  une référence courte (`lib/observability.ts:1-108`).
- **Cache privé :** l’administration et les avatars restent `private,
  no-store`; les témoignages mis en cache sont uniquement ceux déjà approuvés,
  visibles et publiés.
- **Dépendances :** le lockfile est présent, `npm ci` est utilisé en CI et
  l’audit de dépendances ne signalait aucune vulnérabilité connue le jour de la
  revue.
- **Base de données :** la CI lance le contrôle de schéma et de migration sur
  un PostgreSQL jetable `dega_ci`. Le script exige un flag destructif explicite
  et refuse les noms de base qui ne se terminent pas par `_ci` ou `_test`.

## Vérifications d’infrastructure obligatoires

Avant d’annoncer le site prêt pour la production, joindre des preuves datées :

1. capture ou export des règles WAF actives et test de leurs réponses ;
2. résultat d’une restauration PostgreSQL dans une base séparée ;
3. preuve du moniteur `/api/health` et des alertes `5xx`/auth/base/GeoAdmin ;
4. inspection des en-têtes HTTP réels sur pages publique et privée ;
5. confirmation que les secrets sont limités au bon environnement ;
6. test que les source maps et journaux ne sont pas publiquement accessibles ;
7. revue des accès au projet Vercel, à PostgreSQL et au dépôt GitHub.

La procédure associée se trouve dans [`../PRODUCTION.md`](../PRODUCTION.md).
