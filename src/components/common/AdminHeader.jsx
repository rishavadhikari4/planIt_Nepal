import { useContext, useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import { toast } from "react-toastify"
import { Menu, X, LayoutGrid, MapPin, UtensilsCrossed, Camera, Receipt, Inbox, LogOut } from "lucide-react"

const LINKS = [
  { path: "/admin", label: "Dashboard", icon: LayoutGrid, exact: true },
  { path: "/admin-orders", label: "Orders", icon: Receipt },
  { path: "/admin-venues", label: "Venues", icon: MapPin },
  { path: "/admin-cuisines", label: "Catering", icon: UtensilsCrossed },
  { path: "/admin-studios", label: "Studios", icon: Camera },
  { path: "/admin-contact", label: "Enquiries", icon: Inbox },
]

const AdminHeader = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { isAdmin, adminLogout } = useContext(AuthContext)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => setMenuOpen(false), [pathname])

  const handleLogout = () => {
    if (!isAdmin) return toast.info("You are not signed in as an admin.")
    adminLogout()
    toast.success("Signed out.")
    navigate("/")
  }

  const isActive = (link) => (link.exact ? pathname === link.path : pathname.startsWith(link.path))

  return (
    /* The staff side runs on ink rather than paper — you always know which
       side of the product you are standing on. */
    <header className="sticky top-0 z-50 w-full border-b border-crimson-deep bg-crimson-deep">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-5 sm:px-6 lg:px-8">
        <Link to="/admin" className="flex shrink-0 items-baseline gap-2 no-underline">
          <span className="font-display text-[20px] font-semibold tracking-[-0.03em] text-white">PlanIt</span>
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-brass-lift">
            Staff
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-0.5 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              aria-current={isActive(link) ? "page" : undefined}
              className={`relative flex items-center gap-2 px-3 py-2 text-[14px] font-medium no-underline transition-colors ${
                isActive(link) ? "text-white" : "text-white/60 hover:text-white"
              }`}
            >
              <link.icon className="h-4 w-4" strokeWidth={1.75} />
              {link.label}
              {isActive(link) && (
                <span className="absolute inset-x-3 -bottom-[9px] block h-0.5 bg-brass" />
              )}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/"
            className="hidden text-[13.5px] text-white/60 no-underline hover:text-white lg:block"
          >
            View site
          </Link>
          {isAdmin && (
            <button
              onClick={handleLogout}
              className="hidden h-9 items-center gap-2 rounded-md px-3 text-[13.5px] font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white lg:flex"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
              Sign out
            </button>
          )}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-md text-white/80 hover:bg-white/10 lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 px-3 py-2 lg:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 rounded-md px-3 py-3 text-[15px] no-underline ${
                isActive(link) ? "bg-white/10 font-semibold text-white" : "text-white/70"
              }`}
            >
              <link.icon className="h-4 w-4" strokeWidth={1.75} />
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-[15px] text-red-300"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
              Sign out
            </button>
          )}
        </div>
      )}
    </header>
  )
}

export default AdminHeader
