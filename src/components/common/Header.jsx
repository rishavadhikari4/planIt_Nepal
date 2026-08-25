import { useContext, useState, useRef, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
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
  const [lifted, setLifted] = useState(false)
  const accountRef = useRef(null)

  /* The bar sits flush on the page at rest and lifts onto a hairline once you
     start reading — a small signal that the page has moved under it. */
  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

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
    <header
      className={`sticky top-0 z-50 w-full bg-paper/85 backdrop-blur-[10px] transition-[border-color,box-shadow] duration-500 ${
        lifted ? "border-b border-line shadow-[var(--shadow-sm)]" : "border-b border-transparent"
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center gap-4 px-5 transition-[height] duration-500 sm:px-6 lg:px-8 ${
          lifted ? "h-16" : "h-20"
        }`}
      >
        {/* Wordmark */}
        <Link to="/" className="group flex shrink-0 items-baseline gap-2 no-underline">
          <span className="font-display t-heading font-semibold text-crimson-deep">
            PlanIt
          </span>
          <span className="font-mono t-caption font-medium uppercase tracking-[0.22em] text-brass-deep">
            Nepal
          </span>
        </Link>

        {/* Desktop navigation. The brass thread marks where you are. */}
        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {NAV.map(({ path, label, step }) => (
            <Link
              key={path}
              to={path}
              aria-current={isActive(path) ? "page" : undefined}
              className={`relative px-3 py-2 t-small font-medium no-underline transition-colors duration-300 ${
                isActive(path)
                  ? "text-ink"
                  : "text-ink-mute hover:text-ink"
              }`}
            >
              {step && (
                <span className="mr-1.5 font-mono t-caption tracking-widest text-line-strong">
                  {step}
                </span>
              )}
              {label}
              {isActive(path) && (
                <motion.span
                  layoutId="nav-thread"
                  transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  className="absolute inset-x-3 -bottom-px block h-px bg-brass"
                />
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
              <span className="amount rounded-full bg-brass-deep px-1.5 py-px t-caption font-semibold text-white">
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
                    ? "border-crimson bg-crimson text-white"
                    : "border-line-strong bg-white text-ink-soft hover:border-ink-mute"
                }`}
              >
                {user.profileImage ? (
                  <img src={user.profileImage} alt="" className="h-full w-full object-cover" />
                ) : user.name ? (
                  <span className="t-small font-semibold">{user.name.charAt(0).toUpperCase()}</span>
                ) : (
                  <User className="h-[18px] w-[18px]" strokeWidth={1.75} />
                )}
              </button>

              <AnimatePresence>
              {accountOpen && (
                <motion.div
                  role="menu"
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="card absolute right-0 top-12 w-56 origin-top-right overflow-hidden p-1 shadow-lg"
                >
                  <div className="border-b border-line px-3 py-2.5">
                    <p className="truncate t-small font-semibold text-ink">
                      {user.name || "Your account"}
                    </p>
                    <p className="truncate font-mono t-caption text-ink-mute">{user.email}</p>
                  </div>
                  <button
                    role="menuitem"
                    onClick={goToProfile}
                    className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left t-small text-ink-soft hover:bg-gray-100 hover:text-ink"
                  >
                    <ClipboardList className="h-4 w-4" strokeWidth={1.75} />
                    Profile and orders
                  </button>
                  <button
                    role="menuitem"
                    onClick={() => logout()}
                    className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left t-small text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={1.75} />
                    Log out
                  </button>
                </motion.div>
              )}
              </AnimatePresence>
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
      <AnimatePresence>
      {menuOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden border-t border-line bg-surface lg:hidden"
        >
          <nav className="mx-auto max-w-7xl px-3 py-2">
            {NAV.map(({ path, label, step }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 rounded-md px-3 py-3 t-body no-underline ${
                  isActive(path)
                    ? "bg-gray-100 font-semibold text-ink"
                    : "text-ink-soft"
                }`}
              >
                <span className="w-6 font-mono t-caption tracking-widest text-line-strong">
                  {step || ""}
                </span>
                {label}
                {isActive(path) && <span className="thread ml-auto" />}
              </Link>
            ))}
          </nav>
        </motion.div>
      )}
      </AnimatePresence>
    </header>
  )
}

export default Header
