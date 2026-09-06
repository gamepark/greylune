import { RuleId } from '@gamepark/greylune/rules/RuleId'
import { HeaderText } from '@gamepark/react-game'
import { ComponentType } from 'react'
import { Trans } from 'react-i18next'
import { BonusTokenHeader } from './BonusTokenHeader'
import { ChooseSkillHeader } from './ChooseSkillHeader'
import { VillagerIcon } from './Icons'
import { ReactionHeader } from './ReactionHeader'
import { ResolveEncounterHeader } from './ResolveEncounterHeader'
import { ResolveQuestHeader } from './ResolveQuestHeader'
import { SpringHeader } from './SpringHeader'
import { SummerHeader } from './SummerHeader'
import { TellStoryHeader } from './TellStoryHeader'
import { TravelHeader } from './TravelHeader'

/**
 * What the players read above the table, one step of the rules at a time.
 *
 * The bar holds a single line that never wraps and is cut off with an ellipsis, so every sentence
 * here is one short clause: what to do, and nothing about why. It carries no full stop — a bar is a
 * label rather than prose, and the line ends where it ends. Whatever the box has a piece for is
 * shown as that piece (see {@link VillagerIcon} and the rest), which is what keeps a sentence that
 * fits in French fitting in German too.
 *
 * A choice is offered as a button only when there is nothing on the table to click for it: passing,
 * moving on to the next season, taking what a space of the road offers instead of an Encounter. Every
 * other decision is made on the material itself, where a player who reads the table first will look.
 *
 * A button is written into the clause rather than tacked on after it — "Placez un villageois ou passez
 * à l'été" — so the bar reads as one sentence and the alternatives read as alternatives. Each sentence
 * is written whole, conjunction included, and a rule that offers different things in different places
 * gets one sentence per offer rather than a stem with clauses hung off it: what a translator can read
 * from end to end, they can put in the order their own language wants. The only two that cannot be
 * written that way are the ones whose alternatives are the pieces themselves (see {@link Alternatives}).
 *
 * Five rules are missing on purpose. {@link RuleId.Autumn}, {@link RuleId.Event},
 * {@link RuleId.UseItem} and {@link RuleId.ResolveEffects} ask nobody anything and hand the turn on
 * the moment they start, so a header would only ever flash; {@link RuleId.Winter} does the same, and
 * is named all the same because a new year is worth announcing.
 */
export const Headers: Partial<Record<RuleId, ComponentType>> = {
  // ------------------------------------------------------------------ the four seasons
  [RuleId.Winter]: () => <Trans i18nKey="header.winter" />,
  [RuleId.Spring]: SpringHeader,
  [RuleId.Summer]: SummerHeader,

  // ------------------------------------------------------------------ what an action leaves to decide
  [RuleId.ActivateCard]: () => <HeaderText code="activate-card" />,
  [RuleId.DiscardItem]: () => <HeaderText code="discard-item" />,
  [RuleId.Travel]: TravelHeader,
  [RuleId.ResolveEncounter]: ResolveEncounterHeader,
  [RuleId.ResolveQuest]: ResolveQuestHeader,
  [RuleId.TellStory]: TellStoryHeader,
  [RuleId.StraightenCard]: () => <HeaderText code="straighten" />,
  [RuleId.PlaceVillager]: () => <HeaderText code="place-villager" components={{ villager: <VillagerIcon /> }} />,
  [RuleId.ChooseSkill]: ChooseSkillHeader,
  [RuleId.BonusToken]: BonusTokenHeader,
  [RuleId.Reaction]: ReactionHeader
}
