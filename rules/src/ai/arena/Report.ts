import { YEARS } from '../../Year'
import { Decision } from './Audit'
import { GameRecord, SeatRecord, YearRecord } from './Match'

/** A mean and the half-width of its 95% confidence interval. */
type Estimate = { mean: number; margin: number; n: number }

const estimate = (values: number[]): Estimate => {
  const n = values.length
  if (!n) return { mean: NaN, margin: NaN, n }
  const mean = values.reduce((sum, value) => sum + value, 0) / n
  const variance = n > 1 ? values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (n - 1) : 0
  return { mean, margin: 1.96 * Math.sqrt(variance / n), n }
}

const format = ({ mean, margin, n }: Estimate, digits = 1): string =>
  !n ? '—' : n > 1 ? `${mean.toFixed(digits)} ±${margin.toFixed(digits)}` : mean.toFixed(digits)

const pad = (rows: string[][]): string => {
  const widths = rows[0].map((_, column) => Math.max(...rows.map((row) => row[column].length)))
  return rows.map((row) => row.map((cell, column) => (column ? cell.padStart(widths[column]) : cell.padEnd(widths[column]))).join('  ')).join('\n')
}

const defined = (values: (number | undefined)[]): number[] => values.filter((value): value is number => value !== undefined)

/** The best score of the other players at the table: what a seat had to beat. */
const margin = (game: GameRecord, seat: SeatRecord): number => seat.score - Math.max(...game.seats.filter((other) => other !== seat).map((other) => other.score))

const seatsOf = (games: GameRecord[], contender: string) => games.flatMap((game) => game.seats.filter((seat) => seat.contender === contender).map((seat) => ({ game, seat })))

/**
 * The standing of every contender, then what each of them did year by year, then how they fared
 * against each other on the very same tables.
 */
