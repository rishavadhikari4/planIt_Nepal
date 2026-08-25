import { useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { AlertCircle, ArrowRight, RotateCcw } from "lucide-react"
import { verifyPayment } from "../../services/payments"

/*
 * Where Khalti and Fonepay drop the customer once they're done.
 *
 * The query string is only a hint — it is handed to the server, which asks the
 * gateway what actually happened before anything is marked paid. This page
 * never decides that a payment succeeded on its own.
 */

/** Work out which gateway sent us here, even if the session was lost. */
const readContext = (params) => {
  let stored = null
  try {
    stored = JSON.parse(sessionStorage.getItem("pendingPayment") || "null")
  } catch {
    stored = null
  }

  const query = Object.fromEntries(params.entries())

  if (query.pidx) {
    return { provider: "khalti", orderId: stored?.orderId || query.purchase_order_id, query }
  }
  if (query.PRN) {
    // Fonepay PRNs are issued as "<orderId>-<suffix>".
    return { provider: "fonepay", orderId: stored?.orderId || query.PRN.split("-")[0], query }
  }
  return { provider: stored?.provider, orderId: stored?.orderId, query }
}

function PaymentCallback() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [state, setState] = useState({ phase: "checking" })
  const ran = useRef(false)

  useEffect(() => {
    // React 18 StrictMode mounts effects twice in dev; verify exactly once.
    if (ran.current) return
    ran.current = true

    const { provider, orderId, query } = readContext(params)

    if (!provider || !orderId) {
      setState({
        phase: "error",
        message:
          "We couldn't tell which payment this was. Open the order from your profile to check whether it went through.",
      })
      return
    }

    ;(async () => {
      try {
        const res = await verifyPayment(orderId, provider, query)
        sessionStorage.removeItem("pendingPayment")

        if (res.success) {
          navigate("/order-success", {
            replace: true,
            state: {
              orderData: {
                orderId: res.order._id,
                order: res.order,
                paymentType: res.order.paymentType,
                provider,
                message: res.message,
              },
            },
          })
          return
        }

        setState({ phase: "error", message: res.message, orderId })
      } catch (error) {
        setState({
          phase: "error",
          orderId,
          message:
            error.response?.data?.message ||
            "We couldn't confirm this payment with the gateway. If money left your account, it will be reflected on the order shortly.",
        })
      }
    })()
  }, [params, navigate])

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-paper px-5 py-16">
      <div className="w-full max-w-md">
        {state.phase === "checking" ? (
          <div className="card p-8 text-center">
            <span className="loader mx-auto h-6 w-6" />
            <h1 className="mt-6 text-[22px]">Confirming your payment</h1>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
              We're checking with the gateway. This takes a few seconds — please don't close this
              page.
            </p>
          </div>
        ) : (
          <div className="card p-8">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-600" strokeWidth={2} />
            </span>
            <h1 className="mt-6 text-[24px]">Payment not confirmed</h1>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">{state.message}</p>

            <div className="mt-8 flex flex-col gap-2.5">
              {state.orderId && (
                <button
                  onClick={() => navigate(`/payment/${state.orderId}`, { replace: true })}
                  className="btn btn-accent w-full"
                >
                  <RotateCcw className="h-4 w-4" strokeWidth={2} />
                  Try the payment again
                </button>
              )}
              <button onClick={() => navigate("/")} className="btn btn-ghost w-full">
                Back to home
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentCallback
