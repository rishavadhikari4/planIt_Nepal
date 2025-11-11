import { useContext, useState, useRef, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { ShoppingCart, User,MessageCircle, Camera,ChefHat, Landmark, House } from "lucide-react"
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
    ...(isAuthenticated ? [] : [{ path: "/login", label: "Login", icon: User }]),
    { path: "/", label: "Home", icon: House },
    { path: "/venues", label: "Venues", icon: Landmark },
    { path: "/cuisines", label: "Catering", icon: ChefHat },
    { path: "/studios", label: "Studios", icon: Camera },
    { path: "/contact", label: "About Us", icon: MessageCircle }
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
      <nav className="container mx-auto flex justify-between items-center px-2 sm:px-4 lg:px-6 xl:px-8 py-2 sm:py-3">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent no-underline hover:scale-105 transition-transform duration-300 flex-shrink-0"
        >
          <span className="hidden sm:inline">PlanIt Nepal</span>
          <span className="sm:hidden">PlanIt</span>
        </Link>

        {/* Hamburger Menu Button - Show on smaller screens and landscape mobile */}
        <button
          className="relative w-6 h-6 sm:w-8 sm:h-8 lg:hidden focus:outline-none group"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span
            className={`block absolute h-0.5 w-full bg-white rounded-full transform transition-all duration-300 ease-in-out group-hover:bg-pink-200 ${
              isMenuOpen ? "rotate-45 top-2.5 sm:top-3.5" : "top-1.5 sm:top-2"
            }`}
          ></span>
          <span
            className={`block absolute h-0.5 w-full bg-white rounded-full transition-all duration-300 ease-in-out group-hover:bg-pink-200 ${
              isMenuOpen ? "opacity-0" : "top-2.5 sm:top-4"
            }`}
          ></span>
          <span
            className={`block absolute h-0.5 w-full bg-white rounded-full transform transition-all duration-300 ease-in-out group-hover:bg-pink-200 ${
              isMenuOpen ? "-rotate-45 top-2.5 sm:top-3.5" : "top-3.5 sm:top-6"
            }`}
          ></span>
        </button>

        {/* Navigation Links */}
        <div
          className={`flex lg:flex-row flex-col items-center lg:items-center lg:static absolute top-full left-0 right-0
  lg:bg-transparent bg-white/95 border-t border-white/20 lg:border-none
  shadow-xl lg:shadow-none lg:gap-1 xl:gap-2 2xl:gap-4 gap-3 p-4 lg:p-0 transition-all duration-500 ease-in-out
  max-h-[calc(100vh-60px)] overflow-y-auto lg:max-h-none lg:overflow-visible
  ${isMenuOpen ? "flex opacity-100 translate-y-0" : "hidden lg:flex opacity-0 lg:opacity-100 -translate-y-4 lg:translate-y-0"}`}
        >
          {/* Desktop Navigation with Flowing Indicator */}
          <div 
            ref={navRef}
            className="hidden lg:flex relative items-center gap-1 xl:gap-2 2xl:gap-4"
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
            
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                ref={(el) => linkRefs.current[path] = el}
                onClick={() => setIsMenuOpen(false)}
                onMouseEnter={() => handleMouseEnter(path)}
                className={`relative z-10 text-sm lg:text-base xl:text-lg px-2 lg:px-3 xl:px-4 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 whitespace-nowrap flex items-center gap-1.5 ${
                  location.pathname === path
                    ? "text-white font-bold"
                    : "text-white/90 hover:text-white"
                }`}
              >
                {Icon && <Icon className="w-4 h-4 lg:w-4 lg:h-4 xl:w-5 xl:h-5 flex-shrink-0" />}
                <span className="hidden xl:inline">{label}</span>
                <span className="xl:hidden">{label.split(' ')[0]}</span>
              </Link>
            ))}

            {/* Cart Icon - Desktop */}
            <Link
              to="/cart"
              ref={(el) => linkRefs.current['cart'] = el}
              onClick={handleCartClick}
              onMouseEnter={() => handleMouseEnter('cart')}
              className={`relative z-10 p-2 lg:p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
                isCartPath
                  ? "text-white font-bold"
                  : "text-white/90 hover:text-white"
              }`}
            >
              <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" />
              
              {/* Cart Item Count Badge */}
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] lg:min-w-[20px] h-4 lg:h-5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 lg:px-1.5 shadow-lg animate-pulse">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
              
              {/* Pulse indicator when cart is empty */}
              {cartItemCount === 0 && (
                <span className="absolute -top-1 -right-1 w-2 lg:w-3 h-2 lg:h-3 bg-pink-400/50 rounded-full"></span>
              )}
            </Link>

            {/* User Profile - Desktop */}
            {isAuthenticated && user && (
              <div className="relative inline-block" ref={dropdownRef}>
                <button
                  onClick={handleProfileClick}
                  onMouseEnter={() => handleMouseEnter('profile')}
                  ref={(el) => linkRefs.current['profile'] = el}
                  className={`relative z-10 w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-full bg-gradient-to-r from-white/20 to-pink-200/30 backdrop-blur-sm overflow-hidden cursor-pointer flex items-center justify-center select-none transition-all duration-300 transform hover:scale-110 hover:shadow-xl border-2 focus:outline-none focus:ring-2 focus:ring-white/50 ${
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
                      <span className={`font-bold text-sm lg:text-lg xl:text-xl ${isProfilePath ? 'text-white' : 'text-white'}`}>
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <User className={`w-3 h-3 lg:w-5 lg:h-5 xl:w-6 xl:h-6 ${isProfilePath ? 'text-white' : 'text-white'}`} />
                    )}
                  </div>
                </button>

                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 hover:opacity-20 transition-opacity duration-300 -z-10 blur-md"></div>
              </div>
            )}
          </div>

          {/* Mobile/Tablet Navigation (Landscape and Portrait) */}
          <div className="lg:hidden flex flex-col items-center gap-2 sm:gap-3 w-full max-w-sm mx-auto">
            {/* Grid layout for landscape mobile screens */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full sm:hidden landscape:grid landscape:grid-cols-3 landscape:gap-2">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-xs px-2 py-1.5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 text-center flex flex-col items-center gap-1 ${
                    location.pathname === path
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg font-bold"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white hover:shadow-lg"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                  <span className="text-xs leading-tight">{label.split(' ')[0]}</span>
                </Link>
              ))}
            </div>

            {/* Standard mobile layout for portrait */}
            <div className="hidden sm:flex flex-col gap-3 w-full landscape:hidden">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm sm:text-base px-4 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 text-center flex items-center justify-center gap-2 ${
                    location.pathname === path
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg font-bold"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white hover:shadow-lg"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            {/* Mobile Cart and Profile Section */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 w-full pt-2 border-t border-gray-200/50">
              {/* Mobile Cart Link */}
              <Link
                to="/cart"
                onClick={handleCartClick}
                className={`text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-1 sm:gap-2 relative ${
                  isCartPath
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg font-bold"
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white hover:shadow-lg"
                }`}
              >
                <div className="relative">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  {/* Mobile Cart Count Badge */}
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[14px] sm:min-w-[18px] h-3 sm:h-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 shadow-lg">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">Cart</span>
                <span className="sm:hidden">({cartItemCount})</span>
              </Link>

              {/* Mobile Profile Link */}
              {isAuthenticated && user && (
                <button
                  onClick={handleProfileClick}
                  className={`text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-1 sm:gap-2 ${
                    isProfilePath
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg font-bold"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white hover:shadow-lg"
                  }`}
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-white font-bold">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <span>Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
