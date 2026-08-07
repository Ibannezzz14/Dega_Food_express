# Modifier le site Dega Food Express

Ce guide indique où effectuer les changements courants sans parcourir tout le
projet.

## Repères rapides

| Besoin | Fichier ou dossier |
| --- | --- |
| Numéros, zones livraison/traiteur, Instagram, logo et fonds | `config/site-config.ts` |
| Plats, prix et images du menu | `data/menu.ts` |
| Règles de prix et frais de livraison | `data/order-rules.ts` |
| Témoignages Instagram affichés | `/statistiques/avis` |
| Nouvelles photos à intégrer | `PHOTOS-DEGA-FOOD-A-INTEGRER/A-INTEGRER/` |
| Photos visibles sur le site | `public/images/` |
| Photos sources et archives non publiées | `assets/source-images/` |
| Pages du site | `app/` |
| Sections et composants réutilisables | `components/` |

## Modifier les contacts et la livraison

Ouvrir `config/site-config.ts`. Les valeurs importantes sont regroupées
au début du fichier :

```ts
const ORDER_PHONE = createSwissPhone("41766036011");
const CATERING_PHONE = createSwissPhone("41782654081");
const DELIVERY_REGION_ID = "lucens";
const DELIVERY_STANDARD_RADIUS_KM = 30;
const DELIVERY_ANCHORS = [/* Lausanne et Lucens */];
```

Les numéros utilisent le format international suisse : `41` suivi des neuf
chiffres du numéro national, sans `+`, espace ni tiret. Le site fabrique ensuite
automatiquement l’affichage, le lien téléphonique et le lien WhatsApp.

`ORDER_PHONE` est l’unique contact des commandes et livraisons pour Lausanne,
Lucens et leurs alentours. Ne pas créer un second contact de livraison.
`CATERING_PHONE` reçoit les demandes de devis du formulaire traiteur. Les deux
numéros restent affichés à la fin de la page traiteur.

La zone du service traiteur est indépendante de la livraison des commandes.
Elle se trouve dans `CATERING_AREA` et couvre toute la Suisse. Le lieu, le
transport, le matériel, le personnel et les autres besoins sont étudiés dans
un devis personnalisé. Aucun supplément ne doit être ajouté sans tarif défini.

Le site ne publie aucun numéro de paiement séparé. Les modes de règlement à la
livraison sont définis dans `lib/order-payment.ts`.

La livraison utilise une seule région technique historique, `lucens`, afin de
préserver les liens et statistiques existants. Ce nom n’est pas un libellé
public. `DELIVERY_ANCHORS` contient Lausanne et Lucens ; leur zone habituelle
est consommée par `data/delivery-zones.ts`. Une adresse suisse vérifiée en
dehors de cette zone obtient le statut `on_request` : la demande reste
envoyable, mais la faisabilité et les frais sont à confirmer.

## Ajouter ou modifier un plat

Ouvrir `data/menu.ts`, puis ajouter ou modifier une entrée dans `menuItems`.
Exemple pour un plat déjà tarifé et illustré :

```ts
{
  id: "nom-court-unique",
  name: "Nom visible",
  price: 25,
  category: "plats",
  image: "/images/menu/nom-du-fichier.webp",
  imageAlt: "Description courte et fidèle de la photo",
},
```

Si le prix ou la photo ne sont pas encore confirmés, ne rien inventer :

```ts
{
  id: "nom-court-unique",
  name: "Nom visible",
  price: null,
  category: "plats",
  imageStatus: "pending",
},
```

Les catégories disponibles sont `entrees`, `plats`, `desserts` et `boissons`.
Placer les images finales en WebP dans `public/images/menu/`. Le chemin écrit
dans le code commence toujours par `/images/`.

## Ajouter un témoignage Instagram vérifié

Ouvrir `/statistiques/avis` avec les mêmes identifiants privés que la page des
statistiques. Cette page permet d’ajouter un témoignage reçu sur Instagram,
puis de le modifier, le masquer, le mettre en avant, changer son ordre ou le
supprimer.

La photo est facultative et doit être au format JPEG, PNG ou WebP, avec une
taille maximale de 512 Kio. La note est également facultative. Ne jamais créer
de faux témoignage.

Les visiteurs ne disposent d’aucun formulaire public sur le site. Seul
l’administrateur ajoute les témoignages Instagram depuis l’espace privé.

## Organisation du projet

```text
app/                     pages, routes API et actions serveur
components/
  home/                  sections de la page d’accueil
  layout/                en-tête et pied de page
  order/                 panier et parcours de commande
  reviews/               affichage public des témoignages Instagram
  shared/                éléments visuels partagés
config/                  informations centrales du site
data/                    menu et règles métier simples
lib/                     validation, base de données et services
public/images/           images réellement publiées
PHOTOS-DEGA-FOOD-A-INTEGRER/
  A-INTEGRER/            boîte de dépôt classée par catégorie
assets/source-images/    originaux et archives non publiés
docs/                    guide et documentation interne
tests/                   tests automatisés
db/                      schéma et migrations PostgreSQL
```

## Vérifier avant publication

Depuis la racine du projet :

```bash
npm run lint
npm test
npm run typecheck
SITE_URL=https://build.dega-food.invalid npm run build
```

Vérifier ensuite sur téléphone ou avec l’affichage mobile du navigateur :

- les boutons Commander, Traiteur et Instagram ;
- la mention « livraison à Lausanne, Lucens et dans les régions
  environnantes » ;
- l’envoi possible d’une demande extérieure avec frais à confirmer ;
- la mention « service traiteur dans toute la Suisse » ;
- le numéro de commande et livraison `076 603 60 11` ;
- le numéro du service traiteur `078 265 40 81` ;
- les photos, prix et boutons de la carte ;
- la page Avis, les témoignages et leurs avatars ;
- l’accès privé à `/statistiques/avis`.
