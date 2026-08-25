import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Mail, Phone, Send, StickyNote } from "lucide-react"
import { toast } from "react-toastify"
import {
  getContactById,
  deleteContactById,
  replyToContact,
  updateContactStatus,
} from "../../services/contact"
import {
  AdminPage,
  BackLink,
  AdminHeading,
  DetailCard,
  DetailRows,
  AdminLoading,
  AdminError,
  ConfirmDialog,
  formatDateTime,
} from "../../components/ui/Admin"

const SUBJECT_LABELS = {
  "wedding-planning": "Wedding",
  "corporate-event": "Corporate event",
  "birthday-party": "Birthday",
  "anniversary-celebration": "Anniversary",
  "graduation-party": "Graduation",
  "baby-shower": "Baby shower / Pasni",
  "conference-seminar": "Conference or seminar",
  "photography-inquiry": "Photography only",
  "catering-inquiry": "Catering only",
  "venue-rental": "Venue only",
  "pricing-inquiry": "Pricing",
  others: "Something else",
}

/* Where an enquiry has got to. It had no state at all before, so the only way
   to know whether someone had replied was to ask them. */
const STATUSES = [
  { id: "new", label: "New", tone: "border-blue-200 bg-blue-50 text-blue-700" },
  { id: "in_progress", label: "Working on it", tone: "border-orange-200 bg-orange-50 text-orange-800" },
  { id: "answered", label: "Answered", tone: "border-green-200 bg-green-50 text-green-700" },
  { id: "closed", label: "Closed", tone: "border-line bg-gray-100 text-ink-soft" },
]

const budgetLabel = (value) => {
  if (!value) return "Not given"
  const fmt = (n) => Number(n).toLocaleString("en-IN")
  if (value.endsWith("+")) return `Over Rs ${fmt(value.slice(0, -1))}`
  const [min, max] = value.split("-")
  return max ? `Rs ${fmt(min)} – ${fmt(max)}` : `Rs ${fmt(min)}`
}

