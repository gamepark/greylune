/** @jsxImportSource @emotion/react */
import { Effect, gathered, isCheck } from '@gamepark/greylune/material/Effect'
import { ReactNode } from 'react'
import { GainsLabel } from './Gains'
import { RequirementsLabel } from './Requirements'
import { parchmentArrowCss } from '../theme/parchment'

/** What the cards print between a price and what it buys, and what a button says it with. */
export const EffectArrow = () => <span css={parchmentArrowCss}>→</span>

/**
 * What a button offers, the way the card prints it: what pressing it takes, an arrow, and what it
 * hands over. No word at all — the figures and the symbols of the material say it in every language
 * at once, which is why every button offering an effect wears this and nothing else.
 *
 * Only what is really taken is drawn. A condition read off the player's own boards — 1 Force to face
 * the Vallée, 3 Magic to open the Trésor — takes nothing from them, and a button can only be pressed
 * by someone who already meets it, so naming it would be naming a price that is not one: the Vallée
 * of a player standing on 1 Force says "2 <travel/>", and it is only the Villager on its other side
 * that ever turns the button into "<spend-villager/> → 2 <travel/> 3 <vp/>". What is paid twice is asked
 * for once, exactly as it is taken ({@link gathered}): both halves of the Labyrinthe cost "2
 * <villager/>", not a Villager and then another.
 *
 * What has no symbol of its own is left out on both sides — a card tilted, an Object given up, points
 * counted on what the player owns — and the arrow goes with the price when there is no price to draw,
 * rather than being left hanging after nothing. An effect with nothing to draw at all shows the
 * `fallback` a button that has to say something passes, and nothing where a blank reads fine.
 */
export const EffectLabel = ({ requirements = [], gains = [], fallback }: Effect & { fallback?: ReactNode }) => (
  <GainsLabel
    gains={gains}
    fallback={fallback}
    prefix={<RequirementsLabel requirements={gathered(requirements.filter((requirement) => !isCheck(requirement)))} suffix={<EffectArrow />} />}
  />
)
