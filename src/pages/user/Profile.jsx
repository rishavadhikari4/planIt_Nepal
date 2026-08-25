import { useEffect, useState, useContext, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Camera, Check, Eye, EyeOff, LogOut, ShieldAlert } from "lucide-react"
import { toast } from "react-toastify"
import { AuthContext } from "../../context/AuthContext"
import {
  fetchLoginUser,
  updateProfilePicture,
  updateProfile,
  deleteAccountOfOwn,
} from "../../services/users"
import { changePassword } from "../../services/auth"
import OrdersComponent from "../../components/user/OrdersComponent"
import { Modal } from "../../components/ui/Admin"

const TABS = [
  { id: "orders", label: "Orders" },
  { id: "details", label: "Your details" },
  { id: "security", label: "Security" },
]

const FIELDS = {
  name: { label: "Name", type: "text", autoComplete: "name", placeholder: "Your full name" },
  number: { label: "Phone", type: "tel", autoComplete: "tel", placeholder: "98XXXXXXXX" },
}

/** A password input that can reveal itself — used three times in this screen. */
const PasswordField = ({ id, label, value, onChange, autoComplete, placeholder, hint }) => {
  const [shown, setShown] = useState(false)
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={shown ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="field pr-11"
          required
        />
        {value && (
          <button
            type="button"
            onClick={() => setShown((v) => !v)}
            aria-label={shown ? "Hide password" : "Show password"}
            className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-ink-mute hover:text-ink"
          >
            {shown ? <EyeOff className="h-4 w-4" strokeWidth={1.75} /> : <Eye className="h-4 w-4" strokeWidth={1.75} />}
          </button>
        )}
      </div>
      {hint && <p className="mt-1.5 text-[12.5px] text-ink-mute">{hint}</p>}
    </div>
  )
}

