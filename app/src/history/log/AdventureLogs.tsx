/** @jsxImportSource @emotion/react */
import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { Area } from '@gamepark/greylune/material/Area'
import { EncounterCardId } from '@gamepark/greylune/material/EncounterCard'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { IncomeToken } from '@gamepark/greylune/material/Tokens'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { ResolveEncounterRule } from '@gamepark/greylune/rules/ResolveEncounterRule'
import { RuleId } from '@gamepark/greylune/rules/RuleId'
import { TellStoryRule } from '@gamepark/greylune/rules/TellStoryRule'
import { MaterialLogProps, usePlayerName } from '@gamepark/react-game'
import { CustomMove, MoveItem } from '@gamepark/rules-api'
import { StoryValueIcon } from '../../components/Icons'
import { areaImages } from '../../images/AreaImages'
import { adventurerImages } from '../../images/PawnImages'
import { incomeTokenImages } from '../../images/TokenImages'
import { logIconCss } from '../logCss'
import { LogText } from '../LogText'
import { EncounterCardName, PiecePicture, QuestTileName, TokenPicture } from '../MaterialLinks'

/** The road, and what is met at the end of it: an Encounter, a Heroic Quest, or what the space pays instead. Then the stories told of it. */

/** The Adventurer in the colour of its player, walking in their sentence. */
const Adventurer = ({ player }: { player?: PlayerColor }) => <PiecePicture src={player === undefined ? undefined : adventurerImages[player]} />

/**
 * The Adventurer walks to another space. The spaces bear no name, only the banner they fly on the
 * board, which their Encounters print too: that is what the sentence shows. Greylune flies none, and
 * is named in words.
 */
export const TravelLog = ({ move, context }: MaterialLogProps<MoveItem>) => {
  const owner = new GreyluneRules(context.game).material(MaterialType.Adventurer).getItem<PlayerColor>(move.itemIndex).id
  const player = usePlayerName(owner)
  const area = move.location.id as Area
  return (
    <LogText
      code={area === Area.Village ? 'log.travel-home' : 'log.travel'}
      values={{ player }}
      components={{
        adventurer: <Adventurer player={owner} />,
        area: <PiecePicture src={area === Area.Village ? undefined : areaImages[area]} />
      }}
    />
  )
}

/** Staying put is a journey of its own: the Encounter of the space is resolved all the same. */
export const StayLog = ({ context }: MaterialLogProps<CustomMove>) => {
  const owner = context.game.rule?.player
  const player = usePlayerName(owner)
  return <LogText code="log.stay" values={{ player }} components={{ adventurer: <Adventurer player={owner} /> }} />
}

/**
 * The Encounter named. Written down as it is named rather than as it slides under the board, which is
 * after its price has been paid: the price then reads under the card it pays for.
 */
export const EncounterLog = ({ move, context }: MaterialLogProps<CustomMove>) => {
  const player = usePlayerName(context.game.rule?.player)
  const id = new GreyluneRules(context.game).material(MaterialType.EncounterCard).getItem<EncounterCardId>(move.data as number).id
  return <LogText code="log.encounter" values={{ player }} components={{ card: <EncounterCardName id={id} /> }} />
}

/** The Encounters of the space turned down for the coin or the point it pays instead, written down under this. */
export const SkipEncounterLog = ({ context }: MaterialLogProps<CustomMove>) => {
  const player = usePlayerName(context.game.rule?.player)
  return <LogText code="log.skip-encounter" values={{ player }} />
}

/** A space with nothing the player can pay for, nor anything to pay them instead. */
export const NoEncounterLog = ({ context }: MaterialLogProps<CustomMove>) => {
  const player = usePlayerName(context.game.rule?.player)
  return <LogText code="log.no-encounter" values={{ player }} />
}

/**
 * A Heroic Quest achieved. What it is worth is counted at the end of the game, and depends on being the
 * first one there, which is what the sentence says. Its price is written down under it.
 */
export const QuestLog = ({ context }: MaterialLogProps<CustomMove>) => {
  const player = usePlayerName(context.game.rule?.player)
  const rule = new ResolveEncounterRule(context.game)
  const space = rule.questSpace
  if (space === undefined) return null
  const tile = rule.material(MaterialType.QuestTile).location(LocationType.QuestTileSpace).locationId(space).getItem()
  const first = !rule.material(MaterialType.QuestMarker).location(LocationType.QuestRewardSpace).locationId(space).length
  return <LogText code={first ? 'log.quest-first' : 'log.quest'} values={{ player }} components={{ quest: <QuestTileName item={tile} /> }} />
}

/** The Income token the Encounter carried: it pays now, and again every Autumn. What it pays is written down under it. */
export const IncomeTokenLog = ({ move, context }: MaterialLogProps<MoveItem>) => {
  const player = usePlayerName(move.location.player)
  const token = new GreyluneRules(context.game).material(MaterialType.IncomeToken).getItem<IncomeToken>(move.itemIndex)
  return (
    <LogText
      code="log.income-token"
      values={{ player }}
      components={{ token: <TokenPicture type={MaterialType.IncomeToken} item={{ id: token.id }} src={incomeTokenImages[token.id]} /> }}
    />
  )
}

/**
 * An Encounter slid over to the told stories. In a Tavern, what it is worth is what the story pays on —
 * a card Seren or a Charisma potion made a 3 is told as a 3 — so the sentence says it. The Tournoi des
 * Bardes asks for 2 Encounters whatever they are worth, and there it would say nothing.
 */
export const TellStoryLog = ({ move, context }: MaterialLogProps<MoveItem>) => {
  const player = usePlayerName(move.location.player)
  const id = new GreyluneRules(context.game).material(MaterialType.EncounterCard).getItem<EncounterCardId>(move.itemIndex).id
  const card = <EncounterCardName id={id} />
  if (context.game.rule?.id !== RuleId.TellStory) return <LogText code="log.quest-story" values={{ player }} components={{ card }} />
  const value = new TellStoryRule(context.game).addedValue(move.itemIndex)
  return <LogText code="log.tell-story" values={{ player }} components={{ card, value: <StoryValueIcon value={value} css={logIconCss} /> }} />
}
