# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Les clients de Lausanne, Lucens et des environs qui souhaitent consulter une carte de cuisine ivoirienne et préparer rapidement une commande depuis leur téléphone. Les familles, associations et organisateurs d’événements constituent un second public pour le service traiteur sur devis.

## Product Purpose

Dega Food Express présente les plats, boissons et tarifs disponibles, aide le client à sélectionner sa région et prépare la prise de commande sur WhatsApp. Une page distincte présente le service traiteur pour les repas de famille, associations et événements, avec un devis établi sur demande.

## Positioning

Une carte ivoirienne locale qui associe découverte visuelle des plats, prix lisibles et orientation directe vers le bon contact de commande selon la région.

## Operating Context

La majorité du parcours se déroule sur mobile et se termine dans WhatsApp. Le visiteur parcourt la carte, choisit des produits, sélectionne la zone de Lausanne ou de Lucens, puis poursuit la conversation avec le numéro correspondant.

## Capabilities and Constraints

- Application Next.js avec React et TypeScript.
- CSS Modules pour l’interface.
- Fonction serveur Next.js pour valider la sélection et préparer la commande WhatsApp.
- PostgreSQL conserve uniquement les compteurs géographiques journaliers des passages validés vers WhatsApp. Aucune rue, panier, IP ou commande complète n’est stockée.
- Les produits, prix, contenances connues et informations à confirmer restent des données éditoriales versionnées dans le code.
- Le parcours principal est la commande individuelle ; le service traiteur dispose d’une page séparée et d’un parcours de devis sans tarif standard affiché.

## Brand Commitments

- Nom : Dega Food Express.
- Langue principale : français.
- Conserver le logo. N’afficher une photographie que si elle correspond
  exactement au produit annoncé ; sinon utiliser l’emplacement neutre prévu.
- Conserver exactement les prix et les deux contacts actuels : Lausanne au 078 265 40 81 ; Lucens au 076 603 60 11.
- Livraison : rayon de 10 km autour de Lausanne pour le 078 265 40 81, et rayon de 25 km autour de Lucens pour le 076 603 60 11.
- Préserver le lien avec la cuisine ivoirienne sans réutiliser l’ancienne interface.

## Evidence on Hand

- Logo et favicon : `public/images/`.
- Photographies culinaires optimisées : `public/images/editorial/` et
  `public/images/menu/`.
- Sources, licences et décisions d’audit :
  `IMAGE_SOURCES.md` et `MENU_IMAGE_AUDIT.md`.
- Carte, tarifs et textes alternatifs : `data/menu.ts`.
- Contenus, contacts et parcours actuels : `app/`, `data/delivery-zones.ts` et
  `data/order-rules.ts`.
- Aucun témoignage client, volume de commandes, récompense ou autre preuve commerciale vérifiée n’est disponible ; ces éléments ne doivent pas être inventés.

## Product Principles

- Faire comprendre la cuisine, les prix et l’action principale en quelques secondes.
- Réduire le chemin entre le choix d’un produit et la conversation WhatsApp.
- Supprimer les microtextes décoratifs, les tableaux lourds et les répétitions.
- Ne jamais inventer un prix, une disponibilité ou une preuve commerciale.
- Rester rapide, lisible et utilisable sur mobile comme sur desktop.
