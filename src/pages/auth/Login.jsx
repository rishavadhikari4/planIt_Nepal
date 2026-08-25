import { useState, useContext, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import { AuthContext } from "../../context/AuthContext"
import AuthLayout, { Field, GoogleButton, Divider, FormError } from "../../components/common/AuthLayout"

const Login = () => {
  const { login, user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) navigate("/")
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err.response?.data?.message || "That email and password don't match. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Log in"
      subtitle="Pick up where you left off — your cart and bookings are waiting."
      footer={
        <p className="text-ink-soft">
          New here?{" "}
          <Link to="/register" className="font-semibold text-crimson no-underline hover:underline">
            Create an account
          </Link>
        </p>
      }
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

        <div className="flex justify-end">
          <Link
            to="/login/forgot-password"
            className="text-[13.5px] text-ink-mute no-underline hover:text-ink hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <button type="submit" disabled={loading} className="btn btn-accent w-full py-3">
          {loading ? (
            <>
              <span className="loader h-4 w-4 border-white/40 border-t-white" />
              Logging in…
            </>
          ) : (
            "Log in"
          )}
        </button>
      </form>

      <Divider />
      <GoogleButton />
    </AuthLayout>
  )
}

export default Login
