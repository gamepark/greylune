import { Gain, GainType, SEAL } from '@gamepark/greylune/material/Effect'
import { ReactNode } from 'react'
import { Trans } from 'react-i18next'
import { CoinIcon, ForceIcon, MagicIcon, TravelIcon, VillagerIcon, VpIcon } from './Icons'

/**
 * What an effect hands over, written the way the material writes it: a number and the thing.
 *
 * Some gains are a sentence — a card straightened, a story told, points counted on what the player
 * owns — and those are spelled out one by one in the translation files. The rest are an amount of
 * something the box has a symbol for, and a symbol with a figure in front of it says all there is to
 * say about them, in every language at once. This is those.
 */
const gainIcons: Partial<Record<GainType, ReactNode>> = {
  [GainType.Coins]: <CoinIcon />,
  [GainType.Vp]: <VpIcon />,
  [GainType.Force]: <ForceIcon />,
  [GainType.Magic]: <MagicIcon />,
  /**
   * Force or Magic, the player choosing which: the 2 gems with a stroke between them. Side by side
   * they mean both of them — that is how `GainsLabel` writes a pair — so the stroke is what tells the
   * choice from the pair, and it says it without a word in any language.
   */
  [GainType.Skill]: (
    <>
      <ForceIcon />/<MagicIcon />
    </>
  ),
  [GainType.Villager]: <VillagerIcon />,
  [GainType.Travel]: <TravelIcon />
}

/** One gain: "2 <vp/>". */
export const GainLabel = ({ gain }: { gain: Gain }) => (
  <>
    {'count' in gain && gain.count !== SEAL ? `${gain.count} ` : ''}
    {gainIcons[gain.type]}
  </>
)

/**
 * A whole list of them: "1 <magic/> et 2 <vp/>". The only thing left to translate is what joins the
 * two, which is why the list stops at a pair — no printed effect of the box hands over three things
 * that a figure and a symbol can say on their own.
 *
 * An effect with nothing to draw — points counted on what the player owns, a story to be told — is
 * drawn as nothing at all rather than as a figure with no symbol after it, and `prefix` goes with it:
 * whatever leads into the gains, an arrow from what they cost say, has nothing to lead into.
 */
export const GainsLabel = ({ gains, prefix }: { gains: Gain[]; prefix?: ReactNode }) => {
  const drawn = gains.filter((gain) => gainIcons[gain.type] !== undefined)
  if (!drawn.length) return null
  return (
    <>
      {prefix}
      {drawn.length > 1 ? (
        <Trans i18nKey="gains" components={{ gain1: <GainLabel gain={drawn[0]} />, gain2: <GainLabel gain={drawn[1]} /> }} />
      ) : (
        <GainLabel gain={drawn[0]} />
      )}
    </>
  )
}
