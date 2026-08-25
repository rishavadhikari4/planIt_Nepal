import { useState, useContext } from "react"
import { Link } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import { AuthContext } from "../../context/AuthContext"
import AuthLayout, { Field, FormError } from "../../components/common/AuthLayout"

const AdminLogin = () => {
  const { adminLogin } = useContext(AuthContext)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await adminLogin(email, password)
    } catch (err) {
      setError(err.response?.data?.message || "That email and password don't match an admin account.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Staff sign in"
      subtitle="This is the staff side of PlanIt Nepal. Customer accounts don't sign in here."
      aside={{
        headline: "The workbench behind the bookings.",
        body: "Orders, customers, inventory and reviews — everything the team runs the business from.",
      }}
      footer={
        <p className="text-ink-soft">
          Looking for your own bookings?{" "}
          <Link to="/login" className="font-semibold text-crimson no-underline hover:underline">
            Customer log in
          </Link>
        </p>
      }
    >
      <FormError>{error}</FormError>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field id="email" label="Work email">
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@planitnepal.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field"
            required
          />
        </Field>

        <Field id="password" label="Password">
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Your password"
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
        </Field>

        <button type="submit" disabled={loading} className="btn btn-accent w-full py-3">
          {loading ? (
            <>
              <span className="loader h-4 w-4 border-white/40 border-t-white" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </AuthLayout>
  )
}

export default AdminLogin
