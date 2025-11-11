"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Package, Users, Star, Settings, Menu, HandCoins, AlertCircle, X } from "lucide-react"
import { toast } from "react-toastify"
import AdminOrderList from "./OrderManagement"
import AdminUserList from "./UserManagement"
import AdminReviews from "./ReviewManagement"
import { getAllOrders } from "../../services/orders"
import { fetchUsers } from "../../services/users"
import { getAllReviews } from "../../services/reviews"

const Admin = () => {
  const [activeTab, setActiveTab] = useState("orders")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [reviews, setReviews] = useState([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [activeOrders, setActiveOrders] = useState([])
  const [loadingStates, setLoadingStates] = useState({ orders: true, users: true, reviews: true })
  const [errorStates, setErrorStates] = useState({ orders: null, users: null, reviews: null })

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingStates((prev) => ({ ...prev, orders: true }))
        setErrorStates((prev) => ({ ...prev, orders: null }))
        const response = await getAllOrders()
        let ordersData = []
        if (response?.orders && Array.isArray(response.orders)) ordersData = response.orders
        else if (response?.data?.orders && Array.isArray(response.data.orders)) ordersData = response.data.orders
        else if (Array.isArray(response)) ordersData = response

        const completed = ordersData.filter((order) => order.status === "completed")
        setTotalRevenue(completed.reduce((sum, order) => sum + (order.totalAmount || 0), 0))
        setActiveOrders(ordersData.filter((order) => ["processing", "pending", "confirmed"].includes(order.status)))
        setOrders(ordersData)
      } catch (error) {
        setErrorStates((prev) => ({ ...prev, orders: error.message || "Failed to fetch orders" }))
        // Don't show toast error for empty arrays
        if (!Array.isArray(error.response?.data) || error.response?.data.length > 0) {
          toast.error(error.message || "Failed to fetch orders")
        }
        setOrders([])
      } finally {
        setLoadingStates((prev) => ({ ...prev, orders: false }))
      }
    }
    fetchOrders()
  }, [])

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        setLoadingStates((prev) => ({ ...prev, users: true }))
        setErrorStates((prev) => ({ ...prev, users: null }))
        const usersData = await fetchUsers()
        setUsers(Array.isArray(usersData) ? usersData : [])
      } catch (error) {
        setErrorStates((prev) => ({ ...prev, users: error.message || "Failed to fetch users" }))
        // Don't show toast error for empty arrays
        if (!Array.isArray(error.response?.data) || error.response?.data.length > 0) {
          toast.error(error.message || "Failed to fetch users")
        }
        setUsers([])
      } finally {
        setLoadingStates((prev) => ({ ...prev, users: false }))
      }
    }
    fetchUsersData()
  }, [])

  useEffect(() => {
    const fetchReviewsData = async () => {
      try {
        setLoadingStates((prev) => ({ ...prev, reviews: true }))
        setErrorStates((prev) => ({ ...prev, reviews: null }))
        const reviewsData = await getAllReviews()
        setReviews(Array.isArray(reviewsData) ? reviewsData : [])
      } catch (error) {
        setErrorStates((prev) => ({ ...prev, reviews: error.message || "Failed to fetch reviews" }))
        // Don't show toast error for empty arrays
        if (!Array.isArray(error.response?.data) || error.response?.data.length > 0) {
          toast.error(error.message || "Failed to fetch reviews")
        }
        setReviews([])
      } finally {
        setLoadingStates((prev) => ({ ...prev, reviews: false }))
      }
    }
    fetchReviewsData()
  }, [])

  const isInitialLoading = Object.values(loadingStates).some((loading) => loading)

  const fadeVariant = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  }

  const navigationItems = [
    { id: "orders", label: "Orders", icon: Package, color: "from-blue-500 to-indigo-600", count: orders.length, loading: loadingStates.orders, error: errorStates.orders },
    { id: "users", label: "Users", icon: Users, color: "from-emerald-500 to-teal-600", count: users.length, loading: loadingStates.users, error: errorStates.users },
    { id: "review", label: "Reviews", icon: Star, color: "from-amber-500 to-orange-600", count: reviews.length, loading: loadingStates.reviews, error: errorStates.reviews },
  ]

  const calculateAverageRating = () => {
    if (!Array.isArray(reviews) || reviews.length === 0) return "0.0"
    const total = reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0)
    return (total / reviews.length).toFixed(1)
  }

  const stats = [
    { label: "Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: HandCoins, color: "text-green-600", loading: loadingStates.orders, error: errorStates.orders },
    { label: "Active", value: loadingStates.orders ? "..." : activeOrders.length.toString(), icon: Package, color: "text-blue-600", loading: loadingStates.orders, error: errorStates.orders },
    { label: "Users", value: loadingStates.users ? "..." : users.length.toString(), icon: Users, color: "text-purple-600", loading: loadingStates.users, error: errorStates.users },
    { label: "Avg Rating", value: loadingStates.reviews ? "..." : calculateAverageRating(), icon: Star, color: "text-yellow-600", loading: loadingStates.reviews, error: errorStates.reviews },
  ]

  const handleTabChange = (tabId) => {
    if (tabId !== "settings") {
      setActiveTab(tabId)
      setSidebarOpen(false)
    }
  }

  // Show initial loading screen
  if (isInitialLoading) {
    return (
      <div className="min-h-screen pt-1 landscape:pt-2 sm:pt-3 md:pt-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-2 landscape:p-1 sm:p-4">
        <motion.div className="flex flex-col items-center space-y-3 landscape:space-y-2 sm:space-y-4 p-3 landscape:p-2 sm:p-4 max-w-xs w-full">
          <div className="relative">
            <div className="w-8 h-8 landscape:w-8 landscape:h-8 sm:w-10 sm:h-10 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="w-5 h-5 landscape:w-5 landscape:h-5 sm:w-7 sm:h-7 border-2 border-purple-200 border-t-purple-600 rounded-full absolute top-1.5 landscape:top-1.5 sm:top-1.5 left-1.5 landscape:left-1.5 sm:left-1.5 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.2s" }}></div>
          </div>
          <div className="text-center">
            <h3 className="text-base landscape:text-base sm:text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">Loading...</h3>
            <p className="text-slate-500 text-xs landscape:text-sm sm:text-sm">Fetching data</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-1 landscape:pt-2 sm:pt-3 md:pt-4">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed */}
      <aside className={`fixed top-13 landscape:top-14 sm:top-17 md:top-20 left-0 bottom-0 z-40 lg:relative lg:top-0 lg:h-full w-60 landscape:w-60 sm:w-64 lg:w-16 xl:w-56 2xl:w-64 bg-white/95 backdrop-blur-xl border-r border-slate-200/50 shadow-lg transition-all duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} flex flex-col`}>
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-3 landscape:p-3 sm:p-4 border-b border-slate-200/50 bg-gradient-to-r from-indigo-600 to-purple-600 flex-shrink-0">
          <h2 className="text-sm landscape:text-sm sm:text-base font-bold text-white">Admin Panel</h2>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="w-6 h-6 landscape:w-6 landscape:h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-3 h-3 landscape:w-3 landscape:h-3 sm:w-4 sm:h-4 text-white" />
          </button>
        </div>
        
        {/* Navigation - Scrollable only if needed */}
        <nav className="flex-1 p-2 landscape:p-2.5 sm:p-3 lg:p-2 xl:p-3 overflow-y-auto">
          <div className="space-y-1 landscape:space-y-1 sm:space-y-1.5 lg:space-y-1 xl:space-y-1.5">
            {navigationItems.map((item) => {
              const IconComponent = item.icon
              const isActive = activeTab === item.id
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  disabled={item.disabled}
                  className={`w-full flex items-center justify-start lg:justify-center xl:justify-start p-2.5 landscape:p-2.5 sm:p-3 lg:p-2 xl:p-3 rounded-lg landscape:rounded-lg sm:rounded-xl text-xs landscape:text-sm sm:text-sm lg:text-xs xl:text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg" 
                      : item.disabled 
                        ? "text-slate-400 cursor-not-allowed" 
                        : "text-slate-700 hover:bg-slate-100 hover:shadow-md"
                  }`}
                  whileHover={!item.disabled ? { scale: 1.02 } : {}}
                  whileTap={!item.disabled ? { scale: 0.98 } : {}}
                >
                  <div className={`w-6 h-6 landscape:w-6 landscape:h-6 sm:w-7 sm:h-7 lg:w-6 lg:h-6 xl:w-7 xl:h-7 rounded landscape:rounded sm:rounded-lg flex items-center justify-center mr-2.5 landscape:mr-2.5 sm:mr-3 lg:mr-0 xl:mr-3 flex-shrink-0 ${
                    isActive ? "bg-white/20" : "bg-gradient-to-br " + item.color + " text-white shadow-sm"
                  }`}>
                    {item.error ? (
                      <AlertCircle className="w-3.5 h-3.5 landscape:w-3.5 landscape:h-3.5 sm:w-4 sm:h-4 lg:w-3 lg:h-3 xl:w-4 xl:h-4 text-red-600" />
                    ) : (
                      <IconComponent className="w-3.5 h-3.5 landscape:w-3.5 landscape:h-3.5 sm:w-4 sm:h-4 lg:w-3 lg:h-3 xl:w-4 xl:h-4" />
                    )}
                  </div>
                  <span className="lg:hidden xl:inline truncate flex-1 text-left">{item.label}</span>
                  {!item.disabled && (
                    <span className={`ml-auto lg:hidden xl:inline px-1.5 landscape:px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] landscape:text-xs sm:text-xs font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      {item.count}
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>
        </nav>
      </aside>

      {/* Main Content - Scrollable */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header - Fixed */}
        <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/50 z-30 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between p-3 landscape:p-3 sm:p-4">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="lg:hidden w-7 h-7 landscape:w-7 landscape:h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg landscape:rounded-lg sm:rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Menu className="w-3.5 h-3.5 landscape:w-3.5 landscape:h-3.5 sm:w-4 sm:h-4" />
            </button>
            <div className="min-w-0 flex-1 ml-3 lg:ml-0">
              <h2 className="text-base landscape:text-lg sm:text-lg md:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent capitalize truncate">
                {activeTab === "review" ? "Reviews" : activeTab}
              </h2>
            </div>
          </div>
        </header>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 landscape:p-3 sm:p-4 lg:p-3 xl:p-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 landscape:gap-2 sm:gap-3 lg:gap-2 xl:gap-3 mb-4 landscape:mb-4 sm:mb-6">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon
                return (
                  <motion.div
                    key={stat.label}
                    className={`bg-white/90 backdrop-blur-sm rounded-xl landscape:rounded-xl sm:rounded-2xl p-3 landscape:p-3 sm:p-4 border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-200 ${
                      stat.error ? "border-red-200 bg-red-50/50" : ""
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="flex items-center mb-2 landscape:mb-2 sm:mb-3">
                      <div className="w-7 h-7 landscape:w-7 landscape:h-7 sm:w-8 sm:h-8 lg:w-7 lg:h-7 xl:w-8 xl:h-8 rounded-lg landscape:rounded-lg sm:rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-sm">
                        {stat.error ? (
                          <AlertCircle className="w-3.5 h-3.5 landscape:w-3.5 landscape:h-3.5 sm:w-4 sm:h-4 text-red-600" />
                        ) : stat.loading ? (
                          <div className="w-3.5 h-3.5 landscape:w-3.5 landscape:h-3.5 sm:w-4 sm:h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <IconComponent className={`w-3.5 h-3.5 landscape:w-3.5 landscape:h-3.5 sm:w-4 sm:h-4 ${stat.color}`} />
                        )}
                      </div>
                    </div>
                    <div>
                      <p className={`text-lg landscape:text-lg sm:text-xl lg:text-lg xl:text-xl font-bold mb-0.5 landscape:mb-1 sm:mb-1 ${
                        stat.error ? "text-red-600" : "text-slate-800"
                      }`}>
                        {stat.error ? "Error" : stat.value}
                      </p>
                      <p className="text-slate-500 text-xs landscape:text-sm sm:text-sm font-medium">
                        {stat.label}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Content Area */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl landscape:rounded-xl sm:rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
              <div className="p-3 landscape:p-3 sm:p-4 lg:p-3 xl:p-4">
                <AnimatePresence mode="wait">
                  {activeTab === "orders" && (
                    <motion.div 
                      key="orders" 
                      variants={fadeVariant} 
                      initial="hidden" 
                      animate="visible" 
                      exit="exit" 
                      transition={{ duration: 0.2 }}
                    >
                      <AdminOrderList />
                    </motion.div>
                  )}
                  {activeTab === "users" && (
                    <motion.div 
                      key="users" 
                      variants={fadeVariant} 
                      initial="hidden" 
                      animate="visible" 
                      exit="exit" 
                      transition={{ duration: 0.2 }}
                    >
                      <AdminUserList />
                    </motion.div>
                  )}
                  {activeTab === "review" && (
                    <motion.div 
                      key="review" 
                      variants={fadeVariant} 
                      initial="hidden" 
                      animate="visible" 
                      exit="exit" 
                      transition={{ duration: 0.2 }}
                    >
                      <AdminReviews />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Admin