export const report = (games: GameRecord[]): string => {
  const failed = games.filter((game) => game.error)
  const played = games.filter((game) => !game.error)
  const names = [...new Set(played.flatMap((game) => game.seats.map((seat) => seat.contender)))]
  const lines: string[] = []
  const players = played[0]?.players
  lines.push(`${played.length} games at ${players} players, ${failed.length} failed, ${(played.reduce((sum, game) => sum + game.ms, 0) / 1000 / Math.max(played.length, 1)).toFixed(1)} s per game`)
  for (const game of failed) lines.push(`  seed ${game.seed} rotation ${game.rotation}: ${game.error}`)

  lines.push('', 'STANDING (95% confidence intervals)')
  lines.push(
    pad([
      ['contender', 'seats', 'score', 'margin', 'rank', 'wins %', 'game VP', 'quests 1st', 'quests 2nd', 'companions', 'items', 'coins'],
      ...names.map((name) => {
        const seats = seatsOf(played, name)
        const of = (read: (seat: SeatRecord) => number) => estimate(seats.map(({ seat }) => read(seat)))
        return [
          name,
          String(seats.length),
          format(of((seat) => seat.score)),
          format(estimate(seats.map(({ game, seat }) => margin(game, seat)))),
          format(of((seat) => seat.rank), 2),
          (100 * of((seat) => (seat.rank === 1 ? 1 : 0)).mean).toFixed(0),
          format(of((seat) => seat.gameVp)),
          format(of((seat) => seat.questsFirst), 2),
          format(of((seat) => seat.questsSecond), 2),
          format(of((seat) => seat.companions)),
          format(of((seat) => seat.items)),
          format(of((seat) => seat.coins))
        ]
      })
    ])
  )

  lines.push('', 'YEAR BY YEAR (means)')
  const yearColumns: [string, (year: YearRecord) => number | undefined][] = [
    ['villagers owned', (year) => year.villagersOwned],
    ['spring turns', (year) => year.springTurns],
    ['in hand at summer', (year) => year.villagersInHand],
    ['in village at summer', (year) => year.villagersInVillage],
    ['summer order', (year) => year.summerOrder],
    ['summer turns', (year) => year.summerTurns],
    ['idle villagers', (year) => year.idleVillagers],
    ['unused objects', (year) => year.unusedItems],
    ['encounters', (year) => year.encounters.length],
    ['encounter rank', (year) => (year.encounters.length ? year.encounters.reduce((sum, rank) => sum + rank, 0) / year.encounters.length : undefined)]
  ]
  for (const name of names) {
    const seats = seatsOf(played, name)
    const rows = [['  ' + name, ...yearColumns.map(([title]) => title)]]
    for (let year = 0; year < YEARS; year++) {
      rows.push([`  year ${year + 1}`, ...yearColumns.map(([, read]) => estimate(defined(seats.map(({ seat }) => read(seat.years[year])))).mean.toFixed(2))])
    }
    rows.push(['  all', ...yearColumns.map(([, read]) => estimate(defined(seats.flatMap(({ seat }) => seat.years.map(read)))).mean.toFixed(2))])
    lines.push(pad(rows), '')
  }

  lines.push('TURNS BY KIND (per game)')
  const kinds = [...new Set(played.flatMap((game) => game.seats.flatMap((seat) => seat.years.flatMap((year) => Object.keys(year.turns ?? {})))))].sort()
  lines.push(
    pad([
      ['  kind', ...names],
      ...kinds.map((kind) => [
        `  ${kind}`,
        ...names.map((name) =>
          estimate(seatsOf(played, name).map(({ seat }) => seat.years.reduce((sum, year) => sum + (year.turns?.[kind] ?? 0), 0))).mean.toFixed(2)
        )
      ])
    ]),
    ''
  )

  lines.push(
    'OBJECTS: per contender, share of the seats that bought it when it was laid out % / mean year bought / uses per seat that owned it',
    '(year: when the Object was laid out, then when the seats that bought it did)'
  )
  const cards = [...new Set(played.flatMap((game) => (game.offered ?? []).map((offer) => offer.card)))].sort()
  lines.push(
    pad([
      ['  object', 'tables', 'laid out', ...names],
      ...cards.map((card) => {
        const tables = played.filter((game) => game.offered?.some((offer) => offer.card === card))
        const laidOut = tables.map((game) => game.offered.find((offer) => offer.card === card)!.year)
        return [
          `  ${card}`,
          String(tables.length),
          `y${(laidOut.reduce((sum, year) => sum + year, 0) / laidOut.length).toFixed(1)}`,
          ...names.map((name) => {
            const seats = tables.flatMap((game) => game.seats.filter((seat) => seat.contender === name))
            const owners = seats.filter((seat) => seat.itemsOwned?.some((owned) => owned.card === card))
            if (!seats.length) return '—'
            const share = `${((100 * owners.length) / seats.length).toFixed(0)}%`
            if (!owners.length) return share
            const year = owners.reduce((sum, seat) => sum + seat.itemsOwned.find((owned) => owned.card === card)!.year, 0) / owners.length
            const uses = owners.reduce((sum, seat) => sum + (seat.itemUses?.[card] ?? 0), 0) / owners.length
            return `${share} y${year.toFixed(1)} u${uses.toFixed(1)}`
          })
        ]
      })
    ]),
    ''
  )

  if (names.length > 1) {
    lines.push('HEAD TO HEAD (same tables: score of the first minus score of the second)')
    const rows = [['  pair', 'games', 'score gap', 'first ahead %']]
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const gaps = played.flatMap((game) => {
          const a = game.seats.filter((seat) => seat.contender === names[i])
          const b = game.seats.filter((seat) => seat.contender === names[j])
          if (!a.length || !b.length) return []
          const mean = (seats: SeatRecord[]) => seats.reduce((sum, seat) => sum + seat.score, 0) / seats.length
          return [mean(a) - mean(b)]
        })
        if (!gaps.length) continue
        rows.push([
          `  ${names[i]} vs ${names[j]}`,
          String(gaps.length),
          format(estimate(gaps)),
          (100 * estimate(gaps.map((gap) => (gap > 0 ? 1 : gap === 0 ? 0.5 : 0))).mean).toFixed(0)
        ])
      }
    }
    lines.push(pad(rows))
  }
  return lines.join('\n')
}

/**
 * Two runs on the same seeds and lineup, the code changed in between: every seat is compared with the
 * same seat of the same table in the baseline. A gap whose interval does not include 0 is a real one.
 */
