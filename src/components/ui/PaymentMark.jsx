import { Banknote } from "lucide-react"

/*
 * The gateways' own marks, not our approximation of them.
 *
 * Every mark sits on the same white chip at the same height. That is how card
 * acceptance marks have always been shown, and it is the only treatment that
 * survives both the paper surface and the crimson panel without one brand
 * being tinted to suit our palette. The chip is the constant; the logo inside
 * it is whatever the brand says it is.
 *
 * Assets live in public/brand and were taken from each gateway's own site.
 */

const MARKS = {
  khalti: {
    name: "Khalti",
    src: "/brand/khalti.svg",
    // The Khalti file carries generous side bearing inside its viewBox, so it
    // is set wider than Fonepay to land on the same optical height.
    width: 76,
    detail: "Khalti wallet, mobile banking, connectIPS or a card.",
  },
  fonepay: {
    name: "Fonepay",
    src: "/brand/fonepay.png",
    width: 62,
    detail: "Straight from your bank account over the Fonepay network.",
  },
}

export const PAYMENT_MARKS = MARKS

/** The chip alone. `id` is "khalti", "fonepay", or "cash". */
const PaymentMark = ({ id, className = "" }) => {
  const mark = MARKS[id]

  if (!mark) {
    return (
      <span
        className={`inline-flex h-9 items-center gap-1.5 rounded-md bg-white px-3 shadow-[var(--shadow-xs)] ring-1 ring-inset ring-black/5 ${className}`}
      >
        <Banknote className="h-4 w-4 text-brass-deep" strokeWidth={1.75} />
        <span className="t-caption font-semibold text-ink">Cash</span>
      </span>
    )
  }

  return (
    <span
      className={`inline-flex h-9 items-center justify-center rounded-md bg-white px-3 shadow-[var(--shadow-xs)] ring-1 ring-inset ring-black/5 ${className}`}
    >
      <img
        src={mark.src}
        alt={mark.name}
        width={mark.width}
        style={{ width: mark.width }}
        className="h-auto max-h-5 w-auto object-contain"
      />
    </span>
  )
}

export default PaymentMark
