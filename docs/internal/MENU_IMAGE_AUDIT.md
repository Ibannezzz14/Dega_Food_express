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
| Attiéké tilapia | Plats | Attiéké et tilapia clairement identifiables | Un condiment, petite garniture | Poisson d’espèce inconnue, soupe dominante, main | `/images/menu/attieke-tilapia.webp` | `/images/menu/attieke-tilapia-proprietaire.webp` | `assets/source-images/raw/IMG_0187.PNG`, fichier fourni, métadonnées C2PA `gpt-image` | **Fournie / affichée** : tilapia entier et attiéké majoritaires, sans personne ni main | Non |
| Attiéké poulet choukouya | Plats | Attiéké et poulet choukouya majoritaires | Condiment traditionnel léger | Préparation non identifiée, autre accompagnement dominant | `/images/menu/attieke-poulet-choukouya.webp` | `/images/menu/attieke-poulet-choukouya-proprietaire.webp` | Fichier fourni, métadonnées C2PA `gpt-image` | **Fournie / affichée** : attiéké et poulet occupent la majorité de l’image, sans personne | Non |
| Attiéké agneau choukouya | Plats | Attiéké et agneau grillé majoritaires | Un condiment | Agneau seul, frites, légumes multiples | `/images/menu/attieke-agneau.webp` | `/images/menu/attieke-agneau-choukouya-proprietaire.webp` | Fichier fourni, métadonnées C2PA `gpt-image` | **Fournie / affichée** : attiéké et viande grillée occupent la majorité de l’image, sans personne | Non |
| Alloco poisson braisé | Plats | Alloco et poisson braisé majoritaires | Sauce tomate, crudités légères | Riz, pâtes, autre protéine | `/images/menu/alloco-tilapia-braise.webp` | `/images/menu/alloco-poisson-braise-retouche.webp` | `Photos à retoucher/Photos Retouchées/Alloco-Poisson.png`, version retouchée fournie | **Fournie / affichée** : alloco et poisson braisé clairement visibles, sans personne | Non |
| Alloco poulet choukouya | Plats | Alloco et poulet choukouya majoritaires | Condiment discret | Poulet braisé non confirmé comme choukouya, accompagnements ajoutés | `/images/menu/alloco-poulet-choukouya.webp` | `/images/menu/alloco-poulet-choukouya-retouche.webp` | `Photos à retoucher/Photos Retouchées/ChatGPT Image 8 août 2026, 13_46_25 (1).png`, version retouchée fournie | **Fournie / affichée** : alloco et poulet occupent la majorité de l’image, sans personne | Non |
| Alloco agneau choukouya | Plats | Alloco et agneau grillé majoritaires | Un condiment | Agneau seul, frites, légumes multiples | `/images/menu/alloco-agneau.webp` | `/images/menu/alloco-agneau-choukouya-retouche.webp` | `Photos à retoucher/Photos Retouchées/ChatGPT Image 8 août 2026, 13_46_25 (2).png`, version retouchée fournie | **Fournie / affichée** : alloco et viande occupent la majorité de l’image, sans personne | Non |
| Placali sauce kopé | Plats | Placali et sauce kopé majoritaires | Piment présent dans la sauce | Autre féculent, autre plat | `/images/menu/placali-sauce-kope.webp` | `/images/menu/placali-sauce-kope-proprietaire.webp` | Fichier fourni, métadonnées C2PA `gpt-image` | **Fournie / affichée** : les deux portions de placali sont entières et la sauce reste clairement visible, sans personne | Non |
| Dégué | Desserts | Dégué de mil et lait/yaourt très majoritaire | Fraises et myrtilles en garniture | Autre dessert ou boisson visible | `/images/menu/degue.webp` | `/images/menu/degue-retouche.webp` | `Photos à retoucher/Photos Retouchées/ChatGPT Image 31 juil. 2026, 09_59_31.png`, version retouchée fournie | **Fournie / affichée** : le dégué occupe la grande majorité de l’image, sans personne | Confirmer que la garniture correspond à la recette vendue |
| Eau Evian 33 cl | Boissons | Bouteille Evian exacte, fermée, format 33 cl | Fond simple | Illustration ou marque/volume incorrect | Illustration interne générique | `assets/source-images/unused-from-menu/eau-evian-33cl-officiel.webp` | [Site officiel Evian](https://www.evian.com/fr_ch/produits/bouteilles-en-verre/33cl/) | **Archivée** : référence retirée de la carte le 31 juillet 2026 | Non |
| Bissap 33 cl | Boissons | Bissap rouge majoritaire | Fond simple ; volume indiqué dans le texte | Autre boisson, personnes, fausse étiquette | `/images/menu/drinks/bissap-33cl-proprietaire.webp` | `/images/menu/drinks/bissap-pexels.webp` | Mohamed Olwy, Pexels, licence Pexels | **Validée / affichée** : vraie photographie centrée sur le bissap, sans personne ni texte | Le même visuel illustre les deux volumes |
| Bissap 1 L | Boissons | Bissap rouge majoritaire | Fond simple ; volume indiqué dans le texte | Autre boisson, personnes, fausse étiquette | `/images/menu/drinks/bissap-1l-proprietaire.webp` | `/images/menu/drinks/bissap-pexels.webp` | Mohamed Olwy, Pexels, licence Pexels | **Validée / affichée** : vraie photographie centrée sur le bissap, sans personne ni texte | Le même visuel illustre les deux volumes |
| Gingembre 33 cl | Boissons | Jus de gingembre majoritaire | Gingembre ou agrume ; volume indiqué dans le texte | Autre boisson, personnes, fausse étiquette | `/images/menu/drinks/gingembre-33cl-proprietaire.webp` | `/images/menu/drinks/gingembre-pexels.webp` | Muhammad Fawdy, Pexels, licence Pexels | **Validée / affichée** : vraie photographie centrée sur le verre et le gingembre | Le même visuel illustre les deux volumes |
| Gingembre 1 L | Boissons | Jus de gingembre majoritaire | Gingembre ou agrume ; volume indiqué dans le texte | Autre boisson, personnes, fausse étiquette | `/images/menu/drinks/gingembre-1l-proprietaire.webp` | `/images/menu/drinks/gingembre-pexels.webp` | Muhammad Fawdy, Pexels, licence Pexels | **Validée / affichée** : vraie photographie centrée sur le verre et le gingembre | Le même visuel illustre les deux volumes |
| Guinness 33 cl | Boissons | Canette Guinness exacte de 33 cl | Fond simple | Autre volume ou variante | Aucun | `assets/source-images/unused-from-menu/guinness-33cl-proprietaire.webp` | Fichier fourni, métadonnées C2PA `gpt-image` | **Archivée** : référence retirée de la carte le 31 juillet 2026 | Non |
| Super Bock 33 cl | Boissons | Bouteille Super Bock exacte de 33 cl, entière et fermée | Fond neutre | Autre marque ou autre volume | Aucun | `assets/source-images/unused-from-menu/super-bock-33cl-proprietaire.webp` | Fichier fourni, métadonnées C2PA `gpt-image` | **Archivée** : référence retirée de la carte le 31 juillet 2026 | Non |
| Primitivo Merlot | Boissons | Bouteille exacte de Primitivo Merlot | Fond simple | Autre vin | Aucun | `assets/source-images/unused-from-menu/primitivo-merlot-proprietaire.webp` | Fichier fourni, métadonnées C2PA `gpt-image` | **Archivée** : référence retirée de la carte le 31 juillet 2026 | Non |
| Œil-de-Perdrix | Boissons | Bouteille exacte d’Œil-de-Perdrix | Fond simple | Autre rosé | Aucun | `assets/source-images/unused-from-menu/oeil-de-perdrix-proprietaire.webp` | Fichier fourni, métadonnées C2PA `gpt-image` | **Archivée** : référence retirée de la carte le 31 juillet 2026 | Non |

## Images éditoriales

Les anciennes photos génériques de buffet, l’assiette identifiée à tort comme
du jollof, le plat latino-américain et le bissap trop encombré ont été retirés
de toutes les pages. Le Hero de l’accueil ne contient plus de photographie.
Les plats montrés sur les pages éditoriales réutilisent les visuels fournis par
le propriétaire et leurs versions WebP optimisées. Des fonds décoratifs
générés — textile, bois et poterie, sans plat commercial — complètent désormais
l’accueil, la zone traiteur, les témoignages et le contact. Leur provenance est
consignée dans `IMAGE_SOURCES.md`.

## Bilan

- 18 références commerciales auditées ;
- 13 références actuellement affichées avec une image ;
- 5 références de boissons retirées de la carte et conservées comme archives ;
- 0 personne, visage ou main dans les visuels affichés ;
- 0 source Pinterest ou Google Images intégrée ;
- 0 volume ou catégorie modifié ; « Eau plate » a été précisé en « Eau
  Evian », « Alloco tilapia » en « Alloco poisson braisé » et le prix de ce
  plat confirmé à 25 CHF à la demande du propriétaire.
