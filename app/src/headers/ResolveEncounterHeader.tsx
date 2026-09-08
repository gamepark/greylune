/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { GainType } from '@gamepark/greylune/material/Effect'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { CustomMoveType } from '@gamepark/greylune/rules/CustomMoveType'
import { ResolveEncounterRule } from '@gamepark/greylune/rules/ResolveEncounterRule'
import { Dialog, PlayMoveButton, ThemeButton, useLegalMove, usePlayerId, usePlayerName, useRules, useUndo } from '@gamepark/react-game'
import { isCustomMoveType } from '@gamepark/rules-api'
import { Trans, useTranslation } from 'react-i18next'
import { CoinIcon, QuestIcon, VpIcon } from '../components/Icons'

/**
 * The Adventurer has stopped out of Greylune (see {@link ResolveEncounterRule}). The Encounters of the
 * row are on the table and are taken there; what the space itself offers instead is not, so it is
 * written into the sentence as the alternative it is.
 *
 * What the space offers changes with the space: only the Wand pays a coin and only the Bow a point to
 * a player who resolves nothing, and only the three farthest ones carry a Heroic Quest — never both,
 * since no space is at once one of the two nearest and one of the three farthest. So there is one
 * sentence per offer rather than a stem with clauses hung off it: a sentence a translator can read
 * whole is a sentence they can put in the order their language wants.
 *
 * The moves are the reader's own, so an opponent and a spectator get the one sentence that says what
 * is being waited for, and no buttons at all.
 */
export const ResolveEncounterHeader = () => {
  const { t } = useTranslation()
  const rules = useRules<GreyluneRules>()!
  const me = usePlayerId<PlayerColor>()
  const activePlayer = rules.game.rule?.player
  const player = usePlayerName(activePlayer)
  const skip = useLegalMove(isCustomMoveType(CustomMoveType.SkipEncounter))
  const quest = useLegalMove(isCustomMoveType(CustomMoveType.ResolveQuest))
  const pass = useLegalMove(isCustomMoveType(CustomMoveType.Pass))
  const [undo, canUndo] = useUndo()
  if (me === undefined || me !== activePlayer) return <>{t('header.encounter.player', { player })}</>
  const gain = new ResolveEncounterRule(rules.game).spaceGain
  const offer = quest ? 'quest' : !skip ? 'none' : gain?.type === GainType.Vp ? 'vp' : 'coin'
  return (
    <>
      <Trans
        i18nKey={`header.encounter.you-${offer}`}
        components={{
          take: <PlayMoveButton move={skip} />,
          quest: <PlayMoveButton move={quest} />,
          coin: <CoinIcon />,
          vp: <VpIcon />,
          crown: <QuestIcon />
        }}
      />
      {/*
       * Passing is legal only where nothing else is (see {@link ResolveEncounterRule.getPlayerMoves}),
       * so its being offered at all is the news: the player has walked into a space that owes them
       * nothing. A sentence in the bar would leave them looking for the move it talks about, so it is
       * said here, over the table, where the only two ways out of it are the two buttons — take the
       * journey back, or take note and end the action.
       */}
      <Dialog open={!!pass}>
        <div css={dialogCss}>
          <p>{t('header.encounter.nothing')}</p>
          <div css={buttonsCss}>
            <ThemeButton onClick={() => undo()} disabled={!canUndo()}>
              {t('cancel')}
            </ThemeButton>
            <PlayMoveButton move={pass}>{t('ok')}</PlayMoveButton>
          </div>
        </div>
      </Dialog>
    </>
  )
}

/** The bar is written small; a dialog is read at the size of the table, like every other one. */
const dialogCss = css`
  font-size: calc(3em * var(--gp-scale));
  max-width: 20em;

  p {
    margin: 0 0 1em;
  }
`

const buttonsCss = css`
  display: flex;
  justify-content: space-between;
  gap: 1em;
`
