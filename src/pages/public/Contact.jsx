import { motion } from "framer-motion"
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react"
import ContactForm from "../../components/forms/ContactForm"

const EASE = [0.16, 1, 0.3, 1]

const reveal = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, staggerChildren: 0.08 } },
}

const child = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

/* This page answers three questions: who we are, how to reach us, and when.
   Everything else is noise on a contact page. */
const REACH = [
  {
    label: "Email",
    value: "contact@planitnepal.com",
    href: "mailto:contact@planitnepal.com",
    detail: "Replies within a working day",
    Icon: Mail,
  },
  {
    label: "Phone",
    value: "+977 987 654 3345",
    href: "tel:+9779876543345",
    detail: "Sunday to Friday, 10am – 6pm",
    Icon: Phone,
  },
  {
    label: "Office",
    value: "Kathmandu, Nepal",
    detail: "Visits by appointment",
    Icon: MapPin,
  },
]

const FACTS = [
  ["Founded", "2020"],
  ["Events run", "200+"],
  ["Services", "Venues, catering, studios"],
  ["Coverage", "Kathmandu valley and beyond"],
]

const Contact = () => (
  <div className="min-h-screen bg-paper">
    {/* ---------------- Who we are ---------------- */}
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-24 lg:px-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={reveal}
        className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20"
      >
        <div>
          <motion.p variants={child} className="eyebrow">
            About us
          </motion.p>
          <motion.h1
            variants={child}
            className="mt-6 t-display"
          >
            We put three bookings
            <br />
            <span className="font-normal italic">on one order.</span>
          </motion.h1>
          <motion.p
            variants={child}
            className="mt-7 max-w-[52ch] t-lead leading-relaxed text-ink-soft"
          >
            PlanIt Nepal started because arranging an event here meant three separate
            negotiations, three deposits and three chances for a date to slip. We put the venue,
            the catering and the studio on a single order with real prices and real availability,
            so you can see the whole event before you commit to any of it.
          </motion.p>

          <motion.dl
            variants={child}
            className="mt-12 divide-y divide-line border-y border-line"
          >
            {FACTS.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-6 py-4">
                <dt className="t-small text-ink-mute">{label}</dt>
                <dd className="amount text-right t-body text-ink">{value}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div variants={child}>
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {REACH.map(({ label, value, href, detail, Icon }) => {
              const Wrapper = href ? "a" : "div"
              return (
                <li key={label}>
                  <Wrapper
                    href={href}
                    className={`group flex items-start gap-4 p-5 no-underline ${
                      href ? "transition-colors hover:bg-gray-50" : ""
                    }`}
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-mute" strokeWidth={1.75} />
                    <span className="min-w-0 flex-1">
                      <span className="block t-caption text-ink-mute">{label}</span>
                      <span className="amount mt-0.5 block truncate t-body text-ink">
                        {value}
                      </span>
                      <span className="mt-1 block t-small text-ink-soft">{detail}</span>
                    </span>
                    {href && (
                      <ArrowUpRight
                        className="h-4 w-4 shrink-0 text-line-strong transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brass"
                        strokeWidth={2}
                      />
                    )}
                  </Wrapper>
                </li>
              )
            })}
          </ul>

          <div className="mt-5 flex items-start gap-3 rounded-lg border border-line bg-gray-50 p-4">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-ink-mute" strokeWidth={1.75} />
            <p className="t-small leading-relaxed text-ink-soft">
              Planning around a fixed date? Send it over — we&rsquo;ll tell you what&rsquo;s still
              free before you commit to anything.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>

    {/* ---------------- Get in touch ---------------- */}
    <section className="border-t border-line bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-24 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={reveal}
          className="grid gap-12 lg:grid-cols-2 lg:gap-20"
        >
          <div>
            <motion.p variants={child} className="eyebrow">
              Get in touch
            </motion.p>
            <motion.h2 variants={child} className="mt-5 t-display">
              Tell us what you&rsquo;re planning.
            </motion.h2>
            <motion.p
              variants={child}
              className="mt-5 max-w-[44ch] t-body leading-relaxed text-ink-soft"
            >
              The more you can say about the date, the headcount and the budget, the more useful
              our first reply will be.
            </motion.p>
          </div>

          <motion.div variants={child}>
            <ContactForm
              title="Send us a message"
              description="We read every one of these ourselves."
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  </div>
)

export default Contact
