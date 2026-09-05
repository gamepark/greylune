/**
 * How far apart the two ends of a list actually end up. A list given a `maxGap` tightens up rather
 * than growing past it, so the real spread is the smaller of the two — and a locator that centres its
 * items has to halve that one, never the nominal gap, or the row drifts as it fills up.
 */
export const spread = (gap: number, gaps: number, maxGap?: number): number => {
  const total = gap * gaps
  return maxGap === undefined ? total : Math.sign(total) * Math.min(Math.abs(total), Math.abs(maxGap))
}
