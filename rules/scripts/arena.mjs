/**
 * The arena: the automatic players of Greylune against each other, on tables dealt from seeds.
 *
 *   yarn arena --players 3 --lineup bot,rusher,rusher --seeds 40
 *   yarn arena --compare arena-results/before.json arena-results/after.json
 *   yarn arena --replay greylune.games.json --with arena-results/rusher-2p.json
 *   yarn arena --audit greylune.games.json --min-score 85
 *
 * --players   2 to 4 (3 by default, and 2 for --replay: only the games at that many players are reported)
 * --lineup    contenders by name (see rules/src/ai/arena/Contenders.ts), one per seat; a single name
 *             fills the table. Unless they are all the same, every table is played once per rotation
 *             of the seats, so that each contender sits on each seat of the same deal.
 * --seeds     how many tables (20 by default), dealt from --first (1 by default) onward
 * --workers   processes playing in parallel (one per core but one by default)
 * --out       where the records go (arena-results/<date>-<lineup>.json by default)
 * --replay    games exported by the platform, played again and reported like the arena's, the human
 *             seats filed by the score they reached (see rules/src/ai/arena/Replay.ts)
 * --with      arena records to report alongside the replayed games, to set the bots against them
 * --audit     games exported by the platform: every Spring and Summer turn of the players who scored
 *             at least --min-score (85 by default) set against the move the bot would have played
 *
 * The TypeScript of the rules is loaded through Vite, so nothing has to be built first.
 */
import { fork } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { availableParallelism } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { runnerImport } from 'vite'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const load = async (file) =>
  (
    await runnerImport(resolve(root, 'src/ai/arena', file), {
      root,
      configFile: false,
      logLevel: 'error',
      environments: { inline: { resolve: { noExternal: ['@gamepark/rules-api', 'es-toolkit'] } } }
    })
  ).module

const { values, positionals } = parseArgs({
  options: {
    worker: { type: 'boolean' },
    players: { type: 'string' },
    lineup: { type: 'string', default: 'bot' },
    seeds: { type: 'string', default: '20' },
    first: { type: 'string', default: '1' },
    workers: { type: 'string', default: String(Math.max(1, availableParallelism() - 1)) },
    out: { type: 'string' },
    compare: { type: 'boolean' },
    replay: { type: 'string' },
    with: { type: 'string', multiple: true },
    audit: { type: 'string' },
    'min-score': { type: 'string', default: '85' }
  },
  allowPositionals: true,
  strict: true
})

const read = (file) => JSON.parse(readFileSync(resolve(file), 'utf8'))

const write = (out, records) => {
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, JSON.stringify(records))
  return `\nRecords written to ${out}`
}

/** Hands the tasks out to as many worker processes, each running `job` of the module it is in, and gathers what they return. */
const pool = async (job, tasks, progress) => {
  const results = []
  const started = Date.now()
  const workers = Math.min(Number(values.workers), tasks.length)
  await Promise.all(
    Array.from(
      { length: workers },
      () =>
        new Promise((done, fail) => {
          const child = fork(fileURLToPath(import.meta.url), ['--worker'])
          const next = () => {
            const task = tasks.shift()
            if (task) child.send({ job, task })
            else child.disconnect()
          }
          child.on('message', (message) => {
            if (message !== 'ready') {
              results.push(message)
              process.stderr.write(`\r${results.length} ${progress(message)}, ${((Date.now() - started) / 1000).toFixed(0)} s`)
            }
            next()
          })
          child.on('error', fail)
          child.on('exit', (code) => (code ? fail(new Error(`A worker stopped with code ${code}`)) : done()))
        })
    )
  )
  process.stderr.write('\n')
  return results
}

if (values.worker) {
  const jobs = { playMatch: (await load('Match.ts')).playMatch, auditGame: (await load('Audit.ts')).auditGame }
  process.on('message', ({ job, task }) => {
    try {
      process.send(jobs[job](task))
    } catch (e) {
      process.send({ error: String(e) })
    }
  })
  process.send('ready')
} else if (values.compare) {
  const [baseline, candidate] = positionals
  const { compare } = await load('Report.ts')
  console.log(compare(read(baseline), read(candidate)))
} else if (values.replay) {
  const { replayGames } = await load('Replay.ts')
  const records = replayGames(read(values.replay))
  const players = Number(values.players ?? 2)
  const others = (values.with ?? []).flatMap(read)
  const { report } = await load('Report.ts')
  console.log(report([...records, ...others].filter((record) => record.players === players)))
  console.log(write(resolve(values.out ?? resolve(root, 'arena-results', 'replay.json')), records))
} else if (values.audit) {
  const minScore = Number(values['min-score'])
  const tasks = read(values.audit)
    .filter((game) => !game.state?.rule && !game.players.some((player) => player.quit))
    .map((game) => ({ game, players: game.players.flatMap((player, seat) => (player.score >= minScore ? [seat] : [])) }))
    .filter((task) => task.players.length)
  const results = await pool('auditGame', tasks, () => 'games audited')
  const decisions = results.filter(Array.isArray).flat()
  const { auditReport } = await load('Report.ts')
  console.log(`${results.filter((result) => !Array.isArray(result)).length} games could not be replayed`)
  console.log(auditReport(decisions))
  console.log(write(resolve(values.out ?? resolve(root, 'arena-results', `audit-${minScore}.json`)), decisions))
} else {
  const players = Number(values.players ?? 3)
  const names = values.lineup.split(',')
  const lineup = names.length === 1 ? Array(players).fill(names[0]) : names
  if (lineup.length !== players) throw new Error(`The lineup has ${lineup.length} contenders for ${players} seats`)
  const rotations = new Set(lineup).size === 1 ? 1 : players
  const first = Number(values.first)
  const tasks = []
  for (let seed = first; seed < first + Number(values.seeds); seed++) {
    for (let rotation = 0; rotation < rotations; rotation++) tasks.push({ seed, rotation, lineup })
  }
  const records = await pool('playMatch', tasks, (record) => `games played${record.error ? ` — failed: ${record.error}` : ''}`)
  records.sort((a, b) => a.seed - b.seed || a.rotation - b.rotation)
  const { report } = await load('Report.ts')
  console.log(report(records))
  console.log(write(resolve(values.out ?? resolve(root, 'arena-results', `${new Date().toISOString().replace(/[:.]/g, '-')}-${players}p-${names.join('-')}.json`)), records))
}
