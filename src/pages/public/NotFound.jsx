import { useLocation, useNavigate } from "react-router-dom"
import { ArrowRight } from "lucide-react"

const ELSEWHERE = [
  { label: "Venues", path: "/venues", detail: "Halls, lawns and conference floors" },
  { label: "Catering", path: "/cuisines", detail: "Menus priced per plate" },
  { label: "Studios", path: "/studios", detail: "Photo and video teams" },
]

const NotFound = () => {
  const navigate = useNavigate()
  const { state } = useLocation()

  return (
    <div className="flex min-h-[80vh] items-center bg-paper">
      <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-6 lg:px-8">
        <p className="eyebrow">Nothing here</p>

        {/* The number carries the page; no illustration needed. */}
        <p
          aria-hidden
          className="mt-6 select-none font-display text-[clamp(90px,22vw,200px)] font-semibold leading-[0.78] tracking-[-0.05em] text-line"
        >
          404
        </p>

        <h1 className="mt-8 t-title">
          That page doesn&rsquo;t exist.
        </h1>
        <p className="mt-4 max-w-[48ch] t-body leading-relaxed text-ink-soft">
          {state?.from
            ? `We couldn't find ${state.from}. It may have been removed, or the link may be wrong.`
            : "The link may be wrong, or whatever was here has been taken down."}
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <button onClick={() => navigate("/")} className="btn btn-accent group h-12 px-6">
            Back to home
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              strokeWidth={2}
            />
          </button>
          <button onClick={() => navigate(-1)} className="btn btn-ghost h-12 px-6">
            Go back
          </button>
        </div>

        <div className="mt-16">
          <p className="eyebrow">Or start here</p>
          <ul className="mt-5 divide-y divide-line border-y border-line">
            {ELSEWHERE.map((link, i) => (
              <li key={link.path}>
                <button
                  onClick={() => navigate(link.path)}
                  className="group flex w-full items-center gap-4 py-4 text-left"
                >
                  <span className="amount w-7 shrink-0 t-caption font-semibold text-brass-deep">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block t-body font-semibold text-ink">{link.label}</span>
                    <span className="block t-small text-ink-mute">{link.detail}</span>
                  </span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-line-strong transition-all group-hover:translate-x-1 group-hover:text-brass"
                    strokeWidth={2}
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default NotFound
