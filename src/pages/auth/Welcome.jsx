import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { AuthContext } from "../../context/AuthContext"

const EASE = [0.16, 1, 0.3, 1]

/* The same three steps as the home page and the cart, so the shape of the
   product is the first thing a new account learns. */
const STEPS = [
  {
    step: "01",
    label: "Pick a venue",
    body: "It fixes your date. Availability is shown per venue, so the room and the day are chosen together.",
    path: "/venues",
  },
  {
    step: "02",
    label: "Build the menu",
    body: "Dishes are priced per plate, so the total moves with your headcount.",
    path: "/cuisines",
  },
  {
    step: "03",
    label: "Book a studio",
    body: "Photo and video teams, booked against the same dates as your venue.",
    path: "/studios",
  },
]

const Welcome = () => {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  return (
    <div className="flex min-h-screen items-center bg-paper">
      <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <p className="eyebrow">Welcome</p>
          <h1 className="mt-6 text-[clamp(32px,5.5vw,52px)] leading-[1.02] tracking-[-0.03em]">
            You&rsquo;re in{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.
            <br />
            <span className="font-normal italic">Here&rsquo;s how it works.</span>
          </h1>
          <p className="mt-6 max-w-[48ch] text-[16.5px] leading-relaxed text-ink-soft">
            An event is three bookings on one order. Choose them in this order and nothing clashes.
          </p>
        </motion.div>

        <ol className="mt-14 divide-y divide-line border-y border-line">
          {STEPS.map((s, i) => (
            <motion.li
              key={s.step}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.15 + i * 0.09 }}
            >
              <button
                onClick={() => navigate(s.path)}
                className="group flex w-full items-start gap-5 py-6 text-left"
              >
                <span className="amount w-8 shrink-0 pt-0.5 text-[13px] font-semibold text-brass-deep">
                  {s.step}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[18px] font-semibold text-ink">{s.label}</span>
                  <span className="mt-1.5 block max-w-[52ch] text-[14.5px] leading-relaxed text-ink-soft">
                    {s.body}
                  </span>
                </span>
                <ArrowRight
                  className="mt-1 h-4 w-4 shrink-0 text-line-strong transition-all group-hover:translate-x-1 group-hover:text-brass"
                  strokeWidth={2}
                />
              </button>
            </motion.li>
          ))}
        </ol>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.5 }}
          className="mt-10 flex flex-wrap gap-3"
        >
          <button onClick={() => navigate("/venues")} className="btn btn-accent group h-12 px-6">
            Start with a venue
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              strokeWidth={2}
            />
          </button>
          <button onClick={() => navigate("/")} className="btn btn-ghost h-12 px-6">
            Look around first
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default Welcome
