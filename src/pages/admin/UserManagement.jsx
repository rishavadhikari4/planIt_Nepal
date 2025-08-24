"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom" // Add this import
import { motion, AnimatePresence } from "framer-motion"
import { fetchUsers, deleteUser } from "../../services/users"
import { toast } from "react-toastify"
import { Search, Filter, Download, Trash2, User, Mail, Calendar, UserCheck, UserX, Eye, Menu, X } from "lucide-react"

const AdminUserList = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const navigate = useNavigate() // Add this hook

  useEffect(() => {
    const getUsers = async () => {
      try {
        setLoading(true)
        const data = await fetchUsers()
        setUsers(data)
        setError(null)
      } catch (err) {
        setError("Error fetching users")
        toast.error("Error fetching users")
      } finally {
        setLoading(false)
      }
    }
    getUsers()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return

    setDeletingId(id)
    try {
      await deleteUser(id)
      setUsers((prev) => prev.filter((user) => user._id !== id))
      toast.success("User deleted successfully")
    } catch {
      toast.error("Failed to delete user")
    } finally {
      setDeletingId(null)
    }
  }

  // Add this function for user inspection navigation
  const handleInspectUser = (userId) => {
    navigate(`/admin/users/inspect/${userId}`)
  }

  // Filter users based on search term and status
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.isActive !== false) ||
      (filterStatus === "inactive" && user.isActive === false)

    return matchesSearch && matchesStatus
  })

  // User stats
  const userStats = [
    {
      label: "Total Users",
      value: users.length,
      icon: User,
      color: "text-blue-600",
      bg: "bg-blue-100",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      label: "Active Users",
      value: users.filter((u) => u.isActive !== false).length,
      icon: UserCheck,
      color: "text-green-600",
      bg: "bg-green-100",
      gradient: "from-green-500 to-green-600",
    },
    {
      label: "New This Month",
      value: users.filter((u) => {
        const userDate = new Date(u.createdAt || Date.now())
        const thisMonth = new Date()
        return userDate.getMonth() === thisMonth.getMonth() && userDate.getFullYear() === thisMonth.getFullYear()
      }).length,
      icon: Calendar,
      color: "text-purple-600",
      bg: "bg-purple-100",
      gradient: "from-purple-500 to-purple-600",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-pink-200 border-t-pink-600 rounded-full absolute top-2 left-2 animate-pulse"></div>
          </div>
          <p className="text-gray-600 font-medium text-sm sm:text-base">Loading users...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center">
            <UserX className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
          </div>
          <div>
            <p className="text-red-600 font-semibold mb-2 text-sm sm:text-base">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">User Management</h2>
            <p className="text-sm sm:text-base text-gray-600">Manage and monitor user accounts</p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {userStats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <motion.div
                key={stat.label}
                className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50 shadow-sm hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center shadow-lg`}
                  >
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">{stat.value}</p>
                  <p className="text-gray-500 text-xs sm:text-sm">{stat.label}</p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Mobile Filter Toggle */}
        <div className="sm:hidden">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-sm"
          >
            {showMobileFilters ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span className="font-medium">{showMobileFilters ? "Hide Filters" : "Show Search & Filters"}</span>
          </button>
        </div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-gray-200/50 shadow-sm transition-all duration-300 ${
            showMobileFilters ? "block" : "hidden sm:block"
          }`}
        >
          <div className="p-4 sm:p-6">
            <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              >
                <option value="all">All Users</option>
                <option value="active">Active Users</option>
                <option value="inactive">Inactive Users</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Users List */}
        <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 space-y-4 px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <div className="text-center">
                <p className="text-gray-600 font-medium mb-1 text-sm sm:text-base">No users found</p>
                <p className="text-gray-400 text-xs sm:text-sm">
                  {searchTerm ? "Try adjusting your search terms" : "No users have been registered yet"}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <AnimatePresence>
                      {filteredUsers.map((user, index) => (
                        <motion.tr
                          key={user._id}
                          className="hover:bg-gray-50/50 transition-colors duration-200"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <img
                                  src={
                                    user.profileImage ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=random`
                                  }
                                  alt={user.name || "User"}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                />
                                <div
                                  className={`absolute -bottom-1 -right-1 w-4 h-4 ${user.isActive !== false ? "bg-green-500" : "bg-gray-400"} border-2 border-white rounded-full`}
                                ></div>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">{user.name || "Unknown User"}</p>
                                <p className="text-xs text-gray-500 font-mono">ID: {user._id.slice(-8)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">{user.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                user.isActive !== false ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              <div
                                className={`w-2 h-2 ${user.isActive !== false ? "bg-green-500" : "bg-gray-500"} rounded-full mr-2`}
                              ></div>
                              {user.isActive !== false ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button 
                                onClick={() => handleInspectUser(user._id)}
                                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(user._id)}
                                disabled={deletingId === user._id}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {deletingId === user._id ? (
                                  <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Cards */}
              <div className="lg:hidden divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredUsers.map((user, index) => (
                    <motion.div
                      key={user._id}
                      className="p-4 sm:p-6 hover:bg-gray-50/50 transition-colors duration-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                          <div className="relative flex-shrink-0">
                            <img
                              src={
                                user.profileImage ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=random`
                              }
                              alt={user.name || "User"}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-200"
                            />
                            <div
                              className={`absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 ${user.isActive !== false ? "bg-green-500" : "bg-gray-400"} border-2 border-white rounded-full`}
                            ></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 truncate text-sm sm:text-base">
                              {user.name || "Unknown User"}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                              <p className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</p>
                            </div>
                            <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4 mt-2">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold w-fit ${
                                  user.isActive !== false ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                <div
                                  className={`w-1.5 h-1.5 ${user.isActive !== false ? "bg-green-500" : "bg-gray-500"} rounded-full mr-1`}
                                ></div>
                                {user.isActive !== false ? "Active" : "Inactive"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2 ml-2 sm:ml-4 flex-shrink-0">
                          <button 
                            onClick={() => handleInspectUser(user._id)}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            disabled={deletingId === user._id}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingId === user._id ? (
                              <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>

        {/* Results Summary */}
        {filteredUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-gray-500 py-2"
          >
            Showing {filteredUsers.length} of {users.length} users
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default AdminUserList
