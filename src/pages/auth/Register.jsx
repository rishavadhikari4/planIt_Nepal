import { useState, useContext, useEffect } from "react"
import { Link } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import { AuthContext } from "../../context/AuthContext"
import AuthLayout, { Field, GoogleButton, Divider, FormError } from "../../components/common/AuthLayout"

/* Strength is scored on what the password actually contains, and the meter says
   what is missing rather than just how bad it is. */
const RULES = [
  { test: (p) => p.length >= 8, label: "8 characters" },
  { test: (p) => /[A-Z]/.test(p), label: "an uppercase letter" },
  { test: (p) => /[a-z]/.test(p), label: "a lowercase letter" },
  { test: (p) => /[0-9]/.test(p), label: "a number" },
  { test: (p) => /[^A-Za-z0-9]/.test(p), label: "a symbol" },
]

const STRENGTH = ["Very weak", "Weak", "Fair", "Good", "Strong"]

const Register = () => {
  const { signup } = useContext(AuthContext)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [mismatch, setMismatch] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMismatch(confirmPassword && password !== confirmPassword ? "These two don't match." : "")
  }, [password, confirmPassword])

  const met = RULES.filter((r) => r.test(password))
  const missing = RULES.filter((r) => !r.test(password))
  const score = met.length

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (mismatch) return
    setError("")
    setLoading(true)
    try {
      await signup(name, email, phone, password, confirmPassword)
    } catch (err) {
      setError(err.response?.data?.message || "We couldn't create the account. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="One account holds your cart, your bookings and your receipts."
      aside={{
        headline: "Book the whole event before someone else takes the date.",
        body: "Venues, catering and studios across Nepal, with real availability and real prices. A 25% advance holds everything.",
      }}
      footer={
        <p className="text-ink-soft">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-crimson no-underline hover:underline">
            Log in
          </Link>
        </p>
      }
    >
      <FormError>{error}</FormError>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field id="name" label="Full name">
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field"
            required
          />
        </Field>

        <Field id="email" label="Email" hint="Receipts and booking confirmations go here.">
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field"
            required
          />
        </Field>

        <Field id="phone" label="Phone" hint="So our planners can reach you about your booking.">
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="98XXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="field"
            required
          />
        </Field>

        <Field id="password" label="Password">
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Choose a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field pr-11"
              required
            />
            {password && (
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-ink-mute hover:text-ink"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                ) : (
                  <Eye className="h-4 w-4" strokeWidth={1.75} />
                )}
              </button>
            )}
          </div>

          {password && (
            <div className="mt-2.5">
              <div className="flex gap-1" aria-hidden>
                {RULES.map((_, i) => (
                  <span
                    key={i}
                    className={`h-[3px] flex-1 rounded-full ${
                      i < score
                        ? score <= 2
                          ? "bg-red-400"
                          : score <= 3
                            ? "bg-brass"
                            : "bg-green-500"
                        : "bg-line"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-[12.5px] text-ink-mute">
                <span className="font-semibold text-ink-soft">{STRENGTH[Math.max(0, score - 1)]}</span>
                {missing.length > 0 && ` — add ${missing.map((r) => r.label).join(", ")}.`}
              </p>
            </div>
          )}
        </Field>

        <Field id="confirmPassword" label="Confirm password" error={mismatch}>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Type it again"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="field"
            required
          />
        </Field>

        <button
          type="submit"
          disabled={loading || Boolean(mismatch)}
          className="btn btn-accent w-full py-3"
        >
          {loading ? (
            <>
              <span className="loader h-4 w-4 border-white/40 border-t-white" />
              Creating your account…
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <Divider />
      <GoogleButton label="Sign up with Google" />
    </AuthLayout>
  )
}

export default Register
