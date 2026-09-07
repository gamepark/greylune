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
| `seasons` | `Spring`, `Summer`, `Autumn` : bannières découpées dans `boards/SeasonBoard.png` |
| `icons` | symboles isolés (`Gold`, `Magic`, `Move`, `Strength`, `VictoryPoint`, `Villager`) — **provisoires** |

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
- Volontairement absents, sans usage en numérique : le logo-titre, les dos vierges du plateau
  personnel et du plateau Saisons, et le socle du jeton 1er joueur. Ne pas les régénérer.
- Pas de fond de table dédié : la cover (`app/public/cover-1920.jpg`) fait office de fond.
- Les cartes n'existent qu'en **fr** et **en**.
- Aucune icône isolée n'existe (saisons, Force, Magie, Sceau, pièce, récit, blasons de Distance,
  types de carte) : elles ne sont qu'incrustées dans les cartes et les plateaux. Il faudra les
  découper ou les redemander pour les `Headers`, l'aide et les `PlayerPanels`.
- `seasons/*` : premier découpage de ce genre, fait pour les `Headers` (bannières fleur, soleil et
  feuille du plateau Saisons, fond parchemin rendu transparent au seuil de saturation). Les autres
  icônes des `Headers` empruntent la pièce réelle qui dit la chose — `pawns/StrengthMarker` pour la
  Force, `pawns/MagicMarker` pour la Magie, `tokens/Coin1` pour une pièce, `pawns/ScoreMarker*` pour
  un PV, `pawns/Villager*1` pour un villageois, `tiles/QuestTileBack` pour une Quête héroïque. À
  remplacer par de vraies icônes quand on les aura.
- `pawns/*` : rendus vectoriels extraits de `MEEPLES GREYLUNE.ai` (fiche de fabrication).
  L'ombre portée directionnelle du gabarit est incrustée dans le dessin d'origine.
