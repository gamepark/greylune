/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { GreyluneRules } from '@gamepark/greylune/GreyluneRules'
import { LocationType } from '@gamepark/greylune/material/LocationType'
import { MaterialType } from '@gamepark/greylune/material/MaterialType'
import { getVillagerPlayer, Villager } from '@gamepark/greylune/material/Villager'
import { PlayerColor } from '@gamepark/greylune/PlayerColor'
import { linkButtonCss, usePlay, usePlayerId, useRules } from '@gamepark/react-game'
import { Material, MaterialMoveBuilder } from '@gamepark/rules-api'
import { Children, ReactNode } from 'react'
import { AdventurerIcon, ForceIcon, MagicIcon, VillagerIcon } from '../../components/Icons'

/**
 * The pieces a help text names by their word rather than by their picture alone: the Adventurer and
 * the Villager, which are pieces of their own with a dialog of their own, and Force and Magic, which
 * are read off a marker that has one too — where a coin is only ever an amount. The word is the
 * rulebook's, and it opens the dialog of the reader's piece.
 *
 * The word is written in the translation files, `<villager>Villageois</villager>`, and not here: the
 * sentence says "2 Villageois" where another language declines it, and only the sentence knows. A
 * file still written `<villager/>` is drawn the piece, as it was before — which is also what a button
 * reading the same text draws, since the icons it is given take no words (see {@link helpIcons}).
 */
type PieceWordProps = { children?: ReactNode }

/** The word, or the piece when the sentence gives none. */
const PieceWord = ({ icon, children }: PieceWordProps & { icon: ReactNode }) => <>{Children.count(children) ? children : icon}</>

export const AdventurerWord = ({ children }: PieceWordProps) => <PieceWord icon={<AdventurerIcon />}>{children}</PieceWord>

export const VillagerWord = ({ children }: PieceWordProps) => <PieceWord icon={<VillagerIcon />}>{children}</PieceWord>

/**
 * Whose piece a sentence means: "your Adventurer" is the reader's, and a spectator, who has none, is
 * shown the first player's.
 */
const useReader = (): PlayerColor | undefined => {
  const rules = useRules<GreyluneRules>()
  const me = usePlayerId<PlayerColor>()
  return me ?? rules?.players[0]
}

/**
 * A word of the sentence, and only underlined: it is read before it is clicked. A plain button rather
 * than a `PlayMoveButton`, which would dress it as one of the theme's emerald buttons — those are
 * declared `!important`, and win over any look handed to them. So what the framework's link style
 * leaves to the browser, the grey of a button and its own font, is taken back here.
 */
const textLinkCss = css`
  background: none;
  font: inherit;
`

const PieceLink = ({ type, pieces, children }: { type: MaterialType; pieces?: Material<PlayerColor, MaterialType, LocationType>; children: ReactNode }) => {
  const play = usePlay()
  const index = pieces?.getIndex() ?? -1
  if (pieces === undefined || index < 0) return <>{children}</>
  const help = MaterialMoveBuilder.displayMaterialHelp(type, pieces.getItem(index), index)
  return (
    <button css={[linkButtonCss, textLinkCss]} onClick={() => play(help, { transient: true })}>
      {children}
    </button>
  )
}

export const AdventurerLink = ({ children }: PieceWordProps) => {
  const rules = useRules<GreyluneRules>()
  const player = useReader()
  return (
    <PieceLink type={MaterialType.Adventurer} pieces={player === undefined ? undefined : rules?.material(MaterialType.Adventurer).id(player)}>
      <AdventurerWord>{children}</AdventurerWord>
    </PieceLink>
  )
}

/**
 * The reader's Villagers are 7 figures, any of which is what the sentence means. One already in play
 * is shown rather than one still waiting in the reserve, whose figures answer for the reserve rather
 * than for themselves (see `VillagerDescription.displayHelp`).
 */
export const VillagerLink = ({ children }: PieceWordProps) => {
  const rules = useRules<GreyluneRules>()
  const player = useReader()
  const villagers = player === undefined ? undefined : rules?.material(MaterialType.Villager).id<Villager>((villager) => getVillagerPlayer(villager) === player)
  const inPlay = villagers?.location((location) => location.type !== LocationType.VillagerReserve)
  return (
    <PieceLink type={MaterialType.Villager} pieces={inPlay?.length ? inPlay : villagers}>
      <VillagerWord>{children}</VillagerWord>
    </PieceLink>
  )
}

/**
 * Force and Magic keep the symbol the cards print them with, and the word follows it: "1 <force/>"
 * is how every card of the box says it, and the word is only there to be clicked. The link leads to
 * the marker the reader's level is read off. No word, no link: the symbol alone, as before.
 */
const SkillLink = ({ type, icon, children }: PieceWordProps & { type: MaterialType.StrengthMarker | MaterialType.MagicMarker; icon: ReactNode }) => {
  const rules = useRules<GreyluneRules>()
  const player = useReader()
  if (!Children.count(children)) return <>{icon}</>
  return (
    <>
      {icon}
      {' '}
      <PieceLink type={type} pieces={player === undefined ? undefined : rules?.material(type).player(player)}>
        {children}
      </PieceLink>
    </>
  )
}

export const ForceLink = ({ children }: PieceWordProps) => (
  <SkillLink type={MaterialType.StrengthMarker} icon={<ForceIcon />}>
    {children}
  </SkillLink>
)

export const MagicLink = ({ children }: PieceWordProps) => (
  <SkillLink type={MaterialType.MagicMarker} icon={<MagicIcon />}>
    {children}
  </SkillLink>
)
