import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { toast } from "react-toastify"
import { submitContactForm } from "../../services/contact"

const SUBJECTS = [
  { value: "", label: "What's the occasion?" },
  { value: "wedding-planning", label: "Wedding" },
  { value: "corporate-event", label: "Corporate event" },
  { value: "birthday-party", label: "Birthday" },
  { value: "anniversary-celebration", label: "Anniversary" },
  { value: "graduation-party", label: "Graduation" },
  { value: "baby-shower", label: "Baby shower / Pasni" },
  { value: "conference-seminar", label: "Conference or seminar" },
  { value: "photography-inquiry", label: "Photography only" },
  { value: "catering-inquiry", label: "Catering only" },
  { value: "venue-rental", label: "Venue only" },
  { value: "pricing-inquiry", label: "Just asking about prices" },
  { value: "others", label: "Something else" },
]

const BUDGETS = [
  { value: "", label: "Roughly what budget?" },
  { value: "10000-25000", label: "Rs 10,000 – 25,000" },
  { value: "25000-50000", label: "Rs 25,000 – 50,000" },
  { value: "50000-100000", label: "Rs 50,000 – 1,00,000" },
  { value: "100000-200000", label: "Rs 1,00,000 – 2,00,000" },
  { value: "200000-500000", label: "Rs 2,00,000 – 5,00,000" },
  { value: "500000-1000000", label: "Rs 5,00,000 – 10,00,000" },
  { value: "1000000+", label: "Over Rs 10,00,000" },
]

const EMPTY = { name: "", email: "", phone: "", subject: "", budget: "", message: "" }

const ContactForm = ({
  title = "Send us a message",
  description = "Tell us about your event and we'll come back within a day.",
  className = "",
  onSubmitSuccess,
  compact = false,
}) => {
  const [form, setForm] = useState(EMPTY)
  const [sending, setSending] = useState(false)

  const change = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      const result = await submitContactForm(form)
      if (!result.success) throw new Error(result.message)
      toast.success("Message sent. Our planners reply within a day.")
      setForm(EMPTY)
      onSubmitSuccess?.(form)
    } catch (error) {
      toast.error(error.message || "The message didn't send. Please try again.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className={`card ${compact ? "p-6 sm:p-7" : "p-7 sm:p-9"} ${className}`}>
      <h2 className="text-[22px]">{title}</h2>
      <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">{description}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="label">
              Your name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={change}
              disabled={sending}
              required
              placeholder="Full name"
              className="field"
            />
          </div>
          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={change}
              disabled={sending}
              required
              placeholder="you@example.com"
              className="field"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className="label">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={change}
              disabled={sending}
              required
              placeholder="98XXXXXXXX"
              className="field"
            />
          </div>
          <div>
            <label htmlFor="subject" className="label">
              Occasion
            </label>
            <select
              id="subject"
              name="subject"
              value={form.subject}
              onChange={change}
              disabled={sending}
              required
              className="field cursor-pointer"
            >
              {SUBJECTS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="budget" className="label">
            Budget
          </label>
          <select
            id="budget"
            name="budget"
            value={form.budget}
            onChange={change}
            disabled={sending}
            required
            className="field cursor-pointer"
          >
            {BUDGETS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-[12.5px] text-ink-mute">
            A range is enough — it tells us which venues and menus to suggest.
          </p>
        </div>

        <div>
          <label htmlFor="message" className="label">
            About the event
          </label>
          <textarea
            id="message"
            name="message"
            rows={compact ? 4 : 5}
            value={form.message}
            onChange={change}
            disabled={sending}
            required
            placeholder="Dates you're considering, how many guests, anything that matters to you."
            className="field resize-y"
          />
        </div>

        <button type="submit" disabled={sending} className="btn btn-accent group w-full py-3">
          {sending ? (
            <>
              <span className="loader h-4 w-4 border-white/40 border-t-white" />
              Sending…
            </>
          ) : (
            <>
              Send message
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default ContactForm
