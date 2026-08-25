import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { ArrowLeft, Check, Eye, EyeOff } from "lucide-react"
import { toast } from "react-toastify"
import { postResetPassword } from "../../services/auth"
import AuthLayout, { Field, FormError } from "../../components/common/AuthLayout"

const RULES = [
  { test: (p) => p.length >= 8, label: "8 characters" },
  { test: (p) => /[A-Z]/.test(p), label: "an uppercase letter" },
  { test: (p) => /[a-z]/.test(p), label: "a lowercase letter" },
  { test: (p) => /[0-9]/.test(p), label: "a number" },
  { test: (p) => /[^A-Za-z0-9]/.test(p), label: "a symbol" },
]

const STRENGTH = ["Very weak", "Weak", "Fair", "Good", "Strong"]
const MIN_SCORE = 3

const ASIDE = {
  headline: "One link, one new password.",
  body: "Choose something you haven't used elsewhere. You'll be back in your bookings in a moment.",
}

const ResetPassword = () => {
  const { resetToken } = useParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)
  const [tokenValid, setTokenValid] = useState(true)

  useEffect(() => {
    if (!resetToken) setTokenValid(false)
  }, [resetToken])

  const met = RULES.filter((r) => r.test(password))
  const missing = RULES.filter((r) => !r.test(password))
  const score = met.length
  const mismatch = confirm && password !== confirm ? "These two don't match." : ""

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (mismatch) return
    if (score < MIN_SCORE) {
      setError(`Add ${missing.map((r) => r.label).join(", ")} before continuing.`)
      return
    }

    setLoading(true)
    try {
      await postResetPassword(resetToken, password, confirm)
      setDone(true)
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "We couldn't reset the password. Try again."
      if (/expired|invalid/i.test(message)) {
        setTokenValid(false)
        toast.error("That reset link has expired. Request a new one.")
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!tokenValid) {
    return (
      <AuthLayout
        title="This link has expired"
        subtitle="Reset links work once and last an hour. Request a fresh one and we'll email it straight away."
        aside={ASIDE}
        footer={
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-ink-soft no-underline hover:text-ink hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Back to log in
          </Link>
        }
      >
        <button
          onClick={() => navigate("/login/forgot-password")}
          className="btn btn-primary w-full py-3"
        >
          Send a new reset link
        </button>
      </AuthLayout>
    )
  }

  if (done) {
    return (
      <AuthLayout
        title="Password updated"
        subtitle="Your new password is active. Log in with it to pick up where you left off."
        aside={ASIDE}
      >
        <div className="card mb-6 flex items-center gap-3 p-5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pine">
            <Check className="h-4 w-4 text-white" strokeWidth={3} />
          </span>
          <p className="text-[14px] text-ink-soft">
            The old password no longer works on this account.
          </p>
        </div>

        <button onClick={() => navigate("/login")} className="btn btn-primary w-full py-3">
          Log in
        </button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Pick something you haven't used on another site."
      aside={ASIDE}
      footer={
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-ink-soft no-underline hover:text-ink hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Back to log in
        </Link>
      }
    >
      <FormError>{error}</FormError>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field id="password" label="New password">
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
                            ? "bg-marigold"
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

        <Field id="confirm" label="Confirm new password" error={mismatch}>
          <input
            id="confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Type it again"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="field"
            required
          />
        </Field>

        <button
          type="submit"
          disabled={loading || Boolean(mismatch) || score < MIN_SCORE}
          className="btn btn-primary w-full py-3"
        >
          {loading ? (
            <>
              <span className="loader h-4 w-4 border-white/40 border-t-white" />
              Updating your password…
            </>
          ) : (
            "Update password"
          )}
        </button>
      </form>
    </AuthLayout>
  )
}

export default ResetPassword
