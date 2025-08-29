"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Mail, MessageCircle, Trash2, Eye } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import { getContacts, deleteContactById } from "../../services/contact"

const subjectOptions = [
  { value: "", label: "All" },
  { value: "wedding-planning", label: "Wedding Planning" },
  { value: "corporate-event", label: "Corporate Event" },
  { value: "birthday-party", label: "Birthday Party" },
  { value: "anniversary-celebration", label: "Anniversary Celebration" },
  { value: "graduation-party", label: "Graduation Party" },
  { value: "baby-shower", label: "Baby Shower" },
  { value: "conference-seminar", label: "Conference/Seminar" },
  { value: "photography-inquiry", label: "Photography Services" },
  { value: "catering-inquiry", label: "Catering Services" },
  { value: "venue-rental", label: "Venue Rental" },
  { value: "pricing-inquiry", label: "Pricing Inquiry" },
  { value: "others", label: "Others" },
]

const AdminContact = () => {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [subjectFilter, setSubjectFilter] = useState("")
  const [searchSubject, setSearchSubject] = useState("")
  const [deletingId, setDeletingId] = useState(null) // tracks individual delete

  const fetchContacts = async (opts = {}) => {
    const p = Number(opts.page ?? page) || 1
    const l = Number(opts.limit ?? limit) || 10
    const subject = opts.subject ?? subjectFilter

    try {
      setLoading(true)
      setError(null)
      const res = await getContacts({ page: p, limit: l, subject: subject || "" })

      if (res?.success) {
        const serverTotal = res.total ?? res.data?.total ?? 0
        const serverPage = res.page ?? res.data?.page ?? p
        const serverPages = res.pages ?? res.data?.pages ?? Math.max(1, Math.ceil((serverTotal || 0) / (l || 10)))
        const serverLimit = res.limit ?? res.data?.limit ?? l

        const pagination = {
          total: Number(serverTotal) || 0,
          page: Number(serverPage) || p,
          pages: Number(serverPages) || 1,
          limit: Number(serverLimit) || l,
          hasNext: typeof res.hasNext !== "undefined" ? res.hasNext : Number(serverPage) < Number(serverPages),
          hasPrev: typeof res.hasPrev !== "undefined" ? res.hasPrev : Number(serverPage) > 1,
        }

        setContacts(
          Array.isArray(res.contacts) ? res.contacts : Array.isArray(res.data?.contacts) ? res.data.contacts : [],
        )
        setTotal(pagination.total)
        setPages(pagination.pages)
        setPage(pagination.page)
        setLimit(pagination.limit)
      } else {
        setContacts([])
        setTotal(0)
        setPages(1)
        setPage(1)
        if (res?.message) toast.info(res.message)
      }
    } catch (err) {
      console.error("Error fetching contacts:", err)
      setError(err.response?.data?.message || err.message || "Failed to fetch contacts")
      toast.error(err.response?.data?.message || err.message || "Failed to fetch contacts")
      setContacts([])
      setTotal(0)
      setPages(1)
      setPage(1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts({ page, limit, subject: subjectFilter })
  }, [page, limit, subjectFilter])

  const handleClickSubject = (subjectValue) => {
    setSubjectFilter(subjectValue || "")
    setPage(1)
  }

  const clearFilter = () => {
    setSubjectFilter("")
    setSearchSubject("")
    setPage(1)
  }

  const handleSearchSubject = () => {
    setSubjectFilter(searchSubject.trim())
    setPage(1)
  }

  const goToPage = (n) => {
    if (n < 1 || n > pages) return
    setPage(n)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleContactFormDelete = async (id) => {
    if (!id) return
    if (!window.confirm("Are you sure you want to delete this contact?")) return

    try {
      setDeletingId(id)
      const toastId = toast.loading("Deleting contact...")
      const response = await deleteContactById(id)

      if (response?.success) {
        // remove from UI immediately
        setContacts((prev) => prev.filter((c) => c._id !== id))
        toast.update(toastId, {
          render: response.message || "Contact deleted successfully",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })
      } else {
        toast.update(toastId, {
          render: response?.message || "Error deleting contact",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        })
      }
    } catch (err) {
      console.error("Delete error:", err)
      toast.error("Something went wrong while deleting.")
    } finally {
      setDeletingId(null)
    }
  }

  const ContactRow = ({ c }) => (
    <motion.div
      className="group bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm border border-white/30 p-6 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-500 ease-out hover:border-purple-200/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-5 flex-1">
          <motion.div
            className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-purple-600 shadow-sm group-hover:shadow-md transition-all duration-300"
            whileHover={{ scale: 1.05 }}
          >
            <Mail className="w-6 h-6" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4 mb-2">
              <h4 className="text-xl font-semibold text-gray-800 group-hover:text-purple-700 transition-colors duration-300">
                {c.name || "Anonymous"}
              </h4>
              <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                {new Date(c.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4 line-clamp-2">{c.message}</p>
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg text-sm text-gray-700 border border-gray-200/50">
                <span className="font-medium text-gray-500 mr-1">Subject:</span>
                {c.subject || "-"}
              </div>
              <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg text-sm text-gray-700 border border-blue-200/50">
                <span className="font-medium text-gray-500 mr-1">Email:</span>
                {c.email || "-"}
              </div>
              {c.phone && (
                <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg text-sm text-gray-700 border border-purple-200/50">
                  <span className="font-medium text-gray-500 mr-1">Phone:</span>
                  {c.phone}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <motion.button
            onClick={() => navigate(`/admin-contact/${c._id}`)}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-300 text-sm font-medium hover:shadow-md border border-transparent hover:border-purple-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </motion.button>

          <motion.button
            onClick={() => handleContactFormDelete(c._id)}
            disabled={deletingId === c._id}
            className={`px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
              deletingId === c._id
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:shadow-lg active:scale-95"
            }`}
            whileHover={deletingId !== c._id ? { scale: 1.02 } : {}}
            whileTap={deletingId !== c._id ? { scale: 0.98 } : {}}
          >
            <Trash2 className="w-4 h-4" />
            {deletingId === c._id ? "Deleting..." : "Delete"}
          </motion.button>

          <div className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded-md">{c._id}</div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/80 to-purple-50/80 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div
            className="flex justify-center mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-200/50">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <motion.h1
            className="text-5xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Contact Submissions
          </motion.h1>
          <motion.p
            className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            View and manage messages from your contact form. Filter by subject or search to find specific inquiries.
          </motion.p>
        </motion.div>

        <motion.div
          className="max-w-7xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              <div className="flex flex-wrap gap-2 items-center">
                {subjectOptions.map((opt, index) => (
                  <motion.button
                    key={opt.value}
                    onClick={() => handleClickSubject(opt.value)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                      subjectFilter === opt.value
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-200/50"
                        : "bg-white/90 text-gray-700 border border-gray-200/50 hover:border-purple-300 hover:bg-purple-50"
                    }`}
                    title={opt.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {opt.label}
                  </motion.button>
                ))}
                <AnimatePresence>
                  {subjectFilter && (
                    <motion.button
                      onClick={clearFilter}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 hover:from-red-100 hover:to-red-200 transition-all duration-300"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Clear Filter
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Filter by subject..."
                    value={searchSubject}
                    onChange={(e) => setSearchSubject(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-300"
                  />
                  <motion.button
                    onClick={handleSearchSubject}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium shadow-lg shadow-purple-200/50 hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Search
                  </motion.button>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-600 font-medium">Per page</label>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number.parseInt(e.target.value))
                      setPage(1)
                    }}
                    className="px-3 py-2 rounded-xl border border-gray-200 bg-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-300"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="max-w-7xl mx-auto space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                className="py-16 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="inline-flex items-center gap-3 text-gray-500">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-lg">Loading contacts...</span>
                </div>
              </motion.div>
            ) : contacts.length === 0 ? (
              <motion.div
                className="py-16 text-center text-gray-500"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No contacts found.</p>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                {contacts.map((c, index) => (
                  <motion.div
                    key={c._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.1,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  >
                    <ContactRow c={c} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="max-w-7xl mx-auto mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-medium">
                  Showing page {page} of {pages}
                </span>
                <span className="mx-2">•</span>
                <span>{total} total messages</span>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="px-4 py-2 rounded-xl bg-white/90 border border-gray-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
                  whileHover={page > 1 ? { scale: 1.05 } : {}}
                  whileTap={page > 1 ? { scale: 0.95 } : {}}
                >
                  Previous
                </motion.button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <motion.button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                          page === pageNum
                            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-200/50"
                            : "bg-white/90 text-gray-700 border border-gray-200 hover:bg-purple-50 hover:border-purple-300"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {pageNum}
                      </motion.button>
                    )
                  })}
                </div>

                <motion.button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= pages}
                  className="px-4 py-2 rounded-xl bg-white/90 border border-gray-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
                  whileHover={page < pages ? { scale: 1.05 } : {}}
                  whileTap={page < pages ? { scale: 0.95 } : {}}
                >
                  Next
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminContact
