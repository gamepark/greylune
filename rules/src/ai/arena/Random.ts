/**
 * A stream of numbers drawn from a seed (mulberry32): the same seed always gives the same stream, which
 * is what lets the arena deal a table again and replay it with the seats changed.
 */
export class Random {
  private state: number

  constructor(seed: number) {
    this.state = seed >>> 0
  }

  /** A number in [0, 1), as `Math.random` gives. */
  next = (): number => {
    this.state = (this.state + 0x6d2b79f5) >>> 0
    let t = this.state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  /** An integer in [0, n). */
  below(n: number): number {
    return Math.floor(this.next() * n)
  }
}

/**
 * Runs `task` with `Math.random` drawing from `seed`, and gives it back afterwards. The setup shuffles
 * its decks with `es-toolkit`, which draws from `Math.random`: this is how the arena deals a chosen table.
 */
export const withSeed = <T>(seed: number, task: () => T): T => {
  const original = Math.random
  Math.random = new Random(seed).next
  try {
    return task()
  } finally {
    Math.random = original
  }
}
