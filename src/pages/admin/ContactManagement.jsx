"use client"

import { useEffect, useMemo, useState } from "react"
import { Mail, MessageCircle, Clock, Globe } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import { getContacts } from "../../services/contact" 

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
  // UI & data state
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // pagination & filtering
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [subjectFilter, setSubjectFilter] = useState("")

  // small local UI state
  const [searchSubject, setSearchSubject] = useState("")

  // fetch contacts from backend using service
  const fetchContacts = async (opts = {}) => {
    const p = Number(opts.page ?? page) || 1
    const l = Number(opts.limit ?? limit) || 10
    const subject = opts.subject ?? subjectFilter

    try {
      setLoading(true)
      setError(null)
      const res = await getContacts({ page: p, limit: l, subject: subject || "" })

      // Normalize pagination into shape: { total, page, pages, limit, hasNext, hasPrev }
      if (res?.success) {
        // try to read server-provided pagination; fallbacks below
        const serverTotal = res.total ?? res.data?.total ?? 0
        const serverPage = res.page ?? res.data?.page ?? p
        const serverPages = res.pages ?? res.data?.pages ?? Math.max(1, Math.ceil((serverTotal || 0) / (l || 10)))
        const serverLimit = res.limit ?? res.data?.limit ?? l

        const pagination = {
          total: Number(serverTotal) || 0,
          page: Number(serverPage) || p,
          pages: Number(serverPages) || 1,
          limit: Number(serverLimit) || l,
          hasNext: typeof res.hasNext !== "undefined" ? res.hasNext : (Number(serverPage) < Number(serverPages)),
          hasPrev: typeof res.hasPrev !== "undefined" ? res.hasPrev : (Number(serverPage) > 1),
        }

        setContacts(Array.isArray(res.contacts) ? res.contacts : (Array.isArray(res.data?.contacts) ? res.data.contacts : []))
        setTotal(pagination.total)
        setPages(pagination.pages)
        setPage(pagination.page)
        setLimit(pagination.limit)
      } else {
        // backend returned success:false or a 404-like response
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

  // initial load
  useEffect(() => {
    fetchContacts({ page: 1 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // refetch when page/limit/subjectFilter changes
  useEffect(() => {
    fetchContacts({ page, limit, subject: subjectFilter })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, subjectFilter])

  // derive subjects list (unique) from the current fetched contacts (optional)
  const subjectsFromData = useMemo(() => {
    const map = new Map()
    contacts.forEach(c => {
      if (c.subject) {
        const key = String(c.subject).trim()
        if (!map.has(key)) map.set(key, 1)
        else map.set(key, map.get(key) + 1)
      }
    })
    const items = [{ subject: "All", count: null }]
    for (const [subject, count] of map) items.push({ subject, count })
    return items
  }, [contacts])

  const handleClickSubject = (subjectValue) => {
    // subjectValue is the slug from subjectOptions; empty string => all
    setSubjectFilter(subjectValue || "")
    setPage(1)
  }

  const clearFilter = () => {
    setSubjectFilter("")
    setSearchSubject("")
    setPage(1)
  }

  const handleSearchSubject = () => {
    // allow free-text subjects to be searched
    setSubjectFilter(searchSubject.trim())
    setPage(1)
  }

  // pagination helpers
  const goToPage = (n) => {
    if (n < 1 || n > pages) return
    setPage(n)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // small presentational components inside file
  const ContactRow = ({ c }) => (
    <div className="bg-white/90 rounded-xl shadow-sm border border-white/20 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h4 className="text-lg font-semibold text-gray-800">{c.name || "Anonymous"}</h4>
              <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{c.message}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <div className="px-2 py-1 bg-gray-100 rounded-lg text-gray-700">
                <strong>Subject:</strong> {c.subject || "-"}
              </div>
              <div className="px-2 py-1 bg-gray-100 rounded-lg text-gray-700">
                <strong>Email:</strong> {c.email || "-"}
              </div>
              {c.phone && (
                <div className="px-2 py-1 bg-gray-100 rounded-lg text-gray-700">
                  <strong>Phone:</strong> {c.phone}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-right text-sm">
          <div className="text-gray-600">{c.location || "—"}</div>
          <div className="text-xs text-gray-400 mt-2">{c._id}</div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Contact Submissions
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">View messages users sent via the contact form. Click a subject to filter.</p>
        </motion.div>

        {/* Controls: subject chips + search + pagination controls */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              {/* render the provided subjectOptions as chips */}
              {subjectOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleClickSubject(opt.value)}
                  className={`px-3 py-2 rounded-full text-sm ${subjectFilter === opt.value ? "bg-purple-600 text-white" : "bg-white/80 text-gray-700 border border-white/20"}`}
                  title={opt.label}
                >
                  {opt.label}
                </button>
              ))}

              {/* small quick clear */}
              {subjectFilter && (
                <button onClick={clearFilter} className="px-3 py-2 rounded-full text-sm bg-red-50 text-red-700 border border-red-100">
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Filter by subject..."
                value={searchSubject}
                onChange={(e) => setSearchSubject(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 bg-white/80 text-sm"
              />
              <button onClick={handleSearchSubject} className="px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm">
                Search
              </button>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Per page</label>
                <select
                  value={limit}
                  onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1) }}
                  className="px-2 py-1 rounded-md border bg-white/90 text-sm"
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

        {/* Contacts list */}
        <div className="max-w-7xl mx-auto space-y-4">
          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading contacts...</div>
          ) : contacts.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No contacts found.</div>
          ) : (
            contacts.map((c) => <ContactRow key={c._id} c={c} />)
          )}
        </div>

        {/* Pagination */}
        <div className="max-w-7xl mx-auto mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing page {page} of {pages} • {total} messages
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="px-3 py-2 rounded-lg bg-white/90 border border-white/20 text-sm disabled:opacity-50"
            >
              Prev
            </button>

            {/* show up to 5 page buttons centered on current page */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-2 rounded-lg text-sm ${page === pageNum ? "bg-purple-600 text-white" : "bg-white/80 text-gray-700 border border-white/20"}`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= pages}
              className="px-3 py-2 rounded-lg bg-white/90 border border-white/20 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminContact
