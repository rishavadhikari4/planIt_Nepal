import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, MailCheck } from "lucide-react"
import { postForgotEmail } from "../../services/auth"
import AuthLayout, { Field, FormError } from "../../components/common/AuthLayout"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await postForgotEmail(email)
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || "We couldn't send the email. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const backToLogin = (
    <Link
      to="/login"
      className="inline-flex items-center gap-1.5 text-ink-soft no-underline hover:text-ink hover:underline"
    >
      <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
      Back to log in
    </Link>
  )

  if (sent) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle={`If an account exists for ${email}, a reset link is on its way. The link works once and expires in an hour.`}
        aside={{
          headline: "Locked out? It happens.",
          body: "One email, one link, and you're back to your bookings.",
        }}
        footer={backToLogin}
      >
        <div className="card flex gap-4 p-5">
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-crimson" strokeWidth={1.75} />
          <div className="text-[14px] leading-relaxed text-ink-soft">
            <p className="font-semibold text-ink">Nothing in your inbox?</p>
            <p className="mt-1">
              Give it a minute, then check your spam folder before trying again.
            </p>
          </div>
        </div>

        <button onClick={() => setSent(false)} className="btn btn-ghost mt-5 w-full py-3">
          Send it to a different address
        </button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the email on your account and we'll send you a link to set a new password."
      aside={{
        headline: "Locked out? It happens.",
        body: "One email, one link, and you're back to your bookings.",
      }}
      footer={backToLogin}
    >
      <FormError>{error}</FormError>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field id="email" label="Email">
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

        <button type="submit" disabled={loading} className="btn btn-accent w-full py-3">
          {loading ? (
            <>
              <span className="loader h-4 w-4 border-white/40 border-t-white" />
              Sending the link…
            </>
          ) : (
            "Send reset link"
          )}
        </button>
      </form>
    </AuthLayout>
  )
}

export default ForgotPassword
