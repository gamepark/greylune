/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { Trans, useTranslation } from 'react-i18next'
import { HelpTitle, helpDialogCss, helpTexts } from '../material/help/HelpLayout'
import { colors } from '../theme/colors'

/**
 * The (?) at the end of the Summer bar (see {@link SummerHeader}): why Autumn is not on offer while a
 * Villager still stands in the Village. The first sentence is the rulebook's own (p.9); the second is
 * the one of the Camp (see {@link SeasonBoardHelp}), which says where a Villager leaving the Village
 * goes — what the player has to do before the season can move on.
 */
export const SummerRulesHelp = () => {
  const { t } = useTranslation()
  return (
    <div css={helpDialogCss}>
      <HelpTitle accent={colors.gold} name={t('help.autumn-condition.name')} />
      <p css={paragraphCss}>
        <Trans i18nKey="help.autumn-condition.text" components={helpTexts} />
      </p>
      <p css={paragraphCss}>
        <Trans i18nKey="help.autumn-condition.camp" components={helpTexts} />
      </p>
    </div>
  )
}

const paragraphCss = css`
  margin: 0;
  line-height: 1.45;
`
