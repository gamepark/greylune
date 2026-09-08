import { Requirement, RequirementType } from '@gamepark/greylune/material/Effect'
import { Fragment, ReactNode } from 'react'
import { CoinIcon, ForceIcon, MagicIcon, VillagerIcon } from './Icons'

/**
 * What an effect asks for, written the way the material writes it: a number and the thing — the
 * mirror of `GainsLabel`, and read the same way.
 *
 * A condition is printed on a card as a symbol with a figure beside it, and that is all a button
 * needs to say to tell one condition from another: whether it is *had* or *spent* is printed on the
 * card the button sits on, and spelled out in its help dialog. The conditions that are a sentence
 * rather than an amount — an Object put back in the box, stories told — have no symbol of their own,
 * and a list with nothing to draw shows the `fallback` instead.
 */
const requirementIcons: Partial<Record<RequirementType, ReactNode>> = {
  [RequirementType.Force]: <ForceIcon />,
  [RequirementType.SpendForce]: <ForceIcon />,
  [RequirementType.Magic]: <MagicIcon />,
  [RequirementType.SpendMagic]: <MagicIcon />,
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

/** "1 <force/>", or "1 <force/> 4 <coin/>" when a condition asks for two things at once. */
export const RequirementsLabel = ({ requirements = [], fallback }: { requirements?: Requirement[]; fallback?: ReactNode }) => {
  const drawn = requirements.filter((requirement) => requirementIcons[requirement.type] !== undefined)
  if (!drawn.length) return <>{fallback}</>
  return (
    <>
      {drawn.map((requirement, index) => (
        <Fragment key={index}>
          {index > 0 && ' '}
          {requirement.count ?? 1} {requirementIcons[requirement.type]}
        </Fragment>
      ))}
    </>
  )
}
