/** @jsxImportSource @emotion/react */
import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { BonusToken, Seal } from '@gamepark/greylune/material/Tokens'
import { VillageCardId } from '@gamepark/greylune/material/VillageCard'
import { ChooseAbilityData } from '@gamepark/greylune/rules/ActivateCardRule'
import { GreyluneMove, ReactionChoice } from '@gamepark/greylune/rules/GreyluneRule'
import { MaterialLogProps, usePlayerName } from '@gamepark/react-game'
import { CustomMove, DeleteItem, MoveItem } from '@gamepark/rules-api'
import { bonusTokenImages, sealImages } from '../../images/TokenImages'
import { coinRow, villagerRowCount } from '../logRows'
import { LogText } from '../LogText'
import { PiecePicture, TokenPicture, VillageCardName } from '../MaterialLinks'

/** What an action comes to, one thing at a time: what is gained, what is paid, and the cards and tokens that are spent on it. */

/** Coins gained, in one amount: the coins of 5 and of 1 they are counted out in say nothing anyone wants to read. */
export const GainCoinsLog = ({ move, context }: MaterialLogProps<CustomMove>) => {
  const player = usePlayerName(context.game.rule?.player)
  return <LogText code="log.gain-coins" values={{ player, count: move.data }} />
}

/** Victory points gained, in one amount: the marker, the token of the laps and the Bonus tokens they call for follow. */
export const GainVpLog = ({ move, context }: MaterialLogProps<CustomMove>) => {
  const player = usePlayerName(context.game.rule?.player)
  return <LogText code="log.gain-vp" values={{ player, count: move.data }} />
}

/**
 * Coins that change hands without a gain being named for them: a price paid, or the coins a Companion
 * adds on the spot. Several moves, written down once as what they add up to (see {@link coinRow}).
 */
export const CoinRowLog = ({ move, context }: MaterialLogProps<GreyluneMove>) => {
  const { player: owner, total } = coinRow(move, context, new GreyluneRules(context.game))
  const player = usePlayerName(owner)
  return <LogText code={total > 0 ? 'log.gain-coins' : 'log.pay-coins'} values={{ player, count: Math.abs(total) }} />
}

/** Force or Magic, a step up the track or a step down it: gained, or spent on a price. */
export const SkillLog = ({ move, context }: MaterialLogProps<MoveItem>) => {
  const marker = new GreyluneRules(context.game).material(move.itemType).getItem(move.itemIndex)
  const player = usePlayerName(marker.location.player)
  const steps = (move.location.x ?? 0) - (marker.location.x ?? 0)
  const skill = move.itemType === MaterialType.StrengthMarker ? 'force' : 'magic'
  return <LogText code={`log.${steps > 0 ? 'gain' : 'spend'}-${skill}`} values={{ player, count: Math.abs(steps) }} />
}

const VillagerRowLog = ({ move, context, code }: MaterialLogProps<GreyluneMove> & { code: string }) => {
  const { player: owner, count } = villagerRowCount(move, context, new GreyluneRules(context.game))
  const player = usePlayerName(owner)
  return <LogText code={code} values={{ player, count }} />
}

/** Villagers out of the reserve: a Companion recruited, an Encounter, a Tavern. */
export const GainVillagersLog = (props: MaterialLogProps<GreyluneMove>) => <VillagerRowLog {...props} code="log.gain-villagers" />

/** Villagers spent on a price: they rest in the camp until Autumn. */
export const SpendVillagersLog = (props: MaterialLogProps<GreyluneMove>) => <VillagerRowLog {...props} code="log.spend-villagers" />

/** A Villager given back to the reserve, which only the Piège mortel asks for. */
export const ReturnVillagersLog = (props: MaterialLogProps<GreyluneMove>) => <VillagerRowLog {...props} code="log.return-villagers" />

/** The Seal taken off the card being activated: what the card gives or costs may be read off its value. */
export const SealLog = ({ move, context }: MaterialLogProps<MoveItem>) => {
  const player = usePlayerName(context.game.rule?.player)
  const seal = new GreyluneRules(context.game).material(MaterialType.Seal).getItem<Seal>(move.itemIndex).id
  return (
    <LogText code="log.seal" values={{ player }} components={{ seal: <TokenPicture type={MaterialType.Seal} item={{ id: seal }} src={sealImages[seal]} /> }} />
  )
}

/** Selia lets the player name the value the Seal is spent at, whatever is printed on it. */
export const SealValueLog = ({ move, context }: MaterialLogProps<CustomMove>) => {
  const player = usePlayerName(context.game.rule?.player)
  const value = (move.data as ChooseAbilityData).value as Seal
  return <LogText code="log.seal-value" values={{ player }} components={{ seal: <PiecePicture src={sealImages[value]} /> }} />
}

const villageCard = (context: MaterialLogProps['context'], index: number) =>
  new GreyluneRules(context.game).material(MaterialType.VillageCard).getItem<VillageCardId>(index)

/** A Companion tilted, or a Potion emptied, to answer what is happening. What it does is written down under it when it gives anything. */
export const ReactionLog = ({ move, context }: MaterialLogProps<CustomMove>) => {
  const player = usePlayerName(context.game.rule?.player)
  const { card } = move.data as ReactionChoice
  return <LogText code="log.reaction" values={{ player }} components={{ card: <VillageCardName id={villageCard(context, card).id} /> }} />
}

/** A tilted card stands back up, ready to be used again this year. */
export const StraightenLog = ({ move, context }: MaterialLogProps<MoveItem>) => {
  const card = villageCard(context, move.itemIndex)
  const player = usePlayerName(card.location.player)
  return <LogText code="log.straighten" values={{ player }} components={{ card: <VillageCardName id={card.id} /> }} />
}

/** An Object put back in the box: one too many, or the Donation. */
export const DiscardItemLog = ({ move, context }: MaterialLogProps<DeleteItem>) => {
  const card = villageCard(context, move.itemIndex)
  const player = usePlayerName(card.location.player)
  return <LogText code="log.discard-item" values={{ player }} components={{ card: <VillageCardName id={card.id} /> }} />
}

/** Crossing 8 points, then 20: the Bonus token picked. What it pays is written down under it. */
export const BonusTokenLog = ({ move, context }: MaterialLogProps<DeleteItem>) => {
  const token = new GreyluneRules(context.game).material(MaterialType.BonusToken).getItem<BonusToken>(move.itemIndex)
  const player = usePlayerName(token.location.player)
  const src = token.id === undefined ? undefined : bonusTokenImages[token.id]
  const item = { id: token.id, location: { type: LocationType.BonusTokens, player: token.location.player } }
  return <LogText code="log.bonus-token" values={{ player }} components={{ token: <TokenPicture type={MaterialType.BonusToken} item={item} src={src} /> }} />
}
