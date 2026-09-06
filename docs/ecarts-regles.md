# Écarts avec le livret de règles

Ce que l'adaptation dit autrement que `app/public/rules-fr.pdf`, et pourquoi. Trois sortes de choses
s'y trouvent :

1. les **écarts de règle**, où le jeu ne fait pas exactement ce que le livret décrit ;
2. les **choix de présentation** des aides de jeu, où la règle est la même mais dite autrement ;
3. les **questions ouvertes**, où le livret est ambigu et où l'implémentation a tranché — à confirmer
   auprès de l'auteur.

Le livret ne nomme aucune carte Village : les noms utilisés dans `app/public/translation/fr.json`
sont relevés sur les cartes elles-mêmes (`app/src/images/cards/village/fr/`). Quelques-uns diffèrent
de la traduction littérale de l'énumération `VillageCard`, qui est anglaise : `SilverWolf` est
« Le loup gris », `ScarletDragon` « Le dragon rouge », `BagOfHolding` « Sac de voyage »,
`Snowmane` « Crin blanc », `HundredLeagueBoots` « Bottes de cent lieues ».

---

## 1. Écarts de règle

### 1.1 Les potions et Ariok agissent à la résolution de la Rencontre, pas au départ

| | |
|---|---|
| **Livret (p.15, p.16)** | « Quand vous partez à l'aventure, vous pouvez défausser cette carte pour… » |
| **Jeu et aides** | « Quand vous résolvez une Rencontre, vous pouvez défausser cette carte pour… » |
| **Cartes** | Potion de mana (206), Potion de force (207), Potion de vol (215), Potion d'invisibilité (217), Ariok (304) |
| **Code** | `TriggerType.ResolveEncounter` (`rules/src/material/Reaction.ts`) |

Ce que ces cartes prêtent — 2 Magie, 2 Force, 1+1, une condition ignorée — ne vaut jamais rien
ailleurs que dans la résolution d'une Rencontre, et rien ne s'apprend entre le moment où l'on quitte
Greylune et celui où l'on arrive sur une case. La fenêtre est donc ouverte à l'arrivée, là où le
joueur voit ce qu'il paie.

Le résultat de jeu est identique, à un détail près, favorable au joueur : celui qui se déplace sans
finalement résoudre de Rencontre n'a pas gaspillé sa potion.

La Potion d'endurance (214) et Elwen (302) restent, elles, sur `TriggerType.Travel` : ce qu'elles
donnent (un villageois posé au Village, 2 cases de plus) se décide bien avant de savoir où l'on
s'arrête.

### 1.2 Le jeton Revenu de la Licorne vaut 1 PV, pas 2

L'annexe (p.18) accorde 2 PV à la Tonnellerie **et** à la Licorne. Les jetons punchés ne peuvent pas
payer les deux : un seul « 2 » est imprimé, et deux « 1 ». Le plateau apparie la Licorne avec un
« 1 », qui est la valeur retenue.

Voir `incomeTokenGains` dans `rules/src/material/Tokens.ts`.

---

## 2. Choix de présentation des aides de jeu

Aucun de ces points ne change une règle ; ils changent la façon de la dire.

- **« PV » est écrit en toutes lettres** plutôt que rendu par l'icône du marqueur de score. À la
  taille du texte, le marqueur de score d'un joueur rouge et le marqueur de Force sont deux disques
  rouges indiscernables. Les bandeaux de tour (`app/src/headers/`) gardent l'icône : là, elle désigne
  vraiment le marqueur qui avance.
- **La rubrique des potions s'appelle « Réaction »**, là où l'annexe écrit « Capacité ». Une potion
  n'a pas de capacité d'été : elle se boit en réponse à quelque chose, exactement comme la réaction
  d'un Compagnon, et l'aide le dit avec le même mot.
- **La clause commune des Tavernes est sortie de la ligne de capacité.** L'annexe répète sur chaque
  Taverne « racontez une ou plusieurs histoires dont la valeur totale de récit est de 3 maximum » ;
  l'aide met cette phrase, et l'explication des paliers, dans une note affichée sur toutes les
  Tavernes, et ne garde sur la ligne de capacité que les récompenses propres à la carte.
- **Chaque type de carte porte une note de rappel** (ce qu'est un Bâtiment, la limite de 3 Objets, le
  villageois offert par un Compagnon) que l'annexe laisse au corps du livret.

---

## 3. Questions ouvertes

