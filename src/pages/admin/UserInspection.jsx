import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { getUserInspectionData } from "../../services/users"
import {
  AdminPage,
  BackLink,
  AdminHeading,
  DetailCard,
  DetailRows,
  StatusBadge,
  AdminLoading,
  AdminError,
  formatDateTime,
} from "../../components/ui/Admin"

const yesNo = (value) => (value ? "Yes" : "No")

const UserInspection = () => {
  const { userId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getUserInspectionData(userId)
      const payload = response?.user ? response : response?.data
      if (!payload?.user) throw new Error("Account not found")
      setData(payload)
    } catch (err) {
      setError(err.response?.data?.message || "This account didn't load.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  if (loading) return <AdminLoading label="Loading the account…" />

  if (error || !data) {
    return (
      <AdminPage>
        <BackLink to="/admin">Back to customers</BackLink>
        <AdminError message={error || "This account no longer exists."} onRetry={load} />
      </AdminPage>
    )
  }

  const { basicInfo, accountStatus, otpInfo, timestamps, securityInfo } = data.user

  /* Anything that would stop this person signing in is called out first —
     that is the question staff open this screen to answer. */
  const problems = [
    accountStatus.isLocked && {
      label: "Account is locked",
      detail: accountStatus.lockUntil
        ? `Locked until ${formatDateTime(accountStatus.lockUntil)}`
        : "Locked after too many failed sign-ins",
    },
    !accountStatus.isVerified && {
      label: "Email is not verified",
      detail: otpInfo.hasActiveOTP
        ? otpInfo.isOTPExpired
          ? "Their verification code has expired — ask them to request a new one"
          : `A code is active until ${formatDateTime(otpInfo.otpExpiry)}`
        : "No verification code has been sent",
    },
    !securityInfo.hasPassword && {
      label: "No password set",
      detail: "This account signs in with Google only",
    },
    accountStatus.failedLoginAttempts > 0 && {
      label: `${accountStatus.failedLoginAttempts} failed sign-in ${
        accountStatus.failedLoginAttempts === 1 ? "attempt" : "attempts"
      }`,
      detail: "Counts reset after a successful sign-in",
    },
  ].filter(Boolean)

  return (
    <AdminPage>
      <BackLink to="/admin">Back to customers</BackLink>

      <AdminHeading eyebrow="Account" title={basicInfo.name || "Unnamed account"} />

      {/* Identity */}
      <div className="mt-8 flex flex-wrap items-center gap-5 rounded-lg border border-line bg-surface p-5">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-gray-100 text-[20px] font-semibold text-ink-soft">
          {basicInfo.profileImage ? (
            <img src={basicInfo.profileImage} alt="" className="h-full w-full object-cover" />
          ) : (
            (basicInfo.name || "?").charAt(0).toUpperCase()
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="amount truncate text-[15px] text-ink">{basicInfo.email}</p>
          <p className="amount mt-0.5 text-[13.5px] text-ink-mute">
            {basicInfo.number || "No phone number"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge tone={basicInfo.role === "admin" ? "brand" : "neutral"}>
              {basicInfo.role}
            </StatusBadge>
            <StatusBadge status={accountStatus.isVerified ? "verified" : "unverified"}>
              {accountStatus.isVerified ? "Verified" : "Unverified"}
            </StatusBadge>
            {accountStatus.isLocked && <StatusBadge tone="danger">Locked</StatusBadge>}
          </div>
        </div>

        <div className="text-right">
          <p className="text-[12px] text-ink-mute">Account ID</p>
          <p className="amount mt-0.5 text-[12.5px] text-ink-soft">{basicInfo.id}</p>
        </div>
      </div>

      {problems.length > 0 && (
        <div className="mt-6 rounded-lg border border-orange-200 bg-orange-50 px-5 py-4">
          <h2 className="text-[14px] font-semibold text-orange-800">Worth knowing</h2>
          <ul className="mt-3 space-y-2.5">
            {problems.map((p) => (
              <li key={p.label} className="text-[13.5px] leading-relaxed">
                <span className="font-semibold text-orange-800">{p.label}.</span>{" "}
                <span className="text-orange-800/80">{p.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <DetailCard title="Sign-in">
          <DetailRows
            rows={[
              ["Email verified", yesNo(accountStatus.isVerified)],
              ["Password set", yesNo(securityInfo.hasPassword)],
              ["Currently locked", yesNo(accountStatus.isLocked)],
              accountStatus.lockUntil && [
                "Locked until",
                formatDateTime(accountStatus.lockUntil),
                true,
              ],
              ["Failed attempts", accountStatus.failedLoginAttempts ?? 0, true],
              ["Has an active session", yesNo(accountStatus.hasRefreshToken)],
            ]}
          />
        </DetailCard>

        <DetailCard title="Verification and reset">
          <DetailRows
            rows={[
              ["Verification code active", yesNo(otpInfo.hasActiveOTP)],
              otpInfo.otpExpiry && ["Code expires", formatDateTime(otpInfo.otpExpiry), true],
              ["Code expired", yesNo(otpInfo.isOTPExpired)],
              ["Password reset pending", yesNo(accountStatus.hasResetToken)],
              securityInfo.lastPasswordReset && [
                "Last password reset",
                formatDateTime(securityInfo.lastPasswordReset),
                true,
              ],
            ]}
          />
        </DetailCard>

        <DetailCard title="Timeline">
          <DetailRows
            rows={[
              ["Signed up", formatDateTime(timestamps.createdAt), true],
              ["Last updated", formatDateTime(timestamps.updatedAt), true],
            ]}
          />
        </DetailCard>

        <DetailCard title="Storage">
          <DetailRows
            rows={[
              ["Profile image", securityInfo.profileImageId ? "Uploaded" : "None"],
              securityInfo.profileImageId && ["Image ID", securityInfo.profileImageId, true],
            ]}
          />
        </DetailCard>
      </div>

      {data.inspectedBy && (
        <p className="amount mt-8 text-[12.5px] text-ink-mute">
          Viewed by {data.inspectedBy.name || data.inspectedBy.email || "an admin"}
        </p>
      )}
    </AdminPage>
  )
}

export default UserInspection
