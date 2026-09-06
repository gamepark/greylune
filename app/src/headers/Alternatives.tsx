import { ReactNode } from 'react'
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * The tail of a header sentence whose alternatives are buttons: "Gagnez 1 Force ou 1 Magie".
 *
 * A button is part of the clause rather than a control tacked on after it, so it is strung on with
 * the same conjunction as any other alternative. Almost every header writes its own sentence whole,
 * conjunction included, which is what lets a translator put it in the order their language wants;
 * this is for the two where that is not possible, because what is offered is a list of unknown length
 * whose members are the pieces themselves — the skill a track has not maxed out yet, the Bonus tokens
 * a player has left. There is nothing to word there, so there is nothing to word around.
 *
 * Anything falsy is dropped, so a caller lists every alternative it could ever offer and lets the
 * moves decide which ones are there.
 */
export const Alternatives = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation()
  const alternatives = (Array.isArray(children) ? children : [children]).filter(Boolean)
  return (
    <>
      {alternatives.map((alternative, index) => (
        <Fragment key={index}>
          {index > 0 && <> {t('header.or')}</>} {alternative}
        </Fragment>
      ))}
    </>
  )
}
