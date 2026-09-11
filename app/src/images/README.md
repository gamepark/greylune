# Images de Greylune

Toutes les images sont exportées à **100 px/cm** (les fichiers d'origine étaient à 254 dpi,
soit exactement 100 px/cm), sauf le plateau principal, laissé à sa résolution native de
**50 px/cm** — suffisant pour un si grand élément.

Source : `kDrive/Licences/Sorry We Are French/GREYLUNE`.

- **JPG** pour tout ce qui est rectangulaire et opaque (cartes, plateau principal, fond).
- **PNG** pour tout ce qui a de la transparence (jetons, tuiles, plateaux découpés, meeples),
  avec une **ombre portée épaisse et sans direction** incrustée. Le halo d'ombre ajoute environ
  **12 % de la plus grande dimension** de chaque côté : en tenir compte pour les tailles
  déclarées dans `MaterialDescription`.

### Recette de l'ombre portée

Le découpage est dilaté de **22 px**, flouté au gaussien **σ = 24 px**, teinté `#190F05`, et la pièce
est composée par-dessus. Seule l'opacité varie :

La dilatation et le σ sont **proportionnels à la pièce** — le halo vaut environ 9 à 12 % de sa plus
grande dimension. Valeurs mesurées : 22 / 24 px pour une tuile Événement (844 px), 10 / 9,7 pour une
Quête (348), 13 / 14,6 pour le jeton 1er joueur (480), 5 à 6 / 5,7 à 6,6 pour les petits jetons.

| Opacité | Où |
|---|---|
| **0,28** | `tiles/*`, `tokens/*` |
| **0,50** | tout le reste des PNG |

Les tuiles Événement et Quête (dos compris) et les 46 jetons ont été refaits depuis les punchboards
à l'ombre allégée. L'opacité d'origine n'était pas uniforme — 0,46 sur les jetons Revenu, 0,48 sur
les Quêtes, 0,50 sur les Événements, 0,52 sur le jeton 1er joueur, 0,57 à 0,59 sur les Sceaux,
pièces, PV et Bonus — elle a été ramenée à 0,28 pour tout le monde. Restent à 0,50 les `pawns`, les
`boards` découpés, les `seasons` et les `icons`.

La géométrie ne change pas d'une opacité à l'autre : même canevas, même position du découpage, donc
les tailles déclarées dans `MaterialDescription` restent valables.

### Refaire une pièce depuis les punchboards

Le masque, sa position dans le canevas et les paramètres d'ombre se lisent dans le PNG existant ; le
punchboard ne fournit que la couleur. Trois pièges, tous rencontrés :

1. **Corréler sur la luminance ne suffit pas.** Deux exemplaires qui ne diffèrent que par la couleur
   du joueur sont indiscernables : les jetons PV orange ont d'abord été découpés dans le rouge, avec
   une corrélation de 0,97. Départager les candidats sur l'écart RGB réel au fichier courant.
2. **Le masque érodé cache ce qu'on cherche.** Une corrélation masquée érode le bord, donc elle ne
   voit pas le magenta qui déborde précisément là. Compter le magenta **dans** le masque, à part.
3. **Le repérage impression/découpe varie d'un exemplaire à l'autre.** Prendre celui qui est à la
   fois bien aligné et propre, pas le mieux corrélé.

Vérification en deux nombres par fichier : régénérer à l'opacité **d'origine** et vérifier qu'on
retombe sur le fichier courant (valide alignement, masque et modèle d'ombre d'un coup), puis compter
le magenta sur l'anneau extérieur de 2 px, nouveau contre courant. Sur les 56 pièces : écart alpha
≤ 13/255, écart RGB ≤ 10/255, et aucun fichier plus sale qu'avant.

## Arborescence

| Dossier | Contenu |
|---|---|
| `cards/village/{fr,en}` | 49 cartes Village : `Building1-16`, `Item1-22`, `Companion1-11` |
| `cards/village/backs` | `VillageBack1-3` (une par période) |
| `cards/encounter/{fr,en}` | 41 cartes Rencontre : `Encounter1-41` |
| `cards/encounter/backs` | `EncounterBack1-3` (une par période) |
| `boards` | `MainBoard.jpg` (50 px/cm), `SeasonBoard(.Back)`, `PlayerBoard(.Back)` |
| `tiles` | `EventTile1-6` + `EventTileBack`, `QuestTile1-9` + `QuestTileBack` |
| `tokens` | pièces, sceaux, jetons Revenu, jetons Bonus, jetons PV, jeton 1er joueur |
| `pawns` | meeples et marqueurs, par couleur (`Blue`, `Orange`, `Red`, `Purple`) |
| `seasons` | `Winter`, `Spring`, `Summer`, `Autumn` : bannières découpées dans `boards/SeasonBoard.png` |
| `icons` | symboles isolés (`Gold`, `Magic(Up/Down)`, `Move`, `Move1-5`, `PotionDiscarded`, `Story`, `SpendVillager`, `Strength(Up/Down)`, `Tilt`, `VictoryPoint`, `Villager`) — **provisoires** |

Les `icons` sont la seule exception à la règle « une image = une pièce » : la Force, la Magie, les
points de victoire et la route n'existent comme pièce nulle part, seulement comme symbole imprimé
sur les plateaux et les cartes. Voir `IconImages.ts`.

## Répartition des cartes par période

Déduite des dos (6 fichiers de dos distincts au pixel près, mais 3 visuels : I, II, III).

