import { useEffect, useContext, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { AlertCircle, ArrowRight, Check } from "lucide-react"
import { AuthContext } from "../../context/AuthContext"
import { fetchLoginUser } from "../../services/users"

/* Where Google drops the customer after they approve. Nothing here is a
   decision — it either works and moves on, or it explains what to do next. */
function AuthSuccess() {
  const navigate = useNavigate()
  const { refreshAuth } = useContext(AuthContext)
  const [status, setStatus] = useState("working")
  const [user, setUser] = useState(null)
  const ran = useRef(false)

  useEffect(() => {
    // StrictMode mounts effects twice in dev; run the exchange once.
    if (ran.current) return
    ran.current = true

    const accessToken = new URLSearchParams(window.location.search).get("accessToken")
    if (!accessToken) {
      setStatus("error")
      return
    }

    ;(async () => {
      try {
        localStorage.setItem("accessToken", accessToken)
        const fullUser = await fetchLoginUser()
        localStorage.setItem("user", JSON.stringify(fullUser))
        setUser(fullUser)
        await refreshAuth()
        setStatus("done")
        setTimeout(() => navigate("/", { replace: true }), 1200)
      } catch {
        setStatus("error")
      }
    })()
  }, [navigate, refreshAuth])

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-5">
      <div className="w-full max-w-md">
        {status === "working" && (
          <div className="card p-8 text-center">
            <span className="loader mx-auto h-6 w-6" />
            <h1 className="mt-6 text-[22px]">Signing you in</h1>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
              Finishing up with Google. This takes a second.
            </p>
          </div>
        )}

        {status === "done" && (
          <div className="card p-8">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-crimson">
              <Check className="h-5 w-5 text-white" strokeWidth={2.5} />
            </span>
            <h1 className="mt-6 text-[24px]">
              Signed in{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
              Taking you back to where you left off.
            </p>
            <button
              onClick={() => navigate("/", { replace: true })}
              className="btn btn-accent group mt-7 w-full"
            >
              Continue
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="card p-8">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-600" strokeWidth={2} />
            </span>
            <h1 className="mt-6 text-[24px]">That sign-in didn&rsquo;t complete</h1>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
              Google didn&rsquo;t send us what we needed. Try again, or use your email and
              password instead.
            </p>
            <div className="mt-7 flex flex-col gap-2.5">
              <button onClick={() => navigate("/login")} className="btn btn-accent w-full">
                Back to log in
              </button>
              <button onClick={() => navigate("/")} className="btn btn-ghost w-full">
                Go to home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthSuccess
