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
  const [completedOrders, setCompletedOrders] = useState([])
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
        setCompletedOrders(completed)
        setTotalRevenue(completed.reduce((sum, order) => sum + (order.totalAmount || 0), 0))
        setActiveOrders(ordersData.filter((order) => ["processing", "pending", "confirmed"].includes(order.status)))
        setOrders(ordersData)
      } catch (error) {
        setErrorStates((prev) => ({ ...prev, orders: error.message || "Failed to fetch orders" }))
        toast.error(error.message || "Failed to fetch orders")
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
        toast.error(error.message || "Failed to fetch users")
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
        toast.error(error.message || "Failed to fetch reviews")
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
    { id: "settings", label: "Settings", icon: Settings, color: "from-slate-500 to-zinc-600", disabled: true },
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

  // Retry function for failed requests
  const retryFetch = (type) => {
    switch (type) {
      case "orders":
        setLoadingStates((prev) => ({ ...prev, orders: true }))
        setErrorStates((prev) => ({ ...prev, orders: null }))
        // Re-run the orders fetch
        const fetchOrders = async () => {
          try {
            const response = await getAllOrders()
            let ordersData = []

            if (response?.orders && Array.isArray(response.orders)) {
              ordersData = response.orders
            } else if (response?.data?.orders && Array.isArray(response.data.orders)) {
              ordersData = response.data.orders
            } else if (Array.isArray(response)) {
              ordersData = response
            }

            const completed = ordersData.filter((order) => order.status === "completed")
            setCompletedOrders(completed)
            const total = completed.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
            setTotalRevenue(total)
            const active = ordersData.filter(
              (order) => order.status === "processing" || order.status === "pending" || order.status === "confirmed",
            )
            setActiveOrders(active)
            setOrders(ordersData)
            setErrorStates((prev) => ({ ...prev, orders: null }))
          } catch (error) {
            console.error("Error retrying orders fetch:", error)
            setErrorStates((prev) => ({ ...prev, orders: error.message || "Failed to fetch orders" }))
            setOrders([])
          } finally {
            setLoadingStates((prev) => ({ ...prev, orders: false }))
          }
        }
        fetchOrders()
        break
      case "users":
        setLoadingStates((prev) => ({ ...prev, users: true }))
        setErrorStates((prev) => ({ ...prev, users: null }))
        // Re-run the users fetch
        fetchUsers()
          .then((usersData) => {
            setUsers(Array.isArray(usersData) ? usersData : [])
            setLoadingStates((prev) => ({ ...prev, users: false }))
            setErrorStates((prev) => ({ ...prev, users: null }))
          })
          .catch((error) => {
            setErrorStates((prev) => ({ ...prev, users: error.message || "Failed to fetch users" }))
            setUsers([])
            setLoadingStates((prev) => ({ ...prev, users: false }))
          })
        break
      case "reviews":
        setLoadingStates((prev) => ({ ...prev, reviews: true }))
        setErrorStates((prev) => ({ ...prev, reviews: null }))
        // Re-run the reviews fetch
        getAllReviews()
          .then((reviewsData) => {
            setReviews(Array.isArray(reviewsData) ? reviewsData : [])
            setLoadingStates((prev) => ({ ...prev, reviews: false }))
            setErrorStates((prev) => ({ ...prev, reviews: null }))
          })
          .catch((error) => {
            setErrorStates((prev) => ({ ...prev, reviews: error.message || "Failed to fetch reviews" }))
            setReviews([])
            setLoadingStates((prev) => ({ ...prev, reviews: false }))
          })
        break
      default:
        window.location.reload()
    }
  }

  // Show initial loading screen
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-2">
        <motion.div className="flex flex-col items-center space-y-4 p-4 max-w-xs w-full">
          <div className="relative">
            <div className="w-10 h-10 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="w-7 h-7 border-2 border-purple-200 border-t-purple-600 rounded-full absolute top-1.5 left-1.5 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.2s" }}></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">Loading...</h3>
            <p className="text-slate-500 text-xs">Fetching data</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 bottom-0 z-40 lg:relative w-16 lg:w-56 bg-white/95 border-r border-slate-200/50 shadow-lg transition-all duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="lg:hidden flex items-center justify-between p-2 border-b border-slate-200/50 bg-gradient-to-r from-indigo-600 to-purple-600">
          <h2 className="text-base font-bold text-white">Admin</h2>
          <button onClick={() => setSidebarOpen(false)} className="w-7 h-7 flex items-center justify-center rounded bg-white/20 hover:bg-white/30">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        <nav className="flex-1 p-2 overflow-y-auto">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const IconComponent = item.icon
              const isActive = activeTab === item.id
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  disabled={item.disabled}
                  className={`w-full flex items-center justify-center lg:justify-start p-2 rounded-lg text-xs font-medium transition-all duration-200 ${isActive ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow" : item.disabled ? "text-slate-400" : "text-slate-700 hover:bg-slate-100"}`}
                  whileHover={!item.disabled ? { scale: 1.03 } : {}}
                  whileTap={!item.disabled ? { scale: 0.97 } : {}}
                >
                  <div className={`w-7 h-7 rounded flex items-center justify-center mr-0 lg:mr-2 ${isActive ? "bg-white/20" : "bg-gradient-to-br " + item.color + " text-white"}`}>
                    {item.error ? <AlertCircle className="w-4 h-4 text-red-600" /> : <IconComponent className="w-4 h-4" />}
                  </div>
                  <span className="hidden lg:inline truncate">{item.label}</span>
                  {!item.disabled && (
                    <span className={`ml-auto hidden lg:inline px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>{item.count}</span>
                  )}
                </motion.button>
              )
            })}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white/90 border-b border-slate-200/50 sticky top-0 z-30 shadow-sm p-2">
          <div className="flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-8 h-8 flex items-center justify-center rounded bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow">
              <Menu className="w-4 h-4" />
            </button>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent capitalize truncate">{activeTab === "review" ? "Reviews" : activeTab}</h2>
            </div>
          </div>
        </header>

        <div className="flex-1 p-2">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  className={`bg-white/90 rounded-xl p-3 border border-slate-200/50 shadow hover:shadow-md transition-all duration-200 ${stat.error ? "border-red-200 bg-red-50/50" : ""}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.2 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                >
                  <div className="flex items-center mb-1">
                    <div className={`w-7 h-7 rounded bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow`}>
                      {stat.error ? <AlertCircle className="w-4 h-4 text-red-600" /> : stat.loading ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div> : <IconComponent className={`w-4 h-4 ${stat.color}`} />}
                    </div>
                  </div>
                  <div>
                    <p className={`text-lg font-bold mb-0.5 ${stat.error ? "text-red-600" : "text-slate-800"}`}>{stat.error ? "Error" : stat.value}</p>
                    <p className="text-slate-500 text-xs font-medium">{stat.label}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Content Area */}
          <div className="bg-white/90 rounded-xl border border-slate-200/50 shadow min-h-[300px] overflow-hidden p-2">
            <AnimatePresence mode="wait">
              {activeTab === "orders" && (
                <motion.div key="orders" variants={fadeVariant} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.15 }}>
                  <AdminOrderList />
                </motion.div>
              )}
              {activeTab === "users" && (
                <motion.div key="users" variants={fadeVariant} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.15 }}>
                  <AdminUserList />
                </motion.div>
              )}
              {activeTab === "review" && (
                <motion.div key="review" variants={fadeVariant} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.15 }}>
                  <AdminReviews />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Admin
