import { Requirement, RequirementType } from '@gamepark/greylune/material/Effect'
import { Fragment, ReactNode } from 'react'
import { CoinIcon, ForceDownIcon, ForceIcon, MagicDownIcon, MagicIcon, SpendVillagerIcon, VillagerIcon } from './Icons'

/**
 * What an effect asks for, written the way the material writes it: a number and the thing — the
 * mirror of `GainsLabel`, and read the same way.
 *
 * A condition is printed on a card as a symbol with a figure beside it, and that is all a button
 * needs to say to tell one condition from another. Whether it is *had* or *spent* is in the symbol
 * itself for the two tracks — a bare gem is a level to have reached, the same gem over a red arrow is
 * a step down it — and the arrow being the step, no 1 is written in front of it, which is how the
 * cards print it. The conditions that are a sentence rather than an amount — an Object put back in
 * the box, stories told — have no symbol of their own, and a list with nothing to draw shows the
 * `fallback` instead.
 */
const requirementIcons: Partial<Record<RequirementType, ReactNode>> = {
  [RequirementType.Force]: <ForceIcon />,
  [RequirementType.Magic]: <MagicIcon />,
  /** Spent rather than had: the same gem drawn over a red arrow, which is the step down the track. */
  [RequirementType.SpendForce]: <ForceDownIcon />,
  [RequirementType.SpendMagic]: <MagicDownIcon />,
  /** Force and Magic added together: the card prints both gems, and so does this. */
  [RequirementType.Skills]: (
    <>
      <ForceIcon />
      <MagicIcon />
    </>
  ),
  [RequirementType.SpendCoins]: <CoinIcon />,
  [RequirementType.SealCoins]: <CoinIcon />,
  [RequirementType.SpendVillagers]: <VillagerIcon />,
  [RequirementType.ReturnVillager]: <VillagerIcon />
}

/**
 * The symbols that are a single one by themselves, drawn instead of "1 <symbol/>": a step down a
 * track is one step, and the arrow drawn on the gem is what says so; one Villager paid has its 1 cut
 * into the figure.
 */
const singleIcons: Partial<Record<RequirementType, ReactNode>> = {
  [RequirementType.SpendForce]: <ForceDownIcon />,
  [RequirementType.SpendMagic]: <MagicDownIcon />,
  [RequirementType.SpendVillagers]: <SpendVillagerIcon />
}

const singleIcon = (requirement: Requirement): ReactNode => ((requirement.count ?? 1) === 1 ? singleIcons[requirement.type] : undefined)

/**
 * "1 <coin/>", or "<force-down/> 4 <coin/>" when a condition asks for two things at once. `suffix` is
 * whatever the condition is followed by when there is one to draw — an arrow to what it buys, say —
 * and goes with it when there is not, rather than being left hanging after nothing.
 */
export const RequirementsLabel = ({ requirements = [], fallback, suffix }: { requirements?: Requirement[]; fallback?: ReactNode; suffix?: ReactNode }) => {
  const drawn = requirements.filter((requirement) => requirementIcons[requirement.type] !== undefined)
  if (!drawn.length) return <>{fallback}</>
  return (
    <>
      {drawn.map((requirement, index) => (
        <Fragment key={index}>
          {index > 0 && ' '}
          {singleIcon(requirement) ?? (
            <>
              {requirement.count ?? 1} {requirementIcons[requirement.type]}
            </>
          )}
        </Fragment>
      ))}
      {suffix}
    </>
  )
}
