import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { X } from "lucide-react"



const EASE_OUT = [0.23, 1, 0.32, 1]

const Sheet = ({
  open,
  onClose,
  title,
  heading,
  description,
  children,
  width = "max-w-lg",
  className = "",
  bare = false,
}) => {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!open) return

    const onEsc = (e) => e.key === "Escape" && onClose?.()
    document.addEventListener("keydown", onEsc)

    /* Locking with overflow:hidden alone lets the page jump to the top on
       phones. Pinning the body at its current offset holds the reader's
       place. */
    const y = window.scrollY
    const { body } = document
    const previous = { position: body.style.position, top: body.style.top, width: body.style.width }
    body.style.position = "fixed"
    body.style.top = `-${y}px`
    body.style.width = "100%"

    return () => {
      document.removeEventListener("keydown", onEsc)
      Object.assign(body.style, previous)
      window.scrollTo(0, y)
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-crimson-deep/55 backdrop-blur-[2px] sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "linear" }}
          onClick={() => onClose?.()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(e) => e.stopPropagation()}
            /* Nothing in the world appears from nothing: the panel starts at
               96% and a few pixels low, never at zero. */
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            className={`${bare ? "" : "card"} max-h-[90dvh] w-full overflow-y-auto rounded-b-none sm:rounded-b-xl ${width} ${className}`}
          >
            {heading && (
              <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-surface px-6 py-4">
                <div className="min-w-0">
                  <h2 className="t-heading">{heading}</h2>
                  {description && <p className="mt-1 t-small text-ink-soft">{description}</p>}
                </div>
                <CloseButton onClose={onClose} />
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

/**
 * Holds on to the last non-empty value so a dialog can animate out with its
 * contents still in it. Without this the body blanks the instant the data is
 * cleared and the panel scales away empty.
 */
export const useLingering = (value) => {
  // Adjusting state during render is the supported way to derive from a prop
  // without an effect: React re-runs this component immediately, before
  // anything is painted.
  const [last, setLast] = useState(value)
  if (value && value !== last) setLast(value)
  return value || last
}

export const CloseButton = ({ onClose, className = "" }) => (
  <button
    type="button"
    onClick={onClose}
    aria-label="Close"
    className={`-mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-ink-mute transition-colors hover:bg-gray-100 hover:text-ink active:scale-95 ${className}`}
  >
    <X className="h-4 w-4" strokeWidth={2} />
  </button>
)

export default Sheet
