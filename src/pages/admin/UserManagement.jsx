"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { fetchUsers, deleteUser } from "../../services/users"
import { toast } from "react-toastify"
import { Search, Trash2, User, Mail, UserCheck, UserX, Eye, Menu, X, Sparkles } from "lucide-react"

const AdminUserList = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const navigate = useNavigate()

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
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      gradient: "from-indigo-500 via-indigo-600 to-purple-600",
      shadow: "shadow-indigo-500/25",
    },
    {
      label: "Active Users",
      value: users.filter((u) => u.isActive !== false).length,
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      gradient: "from-emerald-500 via-green-500 to-teal-600",
      shadow: "shadow-emerald-500/25",
    },
    {
      label: "New This Month",
      value: users.filter((u) => {
        const userDate = new Date(u.createdAt || Date.now())
        const thisMonth = new Date()
        return userDate.getMonth() === thisMonth.getMonth() && userDate.getFullYear() === thisMonth.getFullYear()
      }).length,
      icon: Sparkles,
      color: "text-rose-600",
      bg: "bg-rose-50",
      gradient: "from-rose-500 via-pink-500 to-purple-600",
      shadow: "shadow-rose-500/25",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/50 flex items-center justify-center p-4">
        <motion.div
          className="flex flex-col items-center space-y-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative">
            <motion.div
              className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
            <motion.div
              className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full absolute top-2 left-2"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <p className="text-slate-700 font-semibold text-lg mb-1">Loading users...</p>
            <p className="text-slate-500 text-sm">Please wait while we fetch the data</p>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/50 flex items-center justify-center p-4">
        <motion.div
          className="flex flex-col items-center space-y-6 text-center max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <UserX className="w-10 h-10 text-red-600" />
          </motion.div>
          <div>
            <p className="text-red-600 font-bold text-xl mb-2">{error}</p>
            <p className="text-slate-600 mb-6">Something went wrong while loading the users</p>
            <motion.button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Again
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="text-center sm:text-left">
            <motion.h2
              className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 via-indigo-800 to-purple-800 bg-clip-text text-transparent mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              User Management
            </motion.h2>
            <motion.p
              className="text-slate-600 text-base sm:text-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              Manage and monitor user accounts with ease
            </motion.p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
          {userStats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <motion.div
                key={stat.label}
                className={`group relative bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg ${stat.shadow} hover:shadow-2xl transition-all duration-300 overflow-hidden`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                {/* Background gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <IconComponent className="w-7 h-7 text-white" />
                    </motion.div>
                  </div>
                  <div>
                    <motion.p
                      className="text-3xl font-bold text-slate-800 mb-1"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 0.3 }}
                    >
                      {stat.value}
                    </motion.p>
                    <p className="text-slate-600 font-medium">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Mobile Filter Toggle */}
        <div className="sm:hidden">
          <motion.button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl shadow-lg font-semibold text-slate-700"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div animate={{ rotate: showMobileFilters ? 180 : 0 }} transition={{ duration: 0.2 }}>
              {showMobileFilters ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.div>
            <span>{showMobileFilters ? "Hide Filters" : "Show Search & Filters"}</span>
          </motion.button>
        </div>

        {/* Search and Filter Bar */}
        <AnimatePresence>
          {(showMobileFilters || window.innerWidth >= 640) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:gap-4">
                  <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors duration-200" />
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all duration-200 text-slate-700 placeholder-slate-400"
                    />
                  </div>
                  <motion.select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full sm:w-auto px-4 py-4 bg-slate-50/50 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all duration-200 text-slate-700"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.15 }}
                  >
                    <option value="all">All Users</option>
                    <option value="active">Active Users</option>
                    <option value="inactive">Inactive Users</option>
                  </motion.select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Users List */}
        <motion.div
          className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {filteredUsers.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center py-16 space-y-6 px-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-10 h-10 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-slate-700 font-semibold text-lg mb-2">No users found</p>
                <p className="text-slate-500">
                  {searchTerm ? "Try adjusting your search terms" : "No users have been registered yet"}
                </p>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-50/80 to-indigo-50/80 border-b border-slate-200/50">
                    <tr>
                      <th className="px-6 py-5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-5 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/50">
                    <AnimatePresence>
                      {filteredUsers.map((user, index) => (
                        <motion.tr
                          key={user._id}
                          className="hover:bg-slate-50/50 transition-all duration-200 group"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.03, duration: 0.3 }}
                          whileHover={{ backgroundColor: "rgba(248, 250, 252, 0.8)" }}
                        >
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center space-x-4">
                              <div className="relative">
                                <motion.img
                                  src={
                                    user.profileImage ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=random`
                                  }
                                  alt={user.name || "User"}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                                  whileHover={{ scale: 1.1 }}
                                  transition={{ duration: 0.2 }}
                                />
                                <motion.div
                                  className={`absolute -bottom-1 -right-1 w-4 h-4 ${user.isActive !== false ? "bg-emerald-500" : "bg-slate-400"} border-2 border-white rounded-full shadow-sm`}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: index * 0.03 + 0.2, duration: 0.2 }}
                                />
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 text-base">{user.name || "Unknown User"}</p>
                                <p className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded-md">
                                  ID: {user._id.slice(-8)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <Mail className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-700 font-medium">{user.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <motion.span
                              className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-bold shadow-sm ${
                                user.isActive !== false
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-slate-100 text-slate-800 border border-slate-200"
                              }`}
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.15 }}
                            >
                              <motion.div
                                className={`w-2 h-2 ${user.isActive !== false ? "bg-emerald-500" : "bg-slate-500"} rounded-full mr-2`}
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                              />
                              {user.isActive !== false ? "Active" : "Inactive"}
                            </motion.span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-slate-600 font-medium">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <motion.button
                                onClick={() => handleInspectUser(user._id)}
                                className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                              >
                                <Eye className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                onClick={() => handleDelete(user._id)}
                                disabled={deletingId === user._id}
                                className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                              >
                                {deletingId === user._id ? (
                                  <motion.div
                                    className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                  />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Cards */}
              <div className="lg:hidden divide-y divide-slate-200/50">
                <AnimatePresence>
                  {filteredUsers.map((user, index) => (
                    <motion.div
                      key={user._id}
                      className="p-6 hover:bg-slate-50/50 transition-all duration-200 group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.03, duration: 0.3 }}
                      whileHover={{ backgroundColor: "rgba(248, 250, 252, 0.8)" }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className="relative flex-shrink-0">
                            <motion.img
                              src={
                                user.profileImage ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=random`
                              }
                              alt={user.name || "User"}
                              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-lg"
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            />
                            <motion.div
                              className={`absolute -bottom-1 -right-1 w-4 h-4 ${user.isActive !== false ? "bg-emerald-500" : "bg-slate-400"} border-2 border-white rounded-full shadow-sm`}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.03 + 0.2, duration: 0.2 }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 truncate text-lg mb-1">
                              {user.name || "Unknown User"}
                            </p>
                            <div className="flex items-center space-x-2 mb-3">
                              <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                              <p className="text-sm text-slate-600 truncate font-medium">{user.email}</p>
                            </div>
                            <div className="flex flex-col xs:flex-row xs:items-center gap-3 xs:gap-4">
                              <motion.span
                                className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-bold w-fit shadow-sm ${
                                  user.isActive !== false
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                    : "bg-slate-100 text-slate-800 border border-slate-200"
                                }`}
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.15 }}
                              >
                                <motion.div
                                  className={`w-2 h-2 ${user.isActive !== false ? "bg-emerald-500" : "bg-slate-500"} rounded-full mr-2`}
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                                />
                                {user.isActive !== false ? "Active" : "Inactive"}
                              </motion.span>
                              <span className="text-xs text-slate-500 font-medium">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                          <motion.button
                            onClick={() => handleInspectUser(user._id)}
                            className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDelete(user._id)}
                            disabled={deletingId === user._id}
                            className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                          >
                            {deletingId === user._id ? (
                              <motion.div
                                className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                              />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </motion.div>

        {/* Results Summary */}
        {filteredUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="text-center text-sm text-slate-500 py-3 font-medium"
          >
            Showing <span className="font-bold text-indigo-600">{filteredUsers.length}</span> of{" "}
            <span className="font-bold text-slate-700">{users.length}</span> users
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default AdminUserList
