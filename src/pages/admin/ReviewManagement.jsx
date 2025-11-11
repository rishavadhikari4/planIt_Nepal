"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getAllReviews, toggleVerified, deleteReview } from "../../services/reviews"
import { toast } from "react-toastify"
import {
  Star,
  Search,
  Filter,
  Download,
  Shield,
  ShieldCheck,
  Trash2,
  User,
  MessageSquare,
  Calendar,
  Eye,
} from "lucide-react"

const AdminReviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingReviewId, setDeletingReviewId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [expandedReview, setExpandedReview] = useState(null)

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const data = await getAllReviews()
      setReviews(data)
      setError(null)
    } catch {
      setError("Failed to fetch reviews")
      toast.error("Failed to fetch reviews.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleToggleVerified = async (id) => {
    try {
      await toggleVerified(id)
      setReviews((prevReviews) =>
        prevReviews.map((rev) => (rev._id === id ? { ...rev, verified: !rev.verified } : rev)),
      )
      toast.success("Verification status updated successfully")
    } catch {
      toast.error("Failed to update verification status")
    }
  }

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return

    setDeletingReviewId(id)
    try {
      await deleteReview(id)
      setReviews((prevReviews) => prevReviews.filter((rev) => rev._id !== id))
      toast.success("Review deleted successfully")
    } catch {
      toast.error("Failed to delete review")
    } finally {
      setDeletingReviewId(null)
    }
  }

  // Filter and search logic
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "verified" && review.verified) ||
      (filterStatus === "unverified" && !review.verified)

    return matchesSearch && matchesFilter
  })

  // Calculate stats
  const stats = {
    total: reviews.length,
    verified: reviews.filter((r) => r.verified).length,
    unverified: reviews.filter((r) => !r.verified).length,
    avgRating: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0,
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="relative">
          <div
            className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin"
            style={{ animationDuration: "0.8s" }}
          ></div>
          <div
            className="w-16 h-16 border-4 border-gradient-to-r from-indigo-600 to-purple-600 rounded-full animate-spin absolute top-0 left-0"
            style={{ clipPath: "inset(0 50% 0 0)", animationDuration: "0.8s", animationDirection: "reverse" }}
          ></div>
        </div>
        <p className="text-slate-600 font-medium">Loading reviews...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center shadow-lg">
          <MessageSquare className="w-8 h-8 text-red-500" />
        </div>
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">{error}</p>
          <button
            onClick={fetchReviews}
            className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-150 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Customer Reviews
            </h2>
            <p className="text-slate-600 text-lg">Manage and moderate customer feedback and ratings</p>
          </div>

        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
          {[
            {
              label: "Total Reviews",
              value: stats.total,
              icon: MessageSquare,
              gradient: "from-blue-500 to-cyan-500",
              bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
            },
            {
              label: "Verified",
              value: stats.verified,
              icon: ShieldCheck,
              gradient: "from-emerald-500 to-green-500",
              bg: "bg-gradient-to-br from-emerald-50 to-green-50",
            },
            {
              label: "Pending",
              value: stats.unverified,
              icon: Shield,
              gradient: "from-amber-500 to-orange-500",
              bg: "bg-gradient-to-br from-amber-50 to-orange-50",
            },
            {
              label: "Avg Rating",
              value: stats.avgRating,
              icon: Star,
              gradient: "from-yellow-500 to-amber-500",
              bg: "bg-gradient-to-br from-yellow-50 to-amber-50",
            },
          ].map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <motion.div
                key={stat.label}
                className={`${stat.bg} backdrop-blur-xl rounded-2xl p-6 lg:p-8 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center shadow-lg`}
                  >
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                  <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 lg:p-8 border border-white/20 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reviews by user or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-slate-50/80 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all duration-150 backdrop-blur-sm text-base"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-12 pr-10 py-4 bg-slate-50/80 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all duration-150 appearance-none cursor-pointer min-w-[160px] backdrop-blur-sm text-base"
              >
                <option value="all">All Reviews</option>
                <option value="verified">Verified</option>
                <option value="unverified">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {filteredReviews.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-12 lg:p-16 border border-white/20 shadow-lg text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <MessageSquare className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">No Reviews Found</h3>
              <p className="text-slate-600 text-lg">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No customer reviews available yet"}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredReviews.map((review, index) => (
                <motion.div
                  key={review._id}
                  className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.02, duration: 0.15 }}
                  whileHover={{ scale: 1.005, y: -2 }}
                >
                  <div className="p-6 lg:p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg">
                          {review.user?.profileImage ? (
                            <img
                              src={review.user.profileImage || "/placeholder.svg"}
                              alt={review.user.name}
                              className="w-14 h-14 rounded-full object-cover"
                            />
                          ) : (
                            review.user?.name?.charAt(0)?.toUpperCase() || <User className="w-6 h-6" />
                          )}
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold text-slate-800 text-lg">
                            {review.user?.name || "Anonymous User"}
                          </h3>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                            <span className="text-base text-slate-500 font-medium">{review.rating}/5</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Verification Status */}
                        <div
                          className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm ${
                            review.verified
                              ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200/50"
                              : "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200/50"
                          }`}
                        >
                          {review.verified ? (
                            <>
                              <ShieldCheck className="w-4 h-4" />
                              Verified
                            </>
                          ) : (
                            <>
                              <Shield className="w-4 h-4" />
                              Pending
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="mb-6">
                      <p
                        className={`text-gray-700 text-base lg:text-lg leading-relaxed ${
                          expandedReview === review._id ? "" : "line-clamp-3"
                        }`}
                      >
                        {review.comment}
                      </p>
                      {review.comment && review.comment.length > 150 && (
                        <button
                          onClick={() => setExpandedReview(expandedReview === review._id ? null : review._id)}
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium mt-3 flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          {expandedReview === review._id ? "Show Less" : "Read More"}
                        </button>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">
                          {new Date(review.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleVerified(review._id)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center gap-2 shadow-sm hover:shadow-md transform hover:scale-105 ${
                            review.verified
                              ? "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 hover:from-amber-200 hover:to-orange-200 border border-amber-200/50"
                              : "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 hover:from-emerald-200 hover:to-green-200 border border-emerald-200/50"
                          }`}
                        >
                          {review.verified ? (
                            <>
                              <Shield className="w-4 h-4" />
                              Unverify
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4" />
                              Verify
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          disabled={deletingReviewId === review._id}
                          className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-red-100 to-rose-100 text-red-700 hover:from-red-200 hover:to-rose-200 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md transform hover:scale-105 border border-red-200/50"
                        >
                          {deletingReviewId === review._id ? (
                            <div
                              className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"
                              style={{ animationDuration: "0.6s" }}
                            />
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminReviews
