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
| Beignets | Entrées | Beignets seuls, dorés, majoritaires | Grand plat simple | Autres plats, personnes, texte | `/images/menu/beignets-puff-puff-pexels.webp` | `/images/menu/beignets-proprietaire.webp` | Photo fournie par le propriétaire du site | **Validée** : recadrage carré serré où les beignets occupent la grande majorité de l’image | Non |
| Attiéké tilapia | Plats | Attiéké et tilapia clairement identifiables | Un condiment, petite garniture | Poisson d’espèce inconnue, soupe dominante, main | `/images/menu/attieke-tilapia.webp` | `/images/menu/attieke-tilapia-proprietaire.webp` | `Img/IMG_0187.PNG`, fichier fourni, métadonnées C2PA `gpt-image` | **Fournie / affichée** : tilapia entier et attiéké majoritaires, sans personne ni main | Non |
| Attiéké poulet choukouya | Plats | Attiéké et poulet choukouya majoritaires | Condiment traditionnel léger | Préparation non identifiée, autre accompagnement dominant | `/images/menu/attieke-poulet-choukouya.webp` | `/images/menu/attieke-poulet-choukouya-proprietaire.webp` | Fichier fourni, métadonnées C2PA `gpt-image` | **Fournie / affichée** : attiéké et poulet occupent la majorité de l’image, sans personne | Non |
| Attiéké agneau choukouya | Plats | Attiéké et agneau grillé majoritaires | Un condiment | Agneau seul, frites, légumes multiples | `/images/menu/attieke-agneau.webp` | `/images/menu/attieke-agneau-choukouya-proprietaire.webp` | Fichier fourni, métadonnées C2PA `gpt-image` | **Fournie / affichée** : attiéké et viande grillée occupent la majorité de l’image, sans personne | Non |
| Alloco poisson braisé | Plats | Alloco et poisson braisé majoritaires | Sauce tomate, crudités légères | Riz, pâtes, autre protéine | `/images/menu/alloco-tilapia-braise.webp` | `/images/menu/alloco-poisson-braise-proprietaire.webp` | `Img/IMG_0180.JPEG`, fichier fourni par le propriétaire | **Fournie / affichée** : alloco et poisson braisé clairement visibles, sans personne | Non |
| Alloco poulet choukouya | Plats | Alloco et poulet choukouya majoritaires | Condiment discret | Poulet braisé non confirmé comme choukouya, accompagnements ajoutés | `/images/menu/alloco-poulet-choukouya.webp` | `/images/menu/alloco-poulet-choukouya-proprietaire.webp` | `Img/IMG_0182.JPEG`, fichier fourni par le propriétaire | **Fournie / affichée** : alloco et poulet occupent la majorité de l’image, sans personne | Non |
| Alloco agneau choukouya | Plats | Alloco et agneau grillé majoritaires | Un condiment | Agneau seul, frites, légumes multiples | `/images/menu/alloco-agneau.webp` | `/images/menu/alloco-agneau-choukouya-proprietaire.webp` | `Img/IMG_0183.JPEG`, fichier fourni par le propriétaire | **Fournie / affichée** : alloco et viande occupent la majorité de l’image, sans personne | Non |
| Placali sauce kopé | Plats | Placali et sauce kopé majoritaires | Piment présent dans la sauce | Autre féculent, autre plat | `/images/menu/placali-sauce-kope.webp` | `/images/menu/placali-sauce-kope-proprietaire.webp` | Fichier fourni, métadonnées C2PA `gpt-image` | **Fournie / affichée** : les deux portions de placali sont entières et la sauce reste clairement visible, sans personne | Non |
| Dégué | Desserts | Dégué de mil et lait/yaourt très majoritaire | Quelques raisins et une touche de cannelle | Autre dessert ou boisson visible | `/images/menu/degue.webp` | `/images/menu/deguee-proprietaire.webp` | Fichier fourni, métadonnées C2PA `gpt-image` | **Fournie / affichée** : le dégué occupe la grande majorité de l’image, sans personne | Confirmer que la garniture correspond à la recette vendue |
| Eau Evian 33 cl | Boissons | Bouteille Evian exacte, fermée, format 33 cl | Fond simple | Illustration ou marque/volume incorrect | Illustration interne générique | `/images/menu/drinks/eau-evian-33cl-officiel.webp` | [Site officiel Evian](https://www.evian.com/fr_ch/produits/bouteilles-en-verre/33cl/) | **Validée** : bouteille en verre officielle de 33 cl, entière et sans personne | Non |
| Bissap 33 cl | Boissons | Bissap rouge majoritaire | Fond simple ; volume indiqué dans le texte | Autre boisson, personnes, fausse étiquette | `/images/menu/drinks/bissap-33cl-proprietaire.webp` | `/images/menu/drinks/bissap-pexels.webp` | Mohamed Olwy, Pexels, licence Pexels | **Validée / affichée** : vraie photographie centrée sur le bissap, sans personne ni texte | Le même visuel illustre les deux volumes |
| Bissap 1 L | Boissons | Bissap rouge majoritaire | Fond simple ; volume indiqué dans le texte | Autre boisson, personnes, fausse étiquette | `/images/menu/drinks/bissap-1l-proprietaire.webp` | `/images/menu/drinks/bissap-pexels.webp` | Mohamed Olwy, Pexels, licence Pexels | **Validée / affichée** : vraie photographie centrée sur le bissap, sans personne ni texte | Le même visuel illustre les deux volumes |
| Gingembre 33 cl | Boissons | Jus de gingembre majoritaire | Gingembre ou agrume ; volume indiqué dans le texte | Autre boisson, personnes, fausse étiquette | `/images/menu/drinks/gingembre-33cl-proprietaire.webp` | `/images/menu/drinks/gingembre-pexels.webp` | Muhammad Fawdy, Pexels, licence Pexels | **Validée / affichée** : vraie photographie centrée sur le verre et le gingembre | Le même visuel illustre les deux volumes |
| Gingembre 1 L | Boissons | Jus de gingembre majoritaire | Gingembre ou agrume ; volume indiqué dans le texte | Autre boisson, personnes, fausse étiquette | `/images/menu/drinks/gingembre-1l-proprietaire.webp` | `/images/menu/drinks/gingembre-pexels.webp` | Muhammad Fawdy, Pexels, licence Pexels | **Validée / affichée** : vraie photographie centrée sur le verre et le gingembre | Le même visuel illustre les deux volumes |
| Guinness 33 cl | Boissons | Canette Guinness exacte de 33 cl | Fond simple | Autre volume ou variante | Aucun | `/images/menu/drinks/guinness-33cl-proprietaire.webp` | Fichier fourni, métadonnées C2PA `gpt-image` | **Fournie / affichée** à la demande du propriétaire : canette entière et format lisible | Remplacer à terme par une photographie de la canette vendue |
| Super Bock 33 cl | Boissons | Bouteille Super Bock exacte de 33 cl, entière et fermée | Fond neutre | Autre marque ou autre volume | Aucun | `/images/menu/drinks/super-bock-33cl-proprietaire.webp` | Fichier fourni, métadonnées C2PA `gpt-image` | **Fournie / affichée** à la demande du propriétaire : bouteille entière | Confirmer le conditionnement réellement vendu |
| Primitivo Merlot | Boissons | Bouteille exacte de Primitivo Merlot | Fond simple | Autre vin | Aucun | `/images/menu/drinks/primitivo-merlot-proprietaire.webp` | Fichier fourni, métadonnées C2PA `gpt-image` | **Fournie / affichée** à la demande du propriétaire : bouteille entière | Producteur et conditionnement réel à confirmer |
| Œil-de-Perdrix | Boissons | Bouteille exacte d’Œil-de-Perdrix | Fond simple | Autre rosé | Aucun | `/images/menu/drinks/oeil-de-perdrix-proprietaire.webp` | Fichier fourni, métadonnées C2PA `gpt-image` | **Fournie / affichée** à la demande du propriétaire : bouteille entière | Étiquette du produit réel à confirmer |

## Images éditoriales

Les anciennes photos génériques de buffet, l’assiette identifiée à tort comme
du jollof, le plat latino-américain et le bissap trop encombré ont été retirés
de toutes les pages. Le Hero de l’accueil ne contient plus de photographie.
Les pages Accueil, Présentation, Service traiteur et Contact réutilisent
seulement les visuels fournis par le propriétaire et leurs versions WebP
optimisées.

## Bilan

- 18 références commerciales auditées ;
- 18 références affichées avec une image ;
- 4 visuels de boissons fournis ont été restaurés dans la carte à la demande
  du propriétaire ;
- 0 personne, visage ou main dans les visuels affichés ;
- 0 source Pinterest ou Google Images intégrée ;
- 0 volume ou catégorie modifié ; « Eau plate » a été précisé en « Eau
  Evian », « Alloco tilapia » en « Alloco poisson braisé » et le prix de ce
  plat confirmé à 25 CHF à la demande du propriétaire.