const UserProfile = () => {
  const { logout, updateUser, sendVerificationMail, verifyMail } = useContext(AuthContext)
  const navigate = useNavigate()
  const fileRef = useRef(null)

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("orders")
  const [uploading, setUploading] = useState(false)

  // Editing one field at a time keeps the save unambiguous.
  const [editing, setEditing] = useState(null)
  const [editValue, setEditValue] = useState("")
  const [savingField, setSavingField] = useState(false)

  const [otpOpen, setOtpOpen] = useState(false)
  const [otp, setOtp] = useState("")
  const [sendingCode, setSendingCode] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const [passwordOpen, setPasswordOpen] = useState(false)
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" })
  const [savingPassword, setSavingPassword] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let live = true
    fetchLoginUser()
      .then((data) => live && setUser(data))
      .catch(() => live && toast.error("Your profile didn't load. Try refreshing."))
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [])

  const applyUser = (next) => {
    setUser(next)
    updateUser(next)
  }

  const handleImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { image } = await updateProfilePicture(file)
      applyUser({ ...user, profileImage: image })
      toast.success("Profile picture updated.")
    } catch {
      toast.error("The picture didn't upload. Try a smaller image.")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const saveField = async (e) => {
    e.preventDefault()
    setSavingField(true)
    try {
      await updateProfile({ [editing]: editValue })
      applyUser({ ...user, [editing]: editValue })
      toast.success(`${FIELDS[editing].label} updated.`)
      setEditing(null)
    } catch {
      toast.error("That didn't save. Try again.")
    } finally {
      setSavingField(false)
    }
  }

  const sendCode = async () => {
    setSendingCode(true)
    try {
      await sendVerificationMail()
      toast.success("Code sent. Check your inbox.")
      setOtpOpen(true)
    } catch {
      toast.error("The code didn't send. Try again in a moment.")
    } finally {
      setSendingCode(false)
    }
  }

  const verify = async (e) => {
    e.preventDefault()
    setVerifying(true)
    try {
      await verifyMail(otp)
      applyUser({ ...user, verified: true })
      toast.success("Email verified.")
      setOtpOpen(false)
      setOtp("")
    } catch {
      toast.error("That code didn't match. Check it and try again.")
    } finally {
      setVerifying(false)
    }
  }

  const passwordProblem = () => {
    const { current, next, confirm } = passwords
    if (!current.trim()) return "Enter your current password."
    if (next.length < 6) return "The new password needs at least 6 characters."
    if (next !== confirm) return "The two new passwords don't match."
    if (current === next) return "The new password has to differ from the current one."
    return null
  }

  const savePassword = async (e) => {
    e.preventDefault()
    const problem = passwordProblem()
    if (problem) return toast.error(problem)

    setSavingPassword(true)
    try {
      await changePassword(passwords.current, passwords.next, passwords.confirm)
      toast.success("Password changed.")
      setPasswordOpen(false)
      setPasswords({ current: "", next: "", confirm: "" })
    } catch (error) {
      toast.error(error.message || "The password didn't change. Check your current one.")
    } finally {
      setSavingPassword(false)
    }
  }

  const removeAccount = async (e) => {
    e.preventDefault()
    if (!deletePassword.trim()) return toast.error("Enter your password to confirm.")
    if (deleteConfirm !== "DELETE") return toast.error('Type DELETE to confirm.')

    setDeleting(true)
    try {
      await deleteAccountOfOwn(deletePassword)
      toast.success("Your account has been deleted.")
      logout()
      navigate("/")
    } catch (error) {
      toast.error(error.message || "That didn't work. Check your password.")
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-paper">
        <div className="flex items-center gap-3 text-ink-mute">
          <span className="loader" />
          <span className="text-[14px]">Loading your profile…</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-paper px-5">
        <div className="card max-w-md p-8 text-center">
          <h1 className="text-[22px]">We couldn&rsquo;t load your profile</h1>
          <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
            Your session may have expired. Log in again to see your bookings.
          </p>
          <button onClick={() => navigate("/login")} className="btn btn-primary mt-7 w-full">
            Log in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* ---------------- Identity ---------------- */}
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center gap-5"
        >
          <div className="relative">
            <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-line bg-gray-100 text-[26px] font-semibold text-ink-soft">
              {user.profileImage ? (
                <img src={user.profileImage} alt="" className="h-full w-full object-cover" />
              ) : (
                (user.name || "?").charAt(0).toUpperCase()
              )}
            </span>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              aria-label="Change profile picture"
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-ink-soft shadow-sm transition-colors hover:text-ink disabled:opacity-60"
            >
              {uploading ? (
                <span className="loader h-3.5 w-3.5" />
              ) : (
                <Camera className="h-3.5 w-3.5" strokeWidth={1.75} />
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="sr-only"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="eyebrow">Your account</p>
            <h1 className="mt-3 text-[30px] sm:text-[36px]">{user.name || "Your profile"}</h1>
            <p className="amount mt-1 truncate text-[14px] text-ink-mute">{user.email}</p>
          </div>

          <button onClick={logout} className="btn btn-ghost">
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            Log out
          </button>
        </motion.header>

        {/* Unverified email blocks nothing today, but it is the one thing worth
            nudging about, so it sits above the tabs rather than inside them. */}
        {!user.verified && (
          <div className="mt-8 flex flex-wrap items-center gap-4 rounded-lg border border-orange-200 bg-orange-50 px-5 py-4">
            <ShieldAlert className="h-5 w-5 shrink-0 text-orange-700" strokeWidth={1.75} />
            <p className="flex-1 text-[14px] leading-relaxed text-orange-800">
              Your email isn&rsquo;t verified yet. Verify it so booking confirmations and receipts
              reach you.
            </p>
            <button
              onClick={sendCode}
              disabled={sendingCode}
              className="btn btn-ghost border-orange-200 bg-surface"
            >
              {sendingCode ? (
                <>
                  <span className="loader h-4 w-4" />
                  Sending…
                </>
              ) : (
                "Send me a code"
              )}
            </button>
          </div>
        )}

        {/* ---------------- Tabs ---------------- */}
        <div className="mt-10 border-b border-line">
          <div role="tablist" aria-label="Profile sections" className="-mb-px flex gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`relative px-4 py-3 text-[14.5px] font-medium transition-colors ${
                  tab === t.id ? "text-ink" : "text-ink-mute hover:text-ink"
                }`}
              >
                {t.label}
                {tab === t.id && (
                  <span className="absolute inset-x-3 bottom-0 block h-0.5 bg-marigold" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          {tab === "orders" && <OrdersComponent />}

          {tab === "details" && (
            <section className="max-w-2xl">
              <div className="card overflow-hidden">
                <dl className="divide-y divide-line">
                  {Object.entries(FIELDS).map(([key, field]) => (
                    <div key={key} className="flex items-center gap-4 px-5 py-4">
                      <div className="min-w-0 flex-1">
                        <dt className="text-[12.5px] text-ink-mute">{field.label}</dt>
                        <dd className="mt-0.5 truncate text-[15px] text-ink">
                          {user[key] || <span className="text-ink-mute">Not set</span>}
                        </dd>
                      </div>
                      <button
                        onClick={() => {
                          setEditing(key)
                          setEditValue(user[key] || "")
                        }}
                        className="shrink-0 text-[13px] font-medium text-pine hover:underline"
                      >
                        {user[key] ? "Change" : "Add"}
                      </button>
                    </div>
                  ))}

                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <dt className="text-[12.5px] text-ink-mute">Email</dt>
                      <dd className="amount mt-0.5 truncate text-[15px] text-ink">{user.email}</dd>
                    </div>
                    {user.verified ? (
                      <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-green-700">
                        <Check className="h-4 w-4" strokeWidth={2.5} />
                        Verified
                      </span>
                    ) : (
                      <button
                        onClick={sendCode}
                        disabled={sendingCode}
                        className="shrink-0 text-[13px] font-medium text-pine hover:underline"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </dl>
              </div>

              <p className="mt-4 text-[12.5px] leading-relaxed text-ink-mute">
                Your email can&rsquo;t be changed here — it identifies your account and your
                receipts. Contact us if you need it moved.
              </p>
            </section>
          )}

          {tab === "security" && (
            <section className="max-w-2xl space-y-6">
              <div className="card p-5">
                <h2 className="text-[16px] font-semibold text-ink">Password</h2>
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
                  Change it whenever you like. You&rsquo;ll need your current password.
                </p>
                <button onClick={() => setPasswordOpen(true)} className="btn btn-ghost mt-5">
                  Change password
                </button>
              </div>

              <div className="card border-red-200 p-5">
                <h2 className="text-[16px] font-semibold text-ink">Delete your account</h2>
                <p className="mt-1.5 max-w-[56ch] text-[14px] leading-relaxed text-ink-soft">
                  This removes your account, your cart and your access to past orders. Bookings
                  already confirmed with our team are not cancelled — contact us for those. This
                  cannot be undone.
                </p>
                <button
                  onClick={() => {
                    setDeletePassword("")
                    setDeleteConfirm("")
                    setDeleteOpen(true)
                  }}
                  className="btn mt-5 border-red-600 bg-red-600 text-white hover:bg-red-700"
                >
                  Delete account
                </button>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* ---------------- Edit one field ---------------- */}
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={`${user[editing] ? "Change" : "Add"} your ${FIELDS[editing]?.label.toLowerCase() || ""}`}
        width="max-w-md"
      >
        <form onSubmit={saveField}>
          <label htmlFor="edit-field" className="label">
            {FIELDS[editing]?.label}
          </label>
          <input
            id="edit-field"
            type={FIELDS[editing]?.type}
            autoComplete={FIELDS[editing]?.autoComplete}
            placeholder={FIELDS[editing]?.placeholder}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="field"
            required
            autoFocus
          />
          <div className="mt-7 flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(null)} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={savingField} className="btn btn-primary">
              {savingField ? (
                <>
                  <span className="loader h-4 w-4 border-white/40 border-t-white" />
                  Saving…
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* ---------------- Verify email ---------------- */}
      <Modal
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        title="Verify your email"
        description={`We sent a code to ${user.email}.`}
        width="max-w-md"
      >
        <form onSubmit={verify}>
          <label htmlFor="otp" className="label">
            Verification code
          </label>
          <input
            id="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="field amount text-center text-[20px] tracking-[0.3em]"
            required
            autoFocus
          />
          <p className="mt-3 text-[12.5px] text-ink-mute">
            Nothing arrived? Check your spam folder, then{" "}
            <button
              type="button"
              onClick={sendCode}
              disabled={sendingCode}
              className="font-medium text-pine hover:underline disabled:opacity-50"
            >
              send a new code
            </button>
            .
          </p>
          <div className="mt-7 flex justify-end gap-2">
            <button type="button" onClick={() => setOtpOpen(false)} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={verifying || !otp.trim()} className="btn btn-primary">
              {verifying ? (
                <>
                  <span className="loader h-4 w-4 border-white/40 border-t-white" />
                  Checking…
                </>
              ) : (
                "Verify email"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* ---------------- Change password ---------------- */}
      <Modal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        title="Change your password"
        width="max-w-md"
      >
        <form onSubmit={savePassword} className="space-y-5">
          <PasswordField
            id="current-password"
            label="Current password"
            value={passwords.current}
            onChange={(v) => setPasswords((p) => ({ ...p, current: v }))}
            autoComplete="current-password"
            placeholder="Your current password"
          />
          <PasswordField
            id="new-password"
            label="New password"
            value={passwords.next}
            onChange={(v) => setPasswords((p) => ({ ...p, next: v }))}
            autoComplete="new-password"
            placeholder="At least 6 characters"
            hint="Use something you haven't used on another site."
          />
          <PasswordField
            id="confirm-password"
            label="Confirm new password"
            value={passwords.confirm}
            onChange={(v) => setPasswords((p) => ({ ...p, confirm: v }))}
            autoComplete="new-password"
            placeholder="Type it again"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setPasswordOpen(false)} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={savingPassword} className="btn btn-primary">
              {savingPassword ? (
                <>
                  <span className="loader h-4 w-4 border-white/40 border-t-white" />
                  Saving…
                </>
              ) : (
                "Change password"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* ---------------- Delete account ---------------- */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete your account"
        description="This cannot be undone."
        width="max-w-md"
      >
        <form onSubmit={removeAccount} className="space-y-5">
          <p className="text-[14px] leading-relaxed text-ink-soft">
            Your account, cart and access to past orders are removed permanently. Confirmed
            bookings stay with our team — contact us if you need those cancelled.
          </p>

          <PasswordField
            id="delete-password"
            label="Your password"
            value={deletePassword}
            onChange={setDeletePassword}
            autoComplete="current-password"
            placeholder="Confirm with your password"
          />

          <div>
            <label htmlFor="delete-confirm" className="label">
              Type DELETE to confirm
            </label>
            <input
              id="delete-confirm"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              className="field amount"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setDeleteOpen(false)} className="btn btn-ghost">
              Keep my account
            </button>
            <button
              type="submit"
              disabled={deleting || deleteConfirm !== "DELETE" || !deletePassword.trim()}
              className="btn border-red-600 bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <span className="loader h-4 w-4 border-white/40 border-t-white" />
                  Deleting…
                </>
              ) : (
                "Delete my account"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default UserProfile
