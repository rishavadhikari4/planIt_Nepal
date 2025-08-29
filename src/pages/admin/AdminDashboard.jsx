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

  // Data states
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [reviews, setReviews] = useState([])
  const [completedOrders, setCompletedOrders] = useState([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [activeOrders, setActiveOrders] = useState([])

  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    orders: true,
    users: true,
    reviews: true,
  })

  // Error states
  const [errorStates, setErrorStates] = useState({
    orders: null,
    users: null,
    reviews: null,
  })

  // Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingStates((prev) => ({ ...prev, orders: true }))
        setErrorStates((prev) => ({ ...prev, orders: null }))

        const response = await getAllOrders()
        console.log("AdminDashboard - Orders response:", response)
        
        // Handle the new response structure
        let ordersData = []
        
        if (response?.orders && Array.isArray(response.orders)) {
          // Direct response from service
          ordersData = response.orders
        } else if (response?.data?.orders && Array.isArray(response.data.orders)) {
          // Nested response structure
          ordersData = response.data.orders
        } else if (Array.isArray(response)) {
          // Simple array response (backward compatibility)
          ordersData = response
        } else {
          console.error("Unexpected orders response structure:", response)
          ordersData = []
        }

        console.log("AdminDashboard - Processed orders data:", ordersData)
        
        const completed = ordersData.filter((order) => order.status === "completed")
        setCompletedOrders(completed)

        const total = completed.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
        setTotalRevenue(total)

        const active = ordersData.filter((order) => 
          order.status === "processing" || 
          order.status === "pending" || 
          order.status === "confirmed"
        )
        setActiveOrders(active)

        setOrders(ordersData)
      } catch (error) {
        console.error("Error fetching orders:", error)
        const errorMessage = error.message || "Failed to fetch orders"
        setErrorStates((prev) => ({ ...prev, orders: errorMessage }))
        toast.error(errorMessage)
        setOrders([]) // Ensure it's always an array
      } finally {
        setLoadingStates((prev) => ({ ...prev, orders: false }))
      }
    }

    fetchOrders()
  }, [])

  // Fetch Users
  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        setLoadingStates((prev) => ({ ...prev, users: true }))
        setErrorStates((prev) => ({ ...prev, users: null }))

        const usersData = await fetchUsers()
        // Ensure users is always an array
        setUsers(Array.isArray(usersData) ? usersData : [])
      } catch (error) {
        console.error("Error fetching users:", error)
        const errorMessage = error.message || "Failed to fetch users"
        setErrorStates((prev) => ({ ...prev, users: errorMessage }))
        toast.error(errorMessage)
        setUsers([]) // Ensure it's always an array
      } finally {
        setLoadingStates((prev) => ({ ...prev, users: false }))
      }
    }

    fetchUsersData()
  }, [])

  // Fetch Reviews
  useEffect(() => {
    const fetchReviewsData = async () => {
      try {
        setLoadingStates((prev) => ({ ...prev, reviews: true }))
        setErrorStates((prev) => ({ ...prev, reviews: null }))

        const reviewsData = await getAllReviews()
        // Ensure reviews is always an array
        setReviews(Array.isArray(reviewsData) ? reviewsData : [])
      } catch (error) {
        console.error("Error fetching reviews:", error)
        const errorMessage = error.message || "Failed to fetch reviews"
        setErrorStates((prev) => ({ ...prev, reviews: errorMessage }))
        toast.error(errorMessage)
        setReviews([]) // Ensure it's always an array
      } finally {
        setLoadingStates((prev) => ({ ...prev, reviews: false }))
      }
    }

    fetchReviewsData()
  }, [])

  // Check if all data is still loading
  const isInitialLoading = Object.values(loadingStates).some((loading) => loading)

  const fadeVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  const navigationItems = [
    {
      id: "orders",
      label: "Orders",
      icon: Package,
      color: "from-blue-500 to-blue-600",
      count: orders.length,
      loading: loadingStates.orders,
      error: errorStates.orders,
    },
    {
      id: "users",
      label: "Users",
      icon: Users,
      color: "from-green-500 to-green-600",
      count: users.length,
      loading: loadingStates.users,
      error: errorStates.users,
    },
    {
      id: "review",
      label: "Reviews",
      icon: Star,
      color: "from-yellow-500 to-yellow-600",
      count: reviews.length,
      loading: loadingStates.reviews,
      error: errorStates.reviews,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      color: "from-gray-500 to-gray-600",
      disabled: true,
    },
  ]

  // Calculate stats with proper error handling
  const calculateAverageRating = () => {
    if (!Array.isArray(reviews) || reviews.length === 0) return "0.0"
    const total = reviews.reduce((sum, review) => {
      const rating = Number(review.rating) || 0
      return sum + rating
    }, 0)
    return (total / reviews.length).toFixed(1)
  }

  const stats = [
    {
      label: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: HandCoins,
      change: "+12%",
      color: "text-green-600",
      loading: loadingStates.orders,
      error: errorStates.orders,
    },
    {
      label: "Active Orders",
      value: loadingStates.orders ? "..." : activeOrders.length.toString(),
      icon: Package,
      change: "+5%",
      color: "text-blue-600",
      loading: loadingStates.orders,
      error: errorStates.orders,
    },
    {
      label: "Total Users",
      value: loadingStates.users ? "..." : users.length.toString(),
      icon: Users,
      change: "+8%",
      color: "text-purple-600",
      loading: loadingStates.users,
      error: errorStates.users,
    },
    {
      label: "Avg Rating",
      value: loadingStates.reviews ? "..." : calculateAverageRating(),
      icon: Star,
      change: "+0.2",
      color: "text-yellow-600",
      loading: loadingStates.reviews,
      error: errorStates.reviews,
    },
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
            const active = ordersData.filter((order) => 
              order.status === "processing" || 
              order.status === "pending" || 
              order.status === "confirmed"
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
        fetchUsers().then(usersData => {
          setUsers(Array.isArray(usersData) ? usersData : [])
          setLoadingStates((prev) => ({ ...prev, users: false }))
          setErrorStates((prev) => ({ ...prev, users: null }))
        }).catch(error => {
          setErrorStates((prev) => ({ ...prev, users: error.message || "Failed to fetch users" }))
          setUsers([])
          setLoadingStates((prev) => ({ ...prev, users: false }))
        })
        break
      case "reviews":
        setLoadingStates((prev) => ({ ...prev, reviews: true }))
        setErrorStates((prev) => ({ ...prev, reviews: null }))
        // Re-run the reviews fetch
        getAllReviews().then(reviewsData => {
          setReviews(Array.isArray(reviewsData) ? reviewsData : [])
          setLoadingStates((prev) => ({ ...prev, reviews: false }))
          setErrorStates((prev) => ({ ...prev, reviews: null }))
        }).catch(error => {
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div
          className="flex flex-col items-center space-y-4 sm:space-y-6 p-4 sm:p-8 max-w-md w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-pink-200 border-t-pink-600 rounded-full absolute top-2 left-2 animate-pulse"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Loading Admin Dashboard</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4">Please wait while we fetch your data...</p>
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-400">
                <div
                  className={`w-2 h-2 rounded-full ${loadingStates.orders ? "bg-blue-500 animate-pulse" : "bg-green-500"}`}
                ></div>
                <span>Orders {loadingStates.orders ? "Loading..." : "Loaded"}</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-400">
                <div
                  className={`w-2 h-2 rounded-full ${loadingStates.users ? "bg-blue-500 animate-pulse" : "bg-green-500"}`}
                ></div>
                <span>Users {loadingStates.users ? "Loading..." : "Loaded"}</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-400">
                <div
                  className={`w-2 h-2 rounded-full ${loadingStates.reviews ? "bg-blue-500 animate-pulse" : "bg-green-500"}`}
                ></div>
                <span>Reviews {loadingStates.reviews ? "Loading..." : "Loaded"}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50
          lg:relative lg:translate-x-0 lg:z-auto
          w-64 sm:w-72 lg:w-80
          bg-white/95 backdrop-blur-xl
          border-r border-gray-200/50
          shadow-2xl lg:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Sidebar Header - Mobile */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200/50">
          <h2 className="text-lg font-bold text-gray-800">Admin Panel</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto">
          <div className="space-y-1 sm:space-y-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon
              const isActive = activeTab === item.id
              const isDisabled = item.disabled
              const hasError = item.error
              const isLoading = item.loading

              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  disabled={isDisabled}
                  className={`
                    w-full flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl
                    transition-all duration-200 group relative overflow-hidden text-left
                    ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                        : isDisabled
                          ? "text-gray-400 cursor-not-allowed"
                          : hasError
                            ? "text-red-600 hover:bg-red-50"
                            : "text-gray-700 hover:bg-gray-100 hover:scale-[1.02]"
                    }
                  `}
                  whileHover={!isDisabled ? { scale: 1.01 } : {}}
                  whileTap={!isDisabled ? { scale: 0.99 } : {}}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div
                      className={`
                        w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0
                        ${isActive ? "bg-white/20" : hasError ? "bg-red-100" : `bg-gradient-to-r ${item.color} text-white`}
                      `}
                    >
                      {hasError ? (
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                      ) : (
                        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </div>
                    <span className="font-medium text-sm sm:text-base truncate">{item.label}</span>
                  </div>

                  {/* Count or Loading indicator */}
                  {!isDisabled && (
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {hasError ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            retryFetch(item.id)
                          }}
                          className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                        >
                          Retry
                        </button>
                      ) : isLoading ? (
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-60"></div>
                      ) : item.count !== undefined ? (
                        <span
                          className={`
                            px-2 py-1 rounded-full text-xs font-semibold min-w-[1.5rem] text-center
                            ${isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"}
                          `}
                        >
                          {item.count}
                        </span>
                      ) : null}
                    </div>
                  )}

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                      layoutId="activeIndicator"
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-30">
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>

                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 capitalize truncate">
                    {activeTab === "review" ? "Reviews" : activeTab}
                  </h2>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-500 hidden sm:block">
                    {activeTab === "orders" && "Manage customer orders and bookings"}
                    {activeTab === "users" && "View and manage user accounts"}
                    {activeTab === "review" && "Monitor customer feedback and ratings"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  className={`bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-gray-200/50 shadow-sm hover:shadow-lg transition-all duration-300 ${
                    stat.error ? "border-red-200 bg-red-50/50" : ""
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r ${
                        stat.error ? "from-red-100 to-red-200" : "from-gray-100 to-gray-200"
                      } flex items-center justify-center`}
                    >
                      {stat.error ? (
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-600" />
                      ) : stat.loading ? (
                        <div className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${stat.color}`} />
                      )}
                    </div>
                    {!stat.error && !stat.loading && (
                      <span className={`text-xs sm:text-sm font-semibold ${stat.color}`}>{stat.change}</span>
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-lg sm:text-xl lg:text-2xl font-bold mb-1 ${
                        stat.error ? "text-red-600" : "text-gray-800"
                      }`}
                    >
                      {stat.error ? "Error" : stat.value}
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm">{stat.label}</p>
                    {stat.error && (
                      <button
                        onClick={() =>
                          retryFetch(
                            stat.label.toLowerCase().includes("revenue") || stat.label.toLowerCase().includes("order")
                              ? "orders"
                              : stat.label.toLowerCase().includes("user")
                                ? "users"
                                : "reviews",
                          )
                        }
                        className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Content Area */}
          <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-gray-200/50 shadow-sm min-h-[400px] lg:min-h-[600px] overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === "orders" && (
                <motion.div
                  key="orders"
                  variants={fadeVariant}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="h-full"
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
                  transition={{ duration: 0.3 }}
                  className="h-full"
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
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
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
