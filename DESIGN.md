# Design

<!-- impeccable:design-schema 1 -->

## Direction

**La table contemporaine** — Dega Food est présenté comme une maison de cuisine ivoirienne actuelle, chaleureuse et directe. Le parcours reste celui d’une table que le client compose avant WhatsApp, mais le langage visuel devient plus architectural, plus calme et moins illustratif.

## Audience and Job

- Clients de Lausanne, Lucens et alentours, souvent sur téléphone
- Comprendre l’offre, choisir des plats, sélectionner la zone et ouvrir la bonne conversation WhatsApp
- Découvrir les prestations événementielles seulement après le parcours de commande principal

## Palette

- Vert minéral `#0D3A31` : fond identitaire et navigation
- Vert nuit `#071F1A` : profondeur, pied de page et résumé de commande
- Laiton `#C9A35D` : accent principal, utilisé avec retenue
- Brique foncée `#963B2D` : prix et signal ponctuel accessible
- Ivoire froid `#F5F5F0` : surfaces de lecture
- Encre verte `#10251F` : texte principal

## Typography

- Grands titres éditoriaux : **Cormorant Garamond**, chaleureuse et raffinée, réservée aux titres de page et de section
- Texte, navigation et commandes : **Instrument Sans**, nette, contemporaine et très lisible sur mobile
- Prix et compteurs : chiffres tabulaires, poids fort, aucune microtypographie décorative

## Material Language

- Ligne d’itinéraire en trois étapes comme signature fonctionnelle
- Cadres fins de 1 px, rayons cohérents de 8 à 16 px
- Photos réelles en grands recadrages rectangulaires, couleurs alimentaires conservées
- Résumé de commande sombre qui se remplit avec la sélection

## Layout System

- Composition approuvée : **Le set de table**
- Premier écran en trois colonnes : promesse, photographie réelle, choix de zone
- Parcours « zone → plats → WhatsApp » visible immédiatement
- Navigation complète et stable : Accueil, Présentation, La carte, Traiteur
- Section Présentation dédiée avant la carte
- Menu organisé en larges bandes de plats, jamais en tableau
- Sur ordinateur : menu principal et événements secondaires ; résumé de commande fixé en bas
- Sur mobile : catégories horizontales, cartes pleine largeur, résumé de commande fixé en bas

## Component Character

- Boutons rectangulaires à rayon discret, libellés directs
- Catégories dans une barre claire et calme
- Cartes de plats composées par nom, complément utile, prix et contrôle de sélection
- Sélection signalée par un fond ivoire teinté et un mouvement bref
- Aucun badge gratuit, aucune phrase d’aide répétitive

## Imagery

- Utiliser uniquement le logo et les photos réelles déjà fournies pour les aliments et buffets
- Privilégier les recadrages serrés et les plats servis, sans personne, visage ni main
- Ne pas générer de faux plats, de faux clients, de faux témoignages ni de faux lieux
- La maquette approuvée est une direction de composition : ses aliments générés, ses icônes décoratives et ses proportions ne sont pas des assets à reproduire

## Motion

- Une entrée principale courte qui révèle le plat comme une table que l’on dresse
- Réponses de sélection de 120–180 ms
- Aucun mouvement ambiant permanent
- `prefers-reduced-motion` désactive les transitions non essentielles

## Accessibility

- Contrastes AA minimum
- Zone tactile minimale de 44 px
- Navigation clavier visible
- États jamais communiqués uniquement par la couleur
- Structure sémantique, titres ordonnés et formulaires correctement étiquetés
