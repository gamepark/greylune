/** @jsxImportSource @emotion/react */
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { Seal } from '@gamepark/greylune/material/Tokens'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { MaterialHelpProps } from '@gamepark/react-game'
import { Trans, useTranslation } from 'react-i18next'
import { colors } from '../../theme/colors'
import { HelpFact, HelpFacts, HelpNote, HelpSection, HelpTitle, helpDialogCss, helpTexts } from './HelpLayout'

/**
 * A Seal token. Its value is its id, which a token of the face-down stack does not show. What it is
 * for depends on the card it lies on, a Building exploited or an Object bought, so both are said in
 * the rulebook's words (p.8).
 */
export const SealHelp = ({ item }: MaterialHelpProps<PlayerColor, MaterialType, LocationType>) => {
  const { t } = useTranslation()
  const seal = item.id as Seal | undefined

  return (
    <div css={helpDialogCss}>
      <HelpTitle accent={colors.gold} name={t('help.seal.name')} />

      {seal !== undefined && (
        <HelpFacts>
          <HelpFact label={t('help.seal.value')}>{seal}</HelpFact>
        </HelpFacts>
      )}

      <HelpSection title={t('help.type.1.name')}>
        <Trans i18nKey="help.seal.building" components={helpTexts} />
      </HelpSection>
      <HelpSection title={t('help.type.2.name')}>
        <Trans i18nKey="help.seal.item" components={helpTexts} />
      </HelpSection>
      <HelpNote>
        <Trans i18nKey="help.seal.stack" components={helpTexts} />
      </HelpNote>
    </div>
  )
}
