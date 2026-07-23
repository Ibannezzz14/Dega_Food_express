# Audit strict des images de la carte

Date : 23 juillet 2026  
Règle appliquée : le nom du produit est un contrat visuel. Les éléments
annoncés doivent représenter la grande majorité de l’image. Une photo jolie
mais inexacte est refusée.

Statuts :

- **Validée** : affichée sur le site ;
- **À confirmer** : visuellement cohérente, mais un détail produit doit être
  confirmé par le propriétaire ;
- **Fournie / affichée** : visuel intégré à la demande du propriétaire, sans
  constituer une preuve du conditionnement réellement vendu ;
- **Refusée / masquée** : non affichée ; emplacement graphique neutre.

| Produit | Catégorie | Description visuelle requise | Optionnel autorisé | Interdit | Ancien visuel | Nouveau visuel | Source / licence | Statut | Confirmation propriétaire |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Beignets | Entrées | Beignets seuls, dorés, majoritaires | Récipient simple, très légère poussière de sucre | Autres plats, personnes, texte | `/images/menu/beignets-africains.webp` | `/images/menu/beignets-puff-puff-pexels.webp` | Keesha’s Kitchen, [Pexels](https://www.pexels.com/photo/close-up-shot-of-delicious-puff-puff-on-white-ceramic-bowl-13915068/), licence Pexels | **Validée** : recadrage serré sur les puff-puff, sans main ni aliment parasite | Non |
| Attiéké tilapia | Plats | Attiéké et tilapia clairement identifiables | Un condiment, petite garniture | Poisson d’espèce inconnue, soupe dominante, main | `/images/menu/attieke-tilapia.webp` | `/images/menu/attieke-tilapia-proprietaire.webp` | `Img/IMG_0187.PNG`, fichier fourni, métadonnées C2PA `gpt-image` | **Fournie / affichée** : tilapia entier et attiéké majoritaires, sans personne ni main | Non |
| Attiéké poulet choukouya | Plats | Attiéké et poulet choukouya majoritaires | Condiment traditionnel léger | Préparation non identifiée, autre accompagnement dominant | `/images/menu/attieke-poulet-choukouya.webp` | `/images/menu/attieke-poulet-choukouya-proprietaire.webp` | Fichier fourni, métadonnées C2PA `gpt-image` | **Fournie / affichée** : attiéké et poulet occupent la majorité de l’image, sans personne | Non |
| Attiéké agneau choukouya | Plats | Attiéké et agneau grillé majoritaires | Un condiment | Agneau seul, frites, légumes multiples | `/images/menu/attieke-agneau.webp` | `/images/menu/attieke-agneau-choukouya-proprietaire.webp` | Fichier fourni, métadonnées C2PA `gpt-image` | **Fournie / affichée** : attiéké et viande grillée occupent la majorité de l’image, sans personne | Non |
| Alloco poisson braisé | Plats | Alloco et poisson braisé majoritaires | Sauce tomate, crudités légères | Riz, pâtes, autre protéine | `/images/menu/alloco-tilapia-braise.webp` | `/images/menu/alloco-poisson-braise-proprietaire.webp` | `Img/IMG_0180.JPEG`, fichier fourni par le propriétaire | **Fournie / affichée** : alloco et poisson braisé clairement visibles, sans personne | Non |
| Alloco poulet choukouya | Plats | Alloco et poulet choukouya majoritaires | Condiment discret | Poulet braisé non confirmé comme choukouya, accompagnements ajoutés | `/images/menu/alloco-poulet-choukouya.webp` | `/images/menu/alloco-poulet-choukouya-proprietaire.webp` | `Img/IMG_0182.JPEG`, fichier fourni par le propriétaire | **Fournie / affichée** : alloco et poulet occupent la majorité de l’image, sans personne | Non |
| Alloco agneau choukouya | Plats | Alloco et agneau grillé majoritaires | Un condiment | Agneau seul, frites, légumes multiples | `/images/menu/alloco-agneau.webp` | `/images/menu/alloco-agneau-choukouya-proprietaire.webp` | `Img/IMG_0183.JPEG`, fichier fourni par le propriétaire | **Fournie / affichée** : alloco et viande occupent la majorité de l’image, sans personne | Non |
| Placali sauce kopé | Plats | Placali et sauce kopé majoritaires | Piment présent dans la sauce | Autre féculent, autre plat | `/images/menu/placali-sauce-kope.webp` | `/images/menu/placali-sauce-kope-proprietaire.webp` | Fichier fourni, métadonnées C2PA `gpt-image` | **Fournie / affichée** : les deux portions de placali sont entières et la sauce reste clairement visible, sans personne | Non |
| Dégué | Desserts | Dégué de mil et lait/yaourt très majoritaire | Quelques raisins et une touche de cannelle | Autre dessert ou boisson visible | `/images/menu/degue.webp` | `/images/menu/deguee-proprietaire.webp` | Fichier fourni, métadonnées C2PA `gpt-image` | **Fournie / affichée** : le dégué occupe la grande majorité de l’image, sans personne | Confirmer que la garniture correspond à la recette vendue |
| Eau Evian 33 cl | Boissons | Bouteille Evian exacte, fermée, format 33 cl | Fond simple | Illustration ou marque/volume incorrect | Illustration interne générique | `/images/menu/drinks/eau-evian-33cl-officiel.webp` | [Site officiel Evian](https://www.evian.com/fr_ch/produits/bouteilles-en-verre/33cl/) | **Validée** : bouteille en verre officielle de 33 cl, entière et sans personne | Non |
| Bissap 33 cl | Boissons | Bissap rouge majoritaire, format 33 cl identifiable | Fond simple | Autre boisson, personnes | `/images/menu/drinks/bissap.webp` | `/images/menu/drinks/bissap-33cl-proprietaire.webp` | Fichier fourni, métadonnées C2PA `gpt-image` | **Fournie / affichée** : le bon format domine l’image | Corriger « Bisap » sur l’étiquette avant une version définitive |
| Bissap 1 L | Boissons | Bissap rouge majoritaire, format 1 L identifiable | Fond simple | Autre boisson, personnes | `/images/menu/drinks/bissap.webp` | `/images/menu/drinks/bissap-1l-proprietaire.webp` | Fichier fourni, métadonnées C2PA `gpt-image` | **Fournie / affichée** : le bon format domine l’image | Corriger « Bisap » sur l’étiquette avant une version définitive |
| Gingembre 33 cl | Boissons | Jus de gingembre majoritaire, format 33 cl identifiable | Fond simple | Infusion ambiguë, autres boissons | `/images/menu/drinks/jus-gingembre.webp` | `/images/menu/drinks/gingembre-33cl-proprietaire.webp` | Fichier fourni, métadonnées C2PA `gpt-image` | **Fournie / affichée** : le bon format domine l’image | Confirmer le conditionnement réellement vendu |
| Gingembre 1 L | Boissons | Jus de gingembre majoritaire, format 1 L identifiable | Fond simple | Infusion ambiguë, autres boissons | `/images/menu/drinks/jus-gingembre.webp` | `/images/menu/drinks/gingembre-1l-proprietaire.webp` | Fichier fourni, métadonnées C2PA `gpt-image` | **Fournie / affichée** : le bon format domine l’image | Confirmer le conditionnement réellement vendu |
| Guinness 33 cl | Boissons | Canette Guinness exacte de 33 cl | Fond simple | Autre volume ou variante | Illustration interne générique | `/images/menu/drinks/guinness-33cl-proprietaire.webp` | Fichier fourni, métadonnées C2PA `gpt-image` | **Fournie / affichée** : marque et volume lisibles | Remplacer à terme par une photographie de la canette vendue |
| Super Bock 33 cl | Boissons | Bouteille Super Bock exacte de 33 cl, entière et fermée | Fond neutre | Autre marque, bouteille ouverte | Ancienne photographie à la contenance non documentée | `/images/menu/drinks/super-bock-33cl-proprietaire.webp` | Fichier fourni, métadonnées C2PA `gpt-image` | **Fournie / affichée** : bouteille entière, sans recadrage | Le volume n’est pas visible sur le visuel |
| Primitivo Merlot | Boissons | Bouteille exacte de Primitivo Merlot | Fond simple | Autre vin | Bouteille générique Pexels | `/images/menu/drinks/primitivo-merlot-proprietaire.webp` | Fichier fourni, métadonnées C2PA `gpt-image` | **Fournie / affichée** : intitulé visible, bouteille entière | Producteur et conditionnement réel à confirmer |
| Œil-de-Perdrix | Boissons | Bouteille exacte d’Œil-de-Perdrix | Fond simple | Autre rosé | Illustration interne générique | `/images/menu/drinks/oeil-de-perdrix-proprietaire.webp` | Fichier fourni, métadonnées C2PA `gpt-image` | **Fournie / affichée** : intitulé visible, bouteille entière | Étiquette générée à remplacer par celle du produit réel |

## Images éditoriales

Les anciennes photos génériques de buffet, l’assiette identifiée à tort comme
du jollof, le plat latino-américain et le bissap trop encombré ont été retirés
de toutes les pages. Le Hero de l’accueil ne contient plus de photographie.
Les pages Accueil, Présentation, Service traiteur et Contact réutilisent
seulement les visuels fournis par le propriétaire et leurs versions WebP
optimisées.

## Bilan

- 18 références commerciales auditées ;
- 18 références affichées, dont 8 avec les visuels fournis pour les boissons ;
- 0 référence remplacée par un emplacement neutre ;
- 0 personne, visage ou main dans les visuels affichés ;
- 0 source Pinterest ou Google Images intégrée ;
- 0 volume ou catégorie modifié ; « Eau plate » a été précisé en « Eau
  Evian », « Alloco tilapia » en « Alloco poisson braisé » et le prix de ce
  plat confirmé à 25 CHF à la demande du propriétaire.
