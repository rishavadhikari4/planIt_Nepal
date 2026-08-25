import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Mail, Phone } from "lucide-react"
import { toast } from "react-toastify"
import { getContactById, deleteContactById } from "../../services/contact"
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

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getContactById(contactId)
      if (res?.success === false) throw new Error(res.message)
      setContact(res.contact || res.data || res)
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
        <a href={replyHref} className="btn btn-accent no-underline">
          <Mail className="h-4 w-4" strokeWidth={2} />
          Reply by email
        </a>
        <button onClick={() => setConfirming(true)} className="btn btn-ghost">
          Delete
        </button>
      </AdminHeading>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <DetailCard title="Their message">
          <div className="px-5 py-5">
            {contact.message ? (
              <p className="max-w-[70ch] whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
                {contact.message}
              </p>
            ) : (
              <p className="text-[14px] text-ink-mute">No message was included.</p>
            )}
          </div>
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
                  <span className="block text-[12px] text-ink-mute">Email</span>
                  <span className="amount block truncate text-[13.5px] text-ink group-hover:underline">
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
                  <span className="block text-[12px] text-ink-mute">Phone</span>
                  <span className="amount block truncate text-[13.5px] text-ink group-hover:underline">
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
