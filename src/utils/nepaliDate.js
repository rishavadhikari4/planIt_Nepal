import NepaliDateExport from 'nepali-date-converter'

/* The package is CommonJS. Vite's interop hands back the constructor, while
   Node's raw ESM loader hands back the namespace object — this reads the same
   thing out of either, so the test file and the bundle agree. */
const NepaliDate = NepaliDateExport.default ?? NepaliDateExport

/*
 * Bikram Sambat.
 *
 * Every date on this site was Gregorian, in a country that books its weddings
 * in Mangsir and Magh. A family told the ceremony is on 12 Mangsir should not
 * have to convert it themselves to use the calendar.
 *
 * BS months have no fixed length — they come from a solar calendar published
 * a year at a time — so conversion is a table lookup, not arithmetic. The
 * table is `nepali-date-converter`'s rather than ours: a hand-entered one
 * round-tripped perfectly and still disagreed with published conversions by
 * around a fortnight, which is exactly the failure a booking system cannot
 * absorb.
 *
 * Storage stays Gregorian throughout. This is a display and input layer, and
 * every function returns null outside the supported range so a caller can
 * fall back to Gregorian rather than print something wrong.
 */

export const BS_MONTHS = [
  'Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra',
]

export const BS_MONTHS_NP = [
  'बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज',
  'कात्तिक', 'मंसिर', 'पुष', 'माघ', 'फागुन', 'चैत',
]

export const BS_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const BS_DAYS_NP = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिहि', 'शुक्र', 'शनि']

/* The converter's own limits. Outside these it throws, which is the reason
   every export here is wrapped. */
export const BS_RANGE = { min: 2000, max: 2090 }

/**
 * Gregorian → { year, month, day } in BS (month is 1-based), or null when the
 * date is outside the supported range or not a date at all.
 */
export const toBS = (date) => {
  const input = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(input.getTime())) return null
  try {
    // Build from the local Y/M/D so a UTC timestamp late in the day does not
    // land on the previous date in Kathmandu.
    const nd = new NepaliDate(new Date(input.getFullYear(), input.getMonth(), input.getDate()))
    return { year: nd.getYear(), month: nd.getMonth() + 1, day: nd.getDate() }
  } catch {
    return null
  }
}

/**
 * BS → a Gregorian Date, or null if that BS date does not exist.
 *
 * The converter silently rolls an overflowing day into the following month —
 * ask for 32 Baisakh of a 31-day year and it hands back 1 Jestha. That is the
 * wrong answer to give a date picker, so the result is converted back and
 * only returned if it still names the date that was asked for.
 */
export const toAD = (year, month, day) => {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null
  if (month < 1 || month > 12 || day < 1 || day > 32) return null
  try {
    const ad = new NepaliDate(year, month - 1, day).toJsDate()
    if (Number.isNaN(ad.getTime())) return null
    const back = toBS(ad)
    if (!back || back.year !== year || back.month !== month || back.day !== day) return null
    return ad
  } catch {
    return null
  }
}

/** How many days a BS month holds, or null outside the range. */
export const bsMonthLength = (year, month) => {
  // toAD rejects a day the month does not have, so the longest one it accepts
  // is the length of the month.
  for (let day = 32; day >= 28; day -= 1) {
    if (toAD(year, month, day)) return day
  }
  return null
}

/** "12 Mangsir 2082", or null when the date cannot be converted. */
export const formatBS = (date, { np = false, withYear = true } = {}) => {
  const bs = toBS(date)
  if (!bs) return null
  const months = np ? BS_MONTHS_NP : BS_MONTHS
  return `${bs.day} ${months[bs.month - 1]}${withYear ? ` ${bs.year}` : ''}`
}

/** "12 Mangsir 2082 · 27 Nov 2025" — both, because both are in use. */
export const formatBoth = (date, { np = false } = {}) => {
  const input = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(input.getTime())) return ''
  const gregorian = input.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const bs = formatBS(input, { np })
  return bs ? `${bs} · ${gregorian}` : gregorian
}
