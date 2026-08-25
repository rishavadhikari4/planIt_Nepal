/*
 * Checks the BS layer against published conversions.
 *   node src/utils/nepaliDate.test.mjs
 *
 * The anchors matter more than the round trip: a table can be perfectly
 * self-consistent and still be a fortnight out, which is how the first
 * hand-entered version passed every round-trip and was wrong.
 */
import assert from 'node:assert/strict'
import { toBS, toAD, formatBS, formatBoth, bsMonthLength } from './nepaliDate.js'

const ANCHORS = [
  ['2026-08-25', 2083, 5, 9],
  ['2025-11-27', 2082, 8, 11],
  ['2024-01-01', 2080, 9, 16],
  ['2000-01-01', 2056, 9, 17],
]

for (const [ad, y, m, d] of ANCHORS) {
  const bs = toBS(new Date(`${ad}T00:00:00`))
  assert.deepEqual({ year: bs.year, month: bs.month, day: bs.day }, { year: y, month: m, day: d }, ad)
}

// Both directions agree, across a wide spread of dates.
let checked = 0
for (let i = 0; i < 3000; i += 1) {
  const ad = new Date(1990, 0, 1 + i * 11)
  const bs = toBS(ad)
  if (!bs) continue
  const back = toAD(bs.year, bs.month, bs.day)
  assert.ok(back, `no round trip for ${ad.toDateString()}`)
  assert.equal(back.toDateString(), ad.toDateString(), `round trip drifted at ${ad.toDateString()}`)
  checked += 1
}

// Out of range must be null, never a wrong date and never a throw.
assert.equal(toBS(new Date('1850-01-01')), null)
assert.equal(toBS(new Date('nonsense')), null)
assert.equal(toAD(1900, 1, 1), null)
assert.equal(toAD(2082, 1, 99), null)
assert.equal(formatBS(new Date('1850-01-01')), null)

// A month is 29–32 days; anything else means the table is being misread.
for (const month of [1, 5, 8, 12]) {
  const length = bsMonthLength(2082, month)
  assert.ok(length >= 29 && length <= 32, `2082-${month} reported ${length} days`)
}

// Formatting falls back to Gregorian rather than printing nothing.
assert.equal(formatBS(new Date('2026-08-25T00:00:00')), '9 Bhadra 2083')
assert.match(formatBoth(new Date('2026-08-25T00:00:00')), /9 Bhadra 2083 · 25 Aug 2026/)
assert.match(formatBoth(new Date('1850-01-01T00:00:00')), /1 Jan 1850/)

console.log(`nepali date checks passed (${ANCHORS.length} anchors, ${checked} round trips)`)
