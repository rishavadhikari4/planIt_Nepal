"use client"

import { useContext, useState, useRef, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { ShoppingCart } from "lucide-react"
import { AuthContext } from "../context/AuthContext"
import { toast } from "react-toastify"

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useContext(AuthContext)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen)

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
    if (user && user._id) {
      navigate(`/user-profile/${user._id}`)
      setIsDropdownOpen(false)
      setIsMenuOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 shadow-2xl backdrop-blur-md">
      <nav className="container mx-auto flex justify-between items-center px-4 sm:px-6 py-4">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent no-underline hover:scale-105 transition-transform duration-300"
        >
          Wedding Planner
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
  md:bg-transparent bg-white/95 backdrop-blur-md border-t border-white/20 md:border-none
  shadow-xl md:shadow-none md:gap-2 lg:gap-4 gap-3 p-6 md:p-0 transition-all duration-500 ease-in-out
  ${isMenuOpen ? "flex opacity-100 translate-y-0" : "hidden md:flex opacity-0 md:opacity-100 -translate-y-4 md:translate-y-0"}`}
        >
          {!isAuthenticated && (
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className={`text-base lg:text-lg px-4 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                location.pathname === "/login"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg font-bold"
                  : "text-gray-700 md:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white hover:shadow-lg"
              }`}
            >
              Login
            </Link>
          )}

          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className={`text-base lg:text-lg px-4 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
              location.pathname === "/"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg font-bold"
                : "text-gray-700 md:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white hover:shadow-lg"
            }`}
          >
            Home
          </Link>

          <Link
            to="/venues"
            onClick={() => setIsMenuOpen(false)}
            className={`text-base lg:text-lg px-4 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
              location.pathname === "/venues"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg font-bold"
                : "text-gray-700 md:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white hover:shadow-lg"
            }`}
          >
            Venues
          </Link>

          <Link
            to="/dishes"
            onClick={() => setIsMenuOpen(false)}
            className={`text-base lg:text-lg px-4 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
              location.pathname === "/dishes"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg font-bold"
                : "text-gray-700 md:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white hover:shadow-lg"
            }`}
          >
            Catering
          </Link>

          <Link
            to="/decorations"
            onClick={() => setIsMenuOpen(false)}
            className={`text-base lg:text-lg px-4 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
              location.pathname === "/decorations"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg font-bold"
                : "text-gray-700 md:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white hover:shadow-lg"
            }`}
          >
            Decorations
          </Link>

          <Link
            to="/contact"
            onClick={() => setIsMenuOpen(false)}
            className={`text-base lg:text-lg px-4 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
              location.pathname === "/contact"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg font-bold"
                : "text-gray-700 md:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white hover:shadow-lg"
            }`}
          >
            About Us
          </Link>

          {/* Cart Icon */}
          <Link
            to="/cart"
            onClick={handleCartClick}
            className={`p-3 rounded-full text-gray-700 md:text-white transition-all duration-300 transform hover:scale-110 relative group ${
              location.pathname === "/cart"
                ? "bg-white/20 backdrop-blur-sm shadow-lg"
                : "hover:bg-white/20 hover:backdrop-blur-sm hover:shadow-lg"
            }`}
          >
            <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full animate-pulse"></span>
          </Link>

          {/* User Profile */}
          {isAuthenticated && user && (
            <div className="relative inline-block" ref={dropdownRef}>
              <div
                onClick={handleProfileClick}
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-r from-white/20 to-pink-200/30 backdrop-blur-sm overflow-hidden cursor-pointer flex items-center justify-center select-none transition-all duration-300 transform hover:scale-110 hover:shadow-xl border-2 border-white/30"
              >
                {user.profileImage ? (
                  <img
                    src={user.profileImage || "/placeholder.svg"}
                    alt="User"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="font-bold text-white text-lg lg:text-xl">{user.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>

              {/* Optional: Add a subtle glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 hover:opacity-20 transition-opacity duration-300 -z-10 blur-md"></div>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Header
