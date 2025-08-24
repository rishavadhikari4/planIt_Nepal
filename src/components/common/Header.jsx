import { useContext, useState, useRef, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { ShoppingCart, User } from "lucide-react"
import { AuthContext } from "../../context/AuthContext"
import { useCart } from "../../context/CartContext"
import { toast } from "react-toastify"

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useContext(AuthContext)
  const { cartItems } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 })
  const dropdownRef = useRef(null)
  const navRef = useRef(null)
  const linkRefs = useRef({})

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen)

  const navItems = [
    ...(isAuthenticated ? [] : [{ path: "/login", label: "Login" }]),
    { path: "/", label: "Home" },
    { path: "/venues", label: "Venues" },
    { path: "/cuisines", label: "Catering" },
    { path: "/studios", label: "Studios" },
    { path: "/contact", label: "About Us" }
  ]

  const isProfilePath = location.pathname.startsWith('/user-profile')
  const isCartPath = location.pathname === '/cart'

  const cartItemCount = cartItems.reduce((total, item) => {
    if (item.type === 'dish') {
      return total + (item.quantity || 1)
    } else {
      return total + 1
    }
  }, 0)

  const updateIndicator = (targetPath) => {
    const targetRef = linkRefs.current[targetPath]
    if (targetRef && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect()
      const targetRect = targetRef.getBoundingClientRect()
      
      setIndicatorStyle({
        left: targetRect.left - navRect.left,
        width: targetRect.width,
        opacity: 1
      })
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isProfilePath) {
        updateIndicator('profile')
      } else if (isCartPath) {
        updateIndicator('cart')
      } else {
        updateIndicator(location.pathname)
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [location.pathname, isProfilePath, isCartPath])

  const handleMouseEnter = (path) => {
    updateIndicator(path)
  }

  const handleMouseLeave = () => {
    if (isProfilePath) {
      updateIndicator('profile')
    } else if (isCartPath) {
      updateIndicator('cart')
    } else {
      updateIndicator(location.pathname)
    }
  }

  const handleCartClick = (e) => {
    setIsMenuOpen(false)
    if (!isAuthenticated) {
      e.preventDefault()
      toast.info("Please log in to view your cart.")
      setTimeout(() => {
        navigate("/login")
      }, 1000)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleProfileClick = () => {
    if (user) {
      const userId = user._id || user.id;
      
      if (userId) {
        navigate(`/user-profile/${userId}`)
      } else {
        navigate('/user-profile')
      }
      setIsDropdownOpen(false)
      setIsMenuOpen(false)
    } else {
      toast.error("User profile not available")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-purple-600/80 via-purple-800/70 to-pink-800/80 shadow-2xl backdrop-blur-md">
      <nav className="container mx-auto flex justify-between items-center px-4 sm:px-6 py-3">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent no-underline hover:scale-105 transition-transform duration-300"
        >
          PlanIt Nepal
        </Link>

        {/* Hamburger Menu Button */}
        <button
          className="relative w-8 h-8 md:hidden focus:outline-none group"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span
            className={`block absolute h-0.5 w-8 bg-white rounded-full transform transition-all duration-300 ease-in-out group-hover:bg-pink-200 ${
              isMenuOpen ? "rotate-45 top-3.5" : "top-2"
            }`}
          ></span>
          <span
            className={`block absolute h-0.5 w-8 bg-white rounded-full transition-all duration-300 ease-in-out group-hover:bg-pink-200 ${
              isMenuOpen ? "opacity-0" : "top-4"
            }`}
          ></span>
          <span
            className={`block absolute h-0.5 w-8 bg-white rounded-full transform transition-all duration-300 ease-in-out group-hover:bg-pink-200 ${
              isMenuOpen ? "-rotate-45 top-3.5" : "top-6"
            }`}
          ></span>
        </button>

        {/* Navigation Links */}
        <div
          className={`flex md:flex-row flex-col items-center md:items-center md:static absolute top-full left-0 right-0
  md:bg-transparent bg-white/95 border-t border-white/20 md:border-none
  shadow-xl md:shadow-none md:gap-2 lg:gap-4 gap-3 p-6 md:p-0 transition-all duration-500 ease-in-out
  ${isMenuOpen ? "flex opacity-100 translate-y-0" : "hidden md:flex opacity-0 md:opacity-100 -translate-y-4 md:translate-y-0"}`}
        >
          {/* Desktop Navigation with Flowing Indicator */}
          <div 
            ref={navRef}
            className="hidden md:flex relative items-center gap-2 lg:gap-4"
            onMouseLeave={handleMouseLeave}
          >
            {/* Flowing Background Indicator */}
            <div
              className="absolute top-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg z-0"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                height: '100%',
                opacity: indicatorStyle.opacity,
                transform: 'translateZ(0)',
                transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
              }}
            />
            
            {navItems.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                ref={(el) => linkRefs.current[path] = el}
                onClick={() => setIsMenuOpen(false)}
                onMouseEnter={() => handleMouseEnter(path)}
                className={`relative z-10 text-base lg:text-lg px-4 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                  location.pathname === path
                    ? "text-white font-bold"
                    : "text-white/90 hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}

            {/* Cart Icon - Now inside the navigation container */}
            <Link
              to="/cart"
              ref={(el) => linkRefs.current['cart'] = el}
              onClick={handleCartClick}
              onMouseEnter={() => handleMouseEnter('cart')}
              className={`relative z-10 p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
                isCartPath
                  ? "text-white font-bold"
                  : "text-white/90 hover:text-white"
              }`}
            >
              <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6" />
              
              {/* Cart Item Count Badge */}
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5 shadow-lg animate-pulse">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
              
              {/* Pulse indicator when cart is empty (optional) */}
              {cartItemCount === 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400/50 rounded-full"></span>
              )}
            </Link>

            {/* User Profile - Now inside the navigation container */}
            {isAuthenticated && user && (
              <div className="relative inline-block" ref={dropdownRef}>
                <button
                  onClick={handleProfileClick}
                  onMouseEnter={() => handleMouseEnter('profile')}
                  ref={(el) => linkRefs.current['profile'] = el}
                  className={`relative z-10 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-r from-white/20 to-pink-200/30 backdrop-blur-sm overflow-hidden cursor-pointer flex items-center justify-center select-none transition-all duration-300 transform hover:scale-110 hover:shadow-xl border-2 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                    isProfilePath
                      ? "border-white/50 shadow-xl"
                      : "border-white/30"
                  }`}
                  type="button"
                  aria-label="User profile"
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={`${user.name || 'User'} profile`}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  
                  <div 
                    className={`w-full h-full flex items-center justify-center ${user.profileImage ? 'hidden' : 'flex'}`}
                  >
                    {user.name ? (
                      <span className={`font-bold text-lg lg:text-xl ${isProfilePath ? 'text-white' : 'text-white'}`}>
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <User className={`w-5 h-5 lg:w-6 lg:h-6 ${isProfilePath ? 'text-white' : 'text-white'}`} />
                    )}
                  </div>
                </button>

                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 hover:opacity-20 transition-opacity duration-300 -z-10 blur-md"></div>
              </div>
            )}
          </div>

          {/* Mobile Navigation (No flowing indicator, simpler) */}
          <div className="md:hidden flex flex-col items-center gap-3 w-full">
            {navItems.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsMenuOpen(false)}
                className={`text-base lg:text-lg px-4 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                  location.pathname === path
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg font-bold"
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white hover:shadow-lg"
                }`}
              >
                {label}
              </Link>
            ))}

            {/* Mobile Cart Link */}
            <Link
              to="/cart"
              onClick={handleCartClick}
              className={`text-base lg:text-lg px-4 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2 relative ${
                isCartPath
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg font-bold"
                  : "text-gray-700 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white hover:shadow-lg"
              }`}
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {/* Mobile Cart Count Badge */}
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[18px] h-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 shadow-lg">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </div>
              <span>Cart {cartItemCount > 0 && `(${cartItemCount})`}</span>
            </Link>

            {/* Mobile Profile Link */}
            {isAuthenticated && user && (
              <button
                onClick={handleProfileClick}
                className={`text-base lg:text-lg px-4 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                  isProfilePath
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg font-bold"
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white hover:shadow-lg"
                }`}
              >
                Profile
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
