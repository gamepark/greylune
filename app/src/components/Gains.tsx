import { Gain, GainType, SEAL } from '@gamepark/greylune/material/Effect'
import { ReactNode } from 'react'
import { Trans } from 'react-i18next'
import { CoinIcon, ForceUpIcon, MagicUpIcon, StoryIcon, TravelIcon, VillagerIcon, VpIcon } from './Icons'

/**
 * What an effect hands over, drawn the way the material draws it.
 *
 * Some gains are a sentence — a card straightened, points counted on what the player owns — and those
 * are spelled out one by one in the translation files. The rest are a symbol, and the box has two
 * kinds. Coins, points and Villagers are a symbol for a thing, and a figure in front says how many.
 * The road and the two tracks are not: the distance is cut into the rider itself, one drawing per
 * distance, and a track going up is the gem drawn under a green arrow, which is the symbol for one
 * step. Those carry their own amount, and a figure in front of them would say it twice.
 */
const gainIcon = (gain: Gain): ReactNode | undefined => {
  switch (gain.type) {
    case GainType.Coins:
      return <CoinIcon />
    case GainType.Vp:
      return <VpIcon />
    case GainType.Villager:
      return <VillagerIcon />
    case GainType.Force:
      return <ForceUpIcon />
    case GainType.Magic:
      return <MagicUpIcon />
    /** Force or Magic, the player choosing which: the 2 arrows with a stroke between them, which says "or". */
    case GainType.Skill:
      return (
        <>
          <ForceUpIcon />/<MagicUpIcon />
        </>
      )
    /** Every distance the box prints has a rider of its own; only one read off a Seal has none. */
    case GainType.Travel:
      return <TravelIcon count={typeof gain.count === 'number' ? gain.count : undefined} />
    case GainType.TellStory:
      return <StoryIcon />
    default:
      return undefined
  }
}

/**
 * Whether the drawing already says how many. The rider does, the book has nothing to count, and an
 * arrow on a track means one step — but a single card in the box hands over 2 Magic at once, and 2
 * steps are not what one arrow says, so an amount that is not 1 is written out after all.
 */
const saysItsOwnCount = (gain: Gain): boolean => {
  switch (gain.type) {
    case GainType.Travel:
    case GainType.TellStory:
    case GainType.Skill:
      return true
    case GainType.Force:
    case GainType.Magic:
      return gain.count === 1
    default:
      return false
  }
}

/** One gain: "2 <vp/>", or the rider carrying its own 2. A count read off a Seal is a figure nobody knows yet. */
export const GainLabel = ({ gain }: { gain: Gain }) => (
  <>
    {'count' in gain && gain.count !== SEAL && !saysItsOwnCount(gain) ? `${gain.count} ` : ''}
    {gainIcon(gain)}
  </>
)

/**
 * A whole list of them: "1 <magic/> et 2 <vp/>". The only thing left to translate is what joins the
 * two, which is why the list stops at a pair — no printed effect of the box hands over three things
 * that a figure and a symbol can say on their own.
 *
 * An effect with nothing to draw — points counted on what the player owns — is drawn as nothing at
 * all rather than as a figure with no symbol after it, and `prefix` goes with it: whatever leads into
 * the gains, an arrow from what they cost say, has nothing to lead into. A caller that cannot show
 * an empty label — a button has to say something — passes the `fallback` to show in its stead.
 */
export const GainsLabel = ({ gains, prefix, fallback }: { gains: Gain[]; prefix?: ReactNode; fallback?: ReactNode }) => {
  const drawn = gains.filter((gain) => gainIcon(gain) !== undefined)
  if (!drawn.length) return <>{fallback}</>
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
