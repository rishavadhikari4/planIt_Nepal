import { useContext, useState, useRef, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { ShoppingBag, User, Menu, X, LogOut, ClipboardList } from "lucide-react"
import { AuthContext } from "../../context/AuthContext"
import { useCart } from "../../context/CartContext"
import { toast } from "react-toastify"

/* The three things you book, in the order you book them. The numbers are not
   decoration — a venue fixes the date, catering follows the venue, the studio
   follows both. */
const NAV = [
  { path: "/", label: "Home" },
  { path: "/venues", label: "Venues", step: "01" },
  { path: "/cuisines", label: "Catering", step: "02" },
  { path: "/studios", label: "Studios", step: "03" },
  { path: "/contact", label: "About" },
]

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useContext(AuthContext)
  const { cartItems } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef(null)

  const { pathname } = location
  const onProfile = pathname.startsWith("/user-profile")
  const onCart = pathname === "/cart"

  const cartCount = cartItems.reduce(
    (n, item) => n + (item.type === "dish" ? item.quantity || 1 : 1),
    0,
  )

  // Close the transient surfaces on navigation.
  useEffect(() => {
    setMenuOpen(false)
    setAccountOpen(false)
  }, [pathname])

  useEffect(() => {
    const onClickAway = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false)
    }
    const onEsc = (e) => {
      if (e.key === "Escape") {
        setAccountOpen(false)
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", onClickAway)
    document.addEventListener("keydown", onEsc)
    return () => {
      document.removeEventListener("mousedown", onClickAway)
      document.removeEventListener("keydown", onEsc)
    }
  }, [])

  const guardCart = (e) => {
    if (!isAuthenticated) {
      e.preventDefault()
      toast.info("Log in to see your cart.")
      navigate("/login")
    }
  }

  const goToProfile = () => {
    const id = user?._id || user?.id
    if (id) navigate(`/user-profile/${id}`)
    else toast.error("Your profile isn't available right now. Try logging in again.")
  }

  const isActive = (path) => (path === "/" ? pathname === "/" : pathname.startsWith(path))

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line bg-paper/95 backdrop-blur-[6px]">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-5 sm:px-6 lg:px-8">
        {/* Wordmark */}
        <Link to="/" className="group flex shrink-0 items-baseline gap-2 no-underline">
          <span className="font-display text-[22px] font-semibold tracking-[-0.03em] text-pine-deep">
            PlanIt
          </span>
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-marigold-deep">
            Nepal
          </span>
        </Link>

        {/* Desktop navigation. The marigold thread marks where you are. */}
        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {NAV.map(({ path, label, step }) => (
            <Link
              key={path}
              to={path}
              aria-current={isActive(path) ? "page" : undefined}
              className={`relative px-3 py-2 text-[14.5px] font-medium no-underline transition-colors ${
                isActive(path)
                  ? "text-ink"
                  : "text-ink-mute hover:text-ink"
              }`}
            >
              {step && (
                <span className="mr-1.5 font-mono text-[10px] tracking-widest text-line-strong">
                  {step}
                </span>
              )}
              {label}
              {isActive(path) && (
                <span className="absolute inset-x-3 -bottom-px block h-0.5 bg-marigold" />
              )}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Cart */}
          <Link
            to="/cart"
            onClick={guardCart}
            aria-label={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
            className={`relative flex h-10 items-center gap-2 rounded-md px-3 no-underline transition-colors ${
              onCart
                ? "bg-gray-100 text-ink"
                : "text-ink-soft hover:bg-gray-100 hover:text-ink"
            }`}
          >
            <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.75} />
            {cartCount > 0 && (
              <span className="amount rounded-full bg-marigold-deep px-1.5 py-px text-[11px] font-semibold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* Account */}
          {isAuthenticated && user ? (
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border transition-colors ${
                  onProfile || accountOpen
                    ? "border-pine bg-pine text-white"
                    : "border-line-strong bg-white text-ink-soft hover:border-ink-mute"
                }`}
              >
                {user.profileImage ? (
                  <img src={user.profileImage} alt="" className="h-full w-full object-cover" />
                ) : user.name ? (
                  <span className="text-[13px] font-semibold">{user.name.charAt(0).toUpperCase()}</span>
                ) : (
                  <User className="h-[18px] w-[18px]" strokeWidth={1.75} />
                )}
              </button>

              {accountOpen && (
                <div
                  role="menu"
                  className="card absolute right-0 top-12 w-56 overflow-hidden p-1 shadow-lg"
                >
                  <div className="border-b border-line px-3 py-2.5">
                    <p className="truncate text-[13.5px] font-semibold text-ink">
                      {user.name || "Your account"}
                    </p>
                    <p className="truncate font-mono text-[11px] text-ink-mute">{user.email}</p>
                  </div>
                  <button
                    role="menuitem"
                    onClick={goToProfile}
                    className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left text-[13.5px] text-ink-soft hover:bg-gray-100 hover:text-ink"
                  >
                    <ClipboardList className="h-4 w-4" strokeWidth={1.75} />
                    Profile and orders
                  </button>
                  <button
                    role="menuitem"
                    onClick={() => logout()}
                    className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left text-[13.5px] text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={1.75} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary ml-1 h-10 no-underline">
              Log in
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="ml-1 flex h-10 w-10 items-center justify-center rounded-md text-ink-soft hover:bg-gray-100 lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {menuOpen && (
        <div className="border-t border-line bg-surface lg:hidden">
          <nav className="mx-auto max-w-7xl px-3 py-2">
            {NAV.map(({ path, label, step }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 rounded-md px-3 py-3 text-[15px] no-underline ${
                  isActive(path)
                    ? "bg-gray-100 font-semibold text-ink"
                    : "text-ink-soft"
                }`}
              >
                <span className="w-6 font-mono text-[10px] tracking-widest text-line-strong">
                  {step || ""}
                </span>
                {label}
                {isActive(path) && <span className="thread ml-auto" />}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
