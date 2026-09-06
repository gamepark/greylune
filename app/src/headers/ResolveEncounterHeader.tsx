import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { GainType } from '@gamepark/greylune/material/Effect'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { CustomMoveType } from '@gamepark/greylune/rules/CustomMoveType'
import { ResolveEncounterRule } from '@gamepark/greylune/rules/ResolveEncounterRule'
import { PlayMoveButton, useLegalMove, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { isCustomMoveType } from '@gamepark/rules-api'
import { Trans, useTranslation } from 'react-i18next'
import { CoinIcon, QuestIcon, VpIcon } from './Icons'

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
  if (me === undefined || me !== activePlayer) return <>{t('header.encounter.player', { player })}</>
  const gain = new ResolveEncounterRule(rules.game).spaceGain
  const offer = quest ? 'quest' : !skip ? 'none' : gain?.type === GainType.Vp ? 'vp' : 'coin'
  return (
    <Trans
      i18nKey={`header.encounter.you-${offer}`}
      components={{
        take: <PlayMoveButton move={skip} />,
        quest: <PlayMoveButton move={quest} />,
        pass: <PlayMoveButton move={pass} />,
        coin: <CoinIcon />,
        vp: <VpIcon />,
        crown: <QuestIcon />
      }}
    />
  )
}