export const compare = (baseline: GameRecord[], candidate: GameRecord[]): string => {
  const key = (game: GameRecord) => `${game.seed}/${game.rotation}`
  const before = new Map(baseline.filter((game) => !game.error).map((game) => [key(game), game]))
  const pairs = candidate.filter((game) => !game.error && before.has(key(game))).map((game) => [before.get(key(game))!, game] as const)
  const names = [...new Set(pairs.flatMap(([, game]) => game.seats.map((seat) => seat.contender)))]
  const rows = [['contender', 'seats', 'score', 'margin', 'rank', 'idle villagers', 'in hand at summer', 'encounters']]
  const idle = (seat: SeatRecord) => defined(seat.years.map((year) => year.idleVillagers)).reduce((sum, value) => sum + value, 0)
  const inHand = (seat: SeatRecord) => defined(seat.years.map((year) => year.villagersInHand)).reduce((sum, value) => sum + value, 0)
  const encounters = (seat: SeatRecord) => seat.years.reduce((sum, year) => sum + year.encounters.length, 0)
  for (const name of names) {
    const seats = pairs.flatMap(([old, game]) =>
      game.seats.flatMap((seat, index) => (seat.contender === name && old.seats[index].contender === name ? [{ old, game, was: old.seats[index], seat }] : []))
    )
    const gap = (read: (game: GameRecord, seat: SeatRecord) => number) => format(estimate(seats.map(({ old, game, was, seat }) => read(game, seat) - read(old, was))), 2)
    rows.push([
      name,
      String(seats.length),
      gap((_, seat) => seat.score),
      gap(margin),
      gap((_, seat) => seat.rank),
      gap((_, seat) => idle(seat)),
      gap((_, seat) => inHand(seat)),
      gap((_, seat) => encounters(seat))
    ])
  }
  return `${pairs.length} tables played in both runs, candidate minus baseline (per game totals, 95% intervals)\n${pad(rows)}`
}

/** A kind of turn without the card it names. */
const kindOf = (label: string): string => label.replace(/ \(.*\)$/, '')

/**
 * How often the bot would have played what the human played, kind by kind; what it would have
 * played instead; and the turns where it disagrees the most with a human using an Object.
 */
export const auditReport = (decisions: Decision[]): string => {
  const lines: string[] = []
  const agree = decisions.filter((decision) => decision.rank === 1).length
  lines.push(`${decisions.length} turns of ${new Set(decisions.map((decision) => `${decision.game}/${decision.player}`)).size} players, the bot plays the same move in ${((100 * agree) / decisions.length).toFixed(0)}% of them`)

  const humanKinds = [...new Set(decisions.map((decision) => kindOf(decision.human)))].sort()
  const botKinds = [...new Set(decisions.map((decision) => kindOf(decision.bot)))].sort()
  lines.push('', 'WHAT THE HUMAN PLAYED (rows) AND WHAT THE BOT WOULD HAVE PLAYED (columns)')
  lines.push(
    pad([
      ['  human / bot', 'turns', 'same move %', ...botKinds],
      ...humanKinds.map((kind) => {
        const rows = decisions.filter((decision) => kindOf(decision.human) === kind)
        return [
          `  ${kind}`,
          String(rows.length),
          ((100 * rows.filter((decision) => decision.rank === 1).length) / rows.length).toFixed(0),
          ...botKinds.map((bot) => String(rows.filter((decision) => kindOf(decision.bot) === bot).length))
        ]
      })
    ])
  )

  const items = decisions.filter((decision) => kindOf(decision.human).endsWith('UseItem'))
  const byCard = new Map<string, Decision[]>()
  for (const decision of items) byCard.set(decision.human, [...(byCard.get(decision.human) ?? []), decision])
  lines.push('', 'OBJECTS USED BY THE HUMAN: how often the bot would have used the same one, and how much less it reckons it is worth')
  lines.push(
    pad([
      ['  object', 'uses', 'same move %', 'median gap', 'not weighed'],
      ...[...byCard.entries()]
        .sort((a, b) => b[1].length - a[1].length)
        .map(([card, rows]) => {
          const gaps = rows.flatMap((decision) => (decision.gap === undefined ? [] : [decision.gap])).sort((a, b) => a - b)
          return [
            `  ${card}`,
            String(rows.length),
            ((100 * rows.filter((decision) => decision.rank === 1).length) / rows.length).toFixed(0),
            gaps.length ? gaps[Math.floor(gaps.length / 2)].toFixed(2) : '—',
            String(rows.filter((decision) => decision.rank === undefined).length)
          ]
        })
    ])
  )

  lines.push('', 'LARGEST DISAGREEMENTS ON OBJECTS (game / action: replay the actions before it to get the position)')
  lines.push(
    pad([
      ['  game / action', 'year', 'player', 'human', 'bot', 'rank', 'gap'],
      ...items
        .filter((decision) => decision.rank !== 1)
        .sort((a, b) => (b.gap ?? Infinity) - (a.gap ?? Infinity))
        .slice(0, 25)
        .map((decision) => [
          `  ${decision.game} / ${decision.action}`,
          String(decision.year),
          `${decision.player} (${decision.score})`,
          decision.human,
          decision.bot,
          decision.rank === undefined ? '—' : `${decision.rank}/${decision.moves}`,
          decision.gap === undefined ? '—' : decision.gap.toFixed(2)
        ])
    ])
  )
  return lines.join('\n')
}