| Période | Cartes Village (20 / 20 / 9) | Cartes Rencontre (16 / 16 / 9) |
|---|---|---|
| **I** | `Building1-6`, `Companion1-6`, `Item1-8` | `Encounter1-16` |
| **II** | `Building7-12`, `Companion7-11`, `Item9-17` | `Encounter17-32` |
| **III** | `Building13-16`, `Item18-22` | `Encounter33-41` |

## Correspondance jetons Revenu recto / verso

Les 8 jetons Revenu ont un recto et un verso différents ; les paires ont été retrouvées
en miroir sur les planches de punchboard.

| Jeton | Recto | Verso |
|---|---|---|
| 1 | ⚡ + 1 récit | arbre |
| 2 | ⚡ + 2 récits | tonneaux |
| 3 | ⚡ + 1 Force | heaume |
| 4 | ⚡ + 1 pièce | épée |
| 5 | ⚡ + 2 pièces | pioche |
| 6 | ⚡ + 4 pièces | chariot |
| 7 | ⚡ + 1 pièce (bis) | mouton |
| 8 | ⚡ + 1 récit (bis) | licorne |

## Notes

- Les tuiles étaient imbriquées tournées sur les planches de punchboard : elles ont toutes été
  remises dans le sens de lecture (Quêtes pivotées d'un quart de tour, une Événement sur deux à 180°).
- **Trait de découpe magenta** (`#E61672`) : les planches le tracent dans l'inter-tuile, au ras de la
  coupe — franchement visible au verso, où il remplit tout l'espace entre les tuiles. Deux pièges :
  1. Toutes les planches ne sont pas à la même échelle (`GREY 2` porte ses tuiles 1,3 % plus grandes
     que `GREY 1`, `GREY 3` recto est exportée à 300 dpi). Quand il faut rééchelonner, **découper
     avant de rééchantillonner** : hors du masque, chaque pixel prend la couleur du plus proche
     pixel intérieur, puis on réduit. Sinon le filtre mélange le magenta dans le bord de la pièce.
  2. Le repérage impression/découpe varie d'un exemplaire à l'autre sur une même planche. Le dos
     d'Événement de `GREY 3 BACK` en bas à gauche est décalé de 9 px vers le bas : il corrèle
     parfaitement sur l'illustration et déborde quand même dans le magenta. Choisir l'exemplaire en
     comptant le magenta **à l'intérieur du masque**, pas seulement en corrélant l'illustration.
     Celui retenu pour `EventTileBack` est sur `GREY 2 BACK`, à 180°.
- Volontairement absents, sans usage en numérique : le logo-titre, les dos vierges du plateau
  personnel et du plateau Saisons, et le socle du jeton 1er joueur. Ne pas les régénérer.
- Pas de fond de table dédié : la cover (`app/public/cover-1920.jpg`) fait office de fond.
- Les cartes n'existent qu'en **fr** et **en**.
- Aucune icône isolée n'existe (saisons, Force, Magie, Sceau, pièce, récit, blasons de Distance,
  types de carte) : elles ne sont qu'incrustées dans les cartes et les plateaux. Il faudra les
  découper — voir la liste des découpages ci-dessous — ou les redemander.
- `seasons/*` : premier découpage de ce genre, fait pour les `Headers` (bannières fleur, soleil et
  feuille du plateau Saisons, fond parchemin rendu transparent au seuil de saturation). Les autres
  icônes des `Headers` empruntent la pièce réelle qui dit la chose — `pawns/StrengthMarker` pour la
  Force, `pawns/MagicMarker` pour la Magie, `tokens/Coin1` pour une pièce, `pawns/ScoreMarker*` pour
  un PV, `pawns/Villager*1` pour un villageois, `tiles/QuestTileBack` pour une Quête héroïque. À
  remplacer par de vraies icônes quand on les aura.
- **Découpages temporaires**, tous faits de la même façon : fond retiré par écart à la couleur
  médiane du pourtour, couleur d'origine restituée sur les bords antialiasés, pixels isolés du fond
  supprimés. À remplacer par les vraies icônes quand on les aura.

  | Icône | Source | Ce que c'est |
  |---|---|---|
  | `Tilt` | `cards/village/fr/Item2.jpg` (Tommy) | la flèche crochue de l'inclinaison |
  | `PotionDiscarded` | `Item6.jpg` (Potion de mana) | la fiole barrée d'une croix rouge |
  | `Story` | `boards/PlayerBoard.png` | le livre coché de l'action spéciale |
  | `MagicUp` | `boards/PlayerBoard.png` | la gemme de Magie sous un triangle vert |
  | `StrengthUp` | `Building6.jpg` (Forge) | la gemme de Force sous un triangle vert |
  | `StrengthDown` / `MagicDown` | `Building9.jpg` (Salle des héros) | les mêmes sur un triangle rouge |
  | `Move1`, `Move2` | `Item2.jpg` (Tommy) | le cavalier avec sa distance découpée dedans |
  | `Move3`, `Move5` | `Item10.jpg` (Crin blanc) | idem |
  | `Move4` | `Building7.jpg` (Guilde des voyageurs II) | idem |
  | `Withdraw` | `boards/SeasonBoard.png` | le villageois retiré, sous sa flèche crochue (colonne de l'Été) |
  | `SpendVillager` | `cards/encounter/fr/Encounter2.jpg` (Tigre) | le villageois à payer, son 1 découpé dedans ; le 1 creusé est laissé opaque (seul le fond relié au bord est retiré) |
  | `seasons/Winter` | `boards/SeasonBoard.png` | le flocon de la colonne de l'Hiver, alpha progressif sur la saturation |
- `pawns/*` : rendus vectoriels extraits de `MEEPLES GREYLUNE.ai` (fiche de fabrication).
  L'ombre portée directionnelle du gabarit est incrustée dans le dessin d'origine.