### 3.1 Neris — que veut dire « retirer un Villageois » ?

> **Livret (p.14)** — « Quand vous retirez un Villageois, vous pouvez incliner cette carte pour
> gagner 2 pièces supplémentaires ou pour ne pas payer le surcoût. »

**Ce que fait l'implémentation.** `TriggerType.RemoveVillager` est ouvert par les deux actions d'été
qui sortent un de vos Villageois **de la grille du Village** pour l'envoyer au campement :

| Action d'été | Neris répond ? | Où |
|---|---|---|
| Gagner des pièces | oui | `SummerRule.gainCoinsAround` |
| Activer une carte (Bâtiment, Objet ou Compagnon) | oui | `activationTriggers()`, lu par `ActivateCardRule` |
| Participer à l'événement avec un Villageois **du Village** | **non** | `SeasonRule.eventMoves` n'ouvre que `SpendForce` |
| Dépenser un Villageois **actif** pour payer une carte | non | c'est `TriggerType.SpendVillagers`, le déclencheur de Bran |
| Placer un Villageois au printemps | non | rien n'est retiré |

Ce découpage se tient : les deux options de Neris ne valent que là. Le « surcoût » — 1 pièce par
autre Villageois voisin de la carte — n'existe qu'à l'activation d'une carte, et les « 2 pièces
supplémentaires » se lisent naturellement sur *Gagner des pièces*. À l'activation, ces 2 pièces
servent simplement à payer (voir `SummerRule.reliefFor`).

**Reste à confirmer.** Le troisième cas du tableau. Participer à l'événement en été peut prendre un
Villageois qui se trouvait au Village (livret p.7) : ce Villageois est bien « retiré » du Village, et
Neris ne répond pourtant pas. Est-ce voulu ? Deux lectures :

- **non** — « retirer un Villageois » vise toute sortie du Village, événement compris, et Neris
  devrait pouvoir donner ses 2 pièces là aussi (le « surcoût », lui, resterait sans objet) ;
- **oui** — la capacité accompagne les deux actions qui *désignent une carte voisine*, et l'événement
  n'en est pas une.

L'aide de jeu dit aujourd'hui « Quand vous retirez un Villageois **du Village** », ce qui est plus
précis que le livret mais ne tranche pas ce cas.

### 3.2 Mira — que veut dire « après avoir résolu une aventure » ?

> **Livret (p.16)** — « Après avoir résolu une aventure, vous pouvez incliner cette carte pour
> placer un Villageois actif au Village. »

**Ce que fait l'implémentation.** `TriggerType.AfterEncounter` n'est ouvert qu'à un seul endroit :
`ResolveEncounterRule.resolve()`, c'est-à-dire une fois qu'une **carte Rencontre** a effectivement
été résolue et glissée au-dessus du plateau. Donc :

| Situation | Mira répond ? |
|---|---|
| Une carte Rencontre est résolue | oui |
| Deux Rencontres dans le même tour (Tour isolée, Relais : « repartez à l'aventure ») | oui, à chaque fois |
| L'Aventurier se déplace et le joueur passe sans résoudre de Rencontre | non |
| Le joueur prend le bonus de la case au lieu d'une Rencontre (`SkipEncounter`) | non |
| Le joueur accomplit une Haute Fête (`ResolveQuest`) | non |

Autrement dit : « résoudre une aventure » se lit **« résoudre une carte Rencontre »**, et non
« effectuer l'action Partir à l'aventure ». C'est ce que dit l'aide de jeu : « Après avoir résolu une
Rencontre… ».

**Reste à confirmer.** Le mot « aventure » du livret désigne ailleurs l'action de déplacement
(« Partir à l'aventure », p.4). Si l'intention était l'action et non la carte, Mira devrait aussi
répondre à un déplacement resté sans Rencontre — ce qui la rendrait sensiblement plus forte, et ferait
double emploi avec la Potion d'endurance, qui est justement la version « au départ » du même effet.
La lecture retenue est la lecture restrictive, cohérente avec le fait que Mira marque, en fin de
partie, 1 PV par blason différent parmi les **Rencontres résolues**.

---

## Tenir ce document à jour

Un écart qui n'est pas ici est un écart que personne ne retrouvera. Chaque fois qu'une règle est
implémentée autrement que le livret ne l'écrit, ou qu'une ambiguïté est tranchée, la trace se met
ici, et le commentaire du code renvoie au fichier.