const ContactDetails = () => {
  const { contactId } = useParams()
  const navigate = useNavigate()
  const [contact, setContact] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [reply, setReply] = useState("")
  const [sending, setSending] = useState(false)
  const [note, setNote] = useState("")
  const [savingNote, setSavingNote] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getContactById(contactId)
      if (res?.success === false) throw new Error(res.message)
      const found = res.contact || res.data?.contact || res.data || res
      setContact(found)
      setNote(found?.internalNote || "")
    } catch (err) {
      setError(err.message || "This enquiry didn't load.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactId])

  const setStatus = async (status) => {
    const previous = contact.status
    setContact((current) => ({ ...current, status }))
    try {
      await updateContactStatus(contactId, { status })
    } catch (err) {
      setContact((current) => ({ ...current, status: previous }))
      toast.error(err.response?.data?.message || "That didn't save.")
    }
  }

  const saveNote = async () => {
    setSavingNote(true)
    try {
      const result = await updateContactStatus(contactId, { internalNote: note })
      setContact(result.data.contact)
      toast.success("Note saved.")
    } catch (err) {
      toast.error(err.response?.data?.message || "The note didn't save.")
    } finally {
      setSavingNote(false)
    }
  }

  const sendReply = async (event) => {
    event.preventDefault()
    if (reply.trim().length < 2) return toast.info("Write a reply before sending it.")

    setSending(true)
    try {
      const result = await replyToContact(contactId, reply.trim())
      setContact(result.data.contact)
      setReply("")
      // The reply is stored even when the mail fails, so say which happened.
      if (result.warning) toast.warning(result.warning)
      else toast.success(result.message)
    } catch (err) {
      toast.error(err.response?.data?.message || "The reply didn't send.")
    } finally {
      setSending(false)
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      const res = await deleteContactById(contactId)
      if (res?.success === false) throw new Error(res.message)
      toast.success("Enquiry deleted.")
      navigate("/admin-contact")
    } catch (err) {
      toast.error(err.message || "The enquiry couldn't be deleted.")
      setDeleting(false)
    }
  }

  if (loading) return <AdminLoading label="Loading the enquiry…" />

  if (error || !contact) {
    return (
      <AdminPage>
        <BackLink to="/admin-contact">Back to enquiries</BackLink>
        <AdminError message={error || "This enquiry no longer exists."} onRetry={load} />
      </AdminPage>
    )
  }

  const subject = SUBJECT_LABELS[contact.subject] || contact.subject || "Not specified"

  /* Replying is the whole point of this screen, so the reply is prefilled with
     enough context that the planner does not have to retype it. */
  const replyHref = `mailto:${contact.email}?subject=${encodeURIComponent(
    `Re: your ${subject.toLowerCase()} enquiry — PlanIt Nepal`,
  )}&body=${encodeURIComponent(`Hi ${contact.name || "there"},\n\nThanks for getting in touch about your event.\n\n`)}`

  return (
    <AdminPage>
      <BackLink to="/admin-contact">Back to enquiries</BackLink>

      <AdminHeading eyebrow="Enquiry" title={contact.name || "No name given"}>
        <a href={replyHref} className="btn btn-ghost no-underline">
          <Mail className="h-4 w-4" strokeWidth={2} />
          Open in mail app
        </a>
        <button onClick={() => setConfirming(true)} className="btn btn-ghost">
          Delete
        </button>
      </AdminHeading>

      {/* The queue state, changed in one click from the record itself. */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="t-caption text-ink-mute">Status</span>
        {STATUSES.map((status) => {
          const active = (contact.status || "new") === status.id
          return (
            <button
              key={status.id}
              onClick={() => setStatus(status.id)}
              aria-pressed={active}
              className={`rounded-full border px-3 py-1 t-caption font-semibold transition-colors active:scale-95 ${
                active ? status.tone : "border-line text-ink-mute hover:border-ink-mute hover:text-ink"
              }`}
            >
              {status.label}
            </button>
          )
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <DetailCard title="Their message">
          <div className="px-5 py-5">
            {contact.message ? (
              <p className="max-w-[70ch] whitespace-pre-wrap t-body leading-relaxed text-ink">
                {contact.message}
              </p>
            ) : (
              <p className="t-small text-ink-mute">No message was included.</p>
            )}
          </div>

          {/* What has already been said, so the next person to open this does
              not answer the same question twice. */}
          {contact.replies?.length > 0 && (
            <ul className="divide-y divide-line border-t border-line">
              {contact.replies.map((entry, i) => (
                <li key={entry._id || i} className="bg-gray-50 px-5 py-4">
                  <p className="flex flex-wrap items-baseline gap-2 t-caption text-ink-mute">
                    <span className="font-semibold text-ink-soft">
                      {entry.sentByName || "Staff"}
                    </span>
                    <span>{formatDateTime(entry.sentAt)}</span>
                    {!entry.emailed && (
                      <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-px font-semibold text-orange-800">
                        Not emailed
                      </span>
                    )}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap t-small leading-relaxed text-ink">
                    {entry.body}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={sendReply} className="border-t border-line px-5 py-5">
            <label htmlFor="reply" className="label">
              Reply to {contact.name || "them"}
            </label>
            <textarea
              id="reply"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={5}
              maxLength={4000}
              placeholder={`Hello ${contact.name || "there"},\n\nThanks for getting in touch about your event.`}
              className="field resize-y"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="t-caption text-ink-mute">
                Sends to <span className="amount">{contact.email}</span> and is recorded here.
              </p>
              <button type="submit" disabled={sending} className="btn btn-accent">
                {sending ? (
                  <>
                    <span className="loader h-4 w-4 border-white/40 border-t-white" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" strokeWidth={2} />
                    Send reply
                  </>
                )}
              </button>
            </div>
          </form>
        </DetailCard>

        <div className="space-y-6">
          <DetailCard title="Contact">
            <div className="divide-y divide-line">
              <a
                href={`mailto:${contact.email}`}
                className="group flex items-center gap-3 px-5 py-3.5 no-underline"
              >
                <Mail className="h-4 w-4 shrink-0 text-ink-mute" strokeWidth={1.75} />
                <span className="min-w-0 flex-1">
                  <span className="block t-caption text-ink-mute">Email</span>
                  <span className="amount block truncate t-small text-ink group-hover:underline">
                    {contact.email || "—"}
                  </span>
                </span>
              </a>
              <a
                href={`tel:${contact.phone}`}
                className="group flex items-center gap-3 px-5 py-3.5 no-underline"
              >
                <Phone className="h-4 w-4 shrink-0 text-ink-mute" strokeWidth={1.75} />
                <span className="min-w-0 flex-1">
                  <span className="block t-caption text-ink-mute">Phone</span>
                  <span className="amount block truncate t-small text-ink group-hover:underline">
                    {contact.phone || "—"}
                  </span>
                </span>
              </a>
            </div>
          </DetailCard>

          <DetailCard title="The event">
            <DetailRows
              rows={[
                ["Occasion", subject],
                ["Budget", budgetLabel(contact.budget), true],
                ["Received", formatDateTime(contact.createdAt), true],
              ]}
            />
          </DetailCard>

          {/* Staff-only. Never reaches the customer. */}
          <DetailCard title="Internal note">
            <div className="px-5 py-4">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="Rang bhawan quoted, waiting on their date…"
                className="field resize-y"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="inline-flex items-center gap-1.5 t-caption text-ink-mute">
                  <StickyNote className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Only staff see this
                </p>
                <button
                  onClick={saveNote}
                  disabled={savingNote || note === (contact.internalNote || "")}
                  className="btn btn-ghost"
                >
                  {savingNote ? "Saving…" : "Save note"}
                </button>
              </div>
            </div>
          </DetailCard>
        </div>
      </div>

      <ConfirmDialog
        open={confirming}
        onCancel={() => setConfirming(false)}
        onConfirm={confirmDelete}
        busy={deleting}
        title="Delete this enquiry?"
        body={`The message from ${contact.name || "this person"} will be removed permanently. If you haven't replied yet, copy their email first: ${contact.email || "—"}`}
        confirmLabel="Delete enquiry"
      />
    </AdminPage>
  )
}

export default ContactDetails
