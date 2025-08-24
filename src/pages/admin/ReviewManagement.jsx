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
          <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin"></div>
          <div
            className="w-16 h-16 border-4 border-purple-600 rounded-full animate-spin absolute top-0 left-0"
            style={{ clipPath: "inset(0 50% 0 0)" }}
          ></div>
        </div>
        <p className="text-gray-600 font-medium">Loading reviews...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <MessageSquare className="w-8 h-8 text-red-600" />
        </div>
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">{error}</p>
          <button
            onClick={fetchReviews}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Customer Reviews</h2>
          <p className="text-gray-600">Manage and moderate customer feedback and ratings</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Reviews",
            value: stats.total,
            icon: MessageSquare,
            color: "text-blue-600",
            bg: "bg-blue-100",
          },
          { label: "Verified", value: stats.verified, icon: ShieldCheck, color: "text-green-600", bg: "bg-green-100" },
          { label: "Pending", value: stats.unverified, icon: Shield, color: "text-orange-600", bg: "bg-orange-100" },
          { label: "Avg Rating", value: stats.avgRating, icon: Star, color: "text-yellow-600", bg: "bg-yellow-100" },
        ].map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <motion.div
              key={stat.label}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 lg:p-6 border border-gray-200/50 shadow-sm hover:shadow-lg transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <IconComponent className={`w-5 h-5 lg:w-6 lg:h-6 ${stat.color}`} />
                </div>
              </div>
              <div>
                <p className="text-xl lg:text-2xl font-bold text-gray-800 mb-1">{stat.value}</p>
                <p className="text-gray-500 text-xs lg:text-sm">{stat.label}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 lg:p-6 border border-gray-200/50 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search reviews by user or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer min-w-[140px]"
            >
              <option value="all">All Reviews</option>
              <option value="verified">Verified</option>
              <option value="unverified">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 lg:p-12 border border-gray-200/50 shadow-sm text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Reviews Found</h3>
            <p className="text-gray-600">
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
                className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="p-4 lg:p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                          {review.user?.profileImage ? (
                            <img
                              src={review.user.profileImage}
                              alt={review.user.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            review.user?.name?.charAt(0)?.toUpperCase() || <User className="w-5 h-5" />
                          )}
                      <div>
                        <h3 className="font-semibold text-gray-800 text-sm lg:text-base">
                          {review.user?.name || "Anonymous User"}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                          <span className="text-sm text-gray-500">{review.rating}/5</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Verification Status */}
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                          review.verified ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {review.verified ? (
                          <>
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </>
                        ) : (
                          <>
                            <Shield className="w-3 h-3" />
                            Pending
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="mb-4">
                    <p
                      className={`text-gray-700 text-sm lg:text-base leading-relaxed ${
                        expandedReview === review._id ? "" : "line-clamp-3"
                      }`}
                    >
                      {review.comment}
                    </p>
                    {review.comment && review.comment.length > 150 && (
                      <button
                        onClick={() => setExpandedReview(expandedReview === review._id ? null : review._id)}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium mt-2 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        {expandedReview === review._id ? "Show Less" : "Read More"}
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {new Date(review.createdAt || Date.now()).toLocaleDateString()}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleVerified(review._id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1 ${
                          review.verified
                            ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {review.verified ? (
                          <>
                            <Shield className="w-3 h-3" />
                            Unverify
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3 h-3" />
                            Verify
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        disabled={deletingReviewId === review._id}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {deletingReviewId === review._id ? (
                          <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="w-3 h-3" />
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
  )
}

export default AdminReviews
