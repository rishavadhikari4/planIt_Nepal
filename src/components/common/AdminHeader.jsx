"use client"

import { useContext, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import { toast } from "react-toastify"
import { motion, AnimatePresence } from "framer-motion"
import {
  Crown,
  Menu,
  X,
  Home,
  MapPin,
  UtensilsCrossed,
  MessageSquare,
  LogOut,
  Bell,
  Camera
} from "lucide-react"

const AdminHeader = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const {  isAdmin, adminLogout } = useContext(AuthContext)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen((prev) => !prev)

  const navLinks = [
    { path: "/admin", label: "Dashboard", icon: Home },
    { path: "/admin-venues", label: "Venues", icon: MapPin },
    { path: "/admin-cuisines", label: "Catering", icon: UtensilsCrossed },
    { path: "/admin-studios", label: "studios", icon: Camera },
    { path: "/admin-contact", label: "Contact", icon: MessageSquare },
  ]

  const handleLogout = () => {
    if (isAdmin) {
      adminLogout()
      toast.success("Logged out successfully")
      navigate("/")
    } else {
      toast.info("You are not authorized")
    }
    setIsMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <nav className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/admin" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <p className="text-xs text-gray-500">PlanIt Nepal</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const IconComponent = link.icon
              const isActive = location.pathname === link.path

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    relative flex items-center space-x-2 px-4 py-2 rounded-xl
                    transition-all duration-200 group
                    ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="font-medium text-sm">{link.label}</span>

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                      layoutId="activeIndicator"
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Desktop Logout Button */}
            {isAdmin && (
              <button
                onClick={handleLogout}
                className="hidden lg:flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium text-sm">Logout</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={toggleMenu}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-gray-200/50 py-4"
            >
              <div className="space-y-2">
                {navLinks.map((link) => {
                  const IconComponent = link.icon
                  const isActive = location.pathname === link.path

                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`
                        flex items-center space-x-3 px-4 py-3 rounded-xl
                        transition-all duration-200
                        ${
                          isActive
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                            : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
                    >
                      <div
                        className={`
                        w-8 h-8 rounded-lg flex items-center justify-center
                        ${isActive ? "bg-white/20" : "bg-gray-200"}
                      `}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  )
                })}

                {/* Mobile Logout */}
                { isAdmin && (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                      <LogOut className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="font-medium">Logout</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}

export default AdminHeader
