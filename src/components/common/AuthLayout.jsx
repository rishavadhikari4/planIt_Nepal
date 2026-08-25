import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { getAllVenues } from "../../services/venues"

/*
 * The auth pages hide the site header, so they carry the brand themselves: a
 * crimson panel on the left holding the wordmark and the promise, the form on
 * paper to the right. On small screens the panel collapses to a single line so
 * the form is the first thing in reach.
 */
const AuthLayout = ({ title, subtitle, aside, children, footer }) => {
  // A real venue photograph behind the crimson, dimmed to texture — the same
  // treatment as the payments panel on the landing page.
  const [backdrop, setBackdrop] = useState(null)

  useEffect(() => {
    let live = true
    getAllVenues({ limit: 4, sortField: "createdAt", sortOrder: "desc" })
      .then((r) => {
        const found = (r.venues || []).map((v) => v.venueImage).filter(Boolean)
        if (live && found.length) setBackdrop(found[Math.floor(Math.random() * found.length)])
      })
      .catch(() => {})
    return () => {
      live = false
    }
  }, [])

  return (
  <div className="grid min-h-screen bg-paper lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
    {/* Brand panel */}
    <aside className="relative isolate flex flex-col justify-between overflow-hidden bg-crimson-deep px-6 py-6 text-white sm:px-10 lg:px-14 lg:py-14">
      {backdrop && (
        <motion.img
          src={backdrop}
          alt=""
          aria-hidden
          initial={{ scale: 1.16, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.16 }}
          transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-crimson-deep/70 via-crimson-deep/85 to-crimson-deep" />
      <Link to="/" className="flex items-baseline gap-2 no-underline">
        <span className="font-display text-[23px] font-semibold tracking-[-0.03em] text-white">
          PlanIt
        </span>
        <span className="t-overline text-brass-lift">Nepal</span>
      </Link>

      <motion.div
        className="hidden lg:block"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
      >
        <p className="font-display t-title text-white">
          {aside?.headline || "The venue, the food, and the camera — on one order."}
        </p>
        <p className="mt-5 max-w-[38ch] t-body leading-relaxed text-white/55">
          {aside?.body ||
            "Compare real prices across Nepal, hold your dates with a 25% advance, and pay with Khalti, Fonepay or cash after the event."}
        </p>
      </motion.div>

      <p className="hidden t-overline text-white/35 lg:block">Kathmandu · Nepal</p>
    </aside>

    {/* Form */}
    <main className="flex items-center justify-center px-5 py-12 sm:px-8 lg:px-14">
      <motion.div
        className="w-full max-w-[400px]"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
      >
        <h1 className="t-display">{title}</h1>
        {subtitle && <p className="mt-4 t-body text-ink-soft">{subtitle}</p>}
        <div className="mt-10">{children}</div>
        {footer && <div className="mt-9 border-t border-line pt-6 t-small">{footer}</div>}
      </motion.div>
    </main>
  </div>
  )
}

/** Shared field so every auth form has the same label, hint and error voice. */
export const Field = ({ id, label, hint, error, children }) => (
  <div>
    <label htmlFor={id} className="label">
      {label}
    </label>
    {children}
    {error ? (
      <p className="mt-1.5 t-caption text-red-600">{error}</p>
    ) : hint ? (
      <p className="mt-1.5 t-caption text-ink-mute">{hint}</p>
    ) : null}
  </div>
)

/** Google is the only third-party sign-in, so it gets a plain, honest button. */
export const GoogleButton = ({ label = "Continue with Google" }) => (
  <button
    type="button"
    onClick={() => (window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/auths/google/`)}
    className="btn btn-ghost w-full py-3"
  >
    <img
      src="https://developers.google.com/identity/images/g-logo.png"
      alt=""
      className="h-[18px] w-[18px]"
    />
    {label}
  </button>
)

export const Divider = ({ children = "or" }) => (
  <div className="my-6 flex items-center gap-4">
    <span className="h-px flex-1 bg-line" />
    <span className="font-mono t-caption uppercase tracking-[0.16em] text-ink-mute">{children}</span>
    <span className="h-px flex-1 bg-line" />
  </div>
)

export const FormError = ({ children }) =>
  children ? (
    <p
      role="alert"
      className="mb-5 rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 t-small leading-relaxed text-red-700"
    >
      {children}
    </p>
  ) : null

export default AuthLayout
