import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, ImagePlus, X } from "lucide-react"
import { toast } from "react-toastify"

/*
 * Shared pieces for the six admin forms (add/edit venue, studio and dish).
 * They were each carrying their own drag-and-drop uploader and their own
 * layout; this holds both once.
 */

export const FormPage = ({ backTo, backLabel, eyebrow, title, description, children }) => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-6 sm:py-12 lg:px-8">
        <button onClick={() => navigate(backTo)} className="btn btn-quiet -ml-2.5 mb-6">
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          {backLabel}
        </button>

        <header className="border-b border-line pb-6">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="mt-4 text-[30px] sm:text-[34px]">{title}</h1>
          {description && (
            <p className="mt-3 max-w-[60ch] text-[14.5px] leading-relaxed text-ink-soft">
              {description}
            </p>
          )}
        </header>

        <div className="mt-8">{children}</div>
      </div>
    </div>
  )
}

export const Field = ({ id, label, hint, required, children }) => (
  <div>
    <label htmlFor={id} className="label">
      {label}
      {!required && <span className="ml-1.5 font-normal text-ink-mute">(optional)</span>}
    </label>
    {children}
    {hint && <p className="mt-1.5 text-[12.5px] text-ink-mute">{hint}</p>}
  </div>
)

/** Two fields on one row on desktop, stacked on mobile. */
export const Row = ({ children }) => <div className="grid gap-5 sm:grid-cols-2">{children}</div>

export const FormActions = ({ onCancel, cancelLabel = "Cancel", submitLabel, busy, busyLabel }) => (
  <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-6">
    <button type="button" onClick={onCancel} disabled={busy} className="btn btn-ghost">
      {cancelLabel}
    </button>
    <button type="submit" disabled={busy} className="btn btn-accent">
      {busy ? (
        <>
          <span className="loader h-4 w-4 border-white/40 border-t-white" />
          {busyLabel}
        </>
      ) : (
        submitLabel
      )}
    </button>
  </div>
)

const MAX_MB = 5

/**
 * One image, dropped or picked. Shows the file it holds rather than a generic
 * "image selected", and refuses anything that isn't an image up front.
 */
export const ImagePicker = ({ label = "Photo", value, preview, onChange, hint, required }) => {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const accept = (file) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      return toast.error("That file isn't an image.")
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      return toast.error(`Images have to be under ${MAX_MB}MB. That one is bigger.`)
    }
    onChange(file, URL.createObjectURL(file))
  }

  return (
    <div>
      <p className="label">
        {label}
        {!required && <span className="ml-1.5 font-normal text-ink-mute">(optional)</span>}
      </p>

      {preview ? (
        <div className="relative overflow-hidden rounded-lg border border-line">
          <img src={preview} alt="" className="aspect-[16/9] w-full object-cover" />
          <div className="flex items-center justify-between gap-3 border-t border-line bg-surface px-4 py-3">
            <p className="min-w-0 truncate text-[13px] text-ink-soft">
              {value?.name || "Current photo"}
            </p>
            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-[13px] font-medium text-crimson hover:underline"
              >
                Replace
              </button>
              {value && (
                <button
                  type="button"
                  onClick={() => {
                    onChange(null, null)
                    if (inputRef.current) inputRef.current.value = ""
                  }}
                  aria-label="Remove photo"
                  className="text-[13px] font-medium text-ink-mute hover:text-red-600 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            accept(e.dataTransfer.files?.[0])
          }}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 transition-colors ${
            dragging ? "border-brass bg-brass-soft/40" : "border-line-strong hover:border-ink-mute"
          }`}
        >
          <ImagePlus className="h-6 w-6 text-ink-mute" strokeWidth={1.5} />
          <span className="text-[14px] font-medium text-ink">
            Drop an image here, or click to choose
          </span>
          <span className="text-[12.5px] text-ink-mute">JPG or PNG, up to {MAX_MB}MB</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => accept(e.target.files?.[0])}
        className="sr-only"
      />

      {hint && <p className="mt-1.5 text-[12.5px] text-ink-mute">{hint}</p>}
    </div>
  )
}

/**
 * The extra photo gallery on a venue or studio: what is already published,
 * plus a staging area for new files that are uploaded on demand.
 */
export const GalleryManager = ({
  photos = [],
  staged = [],
  onStage,
  onUnstage,
  onUpload,
  onDelete,
  uploading,
  deletingId,
}) => {
  const inputRef = useRef(null)

  const accept = (files) => {
    const images = Array.from(files || []).filter((f) => f.type.startsWith("image/"))
    if (images.length === 0) return toast.error("Those files aren't images.")
    const tooBig = images.filter((f) => f.size > MAX_MB * 1024 * 1024)
    if (tooBig.length) toast.error(`${tooBig.length} file(s) were over ${MAX_MB}MB and were skipped.`)
    const ok = images.filter((f) => f.size <= MAX_MB * 1024 * 1024)
    if (ok.length) onStage(ok.map((file) => ({ file, url: URL.createObjectURL(file) })))
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="label mb-0">Gallery</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-[13px] font-medium text-crimson hover:underline"
        >
          Add photos
        </button>
      </div>
      <p className="mt-1.5 text-[12.5px] text-ink-mute">
        Extra photos shown on the detail page. The main photo above stays separate.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => accept(e.target.files)}
        className="sr-only"
      />

      {photos.length === 0 && staged.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-line-strong px-5 py-8 text-center text-[13.5px] text-ink-mute">
          No extra photos yet.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo._id}
              className="group relative aspect-square overflow-hidden rounded-md border border-line bg-gray-100"
            >
              <img src={photo.image} alt="" loading="lazy" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onDelete(photo._id)}
                disabled={deletingId === photo._id}
                aria-label="Delete this photo"
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-surface/90 text-ink-soft opacity-0 transition-opacity hover:text-red-600 focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-100"
              >
                {deletingId === photo._id ? (
                  <span className="loader h-3 w-3" />
                ) : (
                  <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                )}
              </button>
            </div>
          ))}

          {staged.map((item, i) => (
            <div
              key={item.url}
              className="group relative aspect-square overflow-hidden rounded-md border-2 border-dashed border-brass bg-gray-100"
            >
              <img src={item.url} alt="" className="h-full w-full object-cover opacity-70" />
              <span className="absolute inset-x-0 bottom-0 bg-brass-deep px-1 py-0.5 text-center text-[10px] font-semibold uppercase tracking-wider text-white">
                Not saved
              </span>
              <button
                type="button"
                onClick={() => onUnstage(i)}
                aria-label="Remove this photo"
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-surface/90 text-ink-soft hover:text-red-600"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>
      )}

      {staged.length > 0 && (
        <button
          type="button"
          onClick={onUpload}
          disabled={uploading}
          className="btn btn-primary mt-4"
        >
          {uploading ? (
            <>
              <span className="loader h-4 w-4 border-white/40 border-t-white" />
              Uploading…
            </>
          ) : (
            `Upload ${staged.length} ${staged.length === 1 ? "photo" : "photos"}`
          )}
        </button>
      )}
    </section>
  )
}

/** Multi-select rendered as toggles, which reads better than a native multiple. */
export const CheckboxGroup = ({ label, options, value = [], onChange, hint }) => (
  <fieldset>
    <legend className="label">{label}</legend>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const on = value.includes(option)
        return (
          <button
            key={option}
            type="button"
            role="checkbox"
            aria-checked={on}
            onClick={() => onChange(on ? value.filter((v) => v !== option) : [...value, option])}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors ${
              on
                ? "border-crimson bg-crimson text-white"
                : "border-line-strong text-ink-soft hover:border-ink-mute hover:text-ink"
            }`}
          >
            {on && <X className="h-3 w-3 rotate-45" strokeWidth={3} />}
            {option}
          </button>
        )
      })}
    </div>
    {hint && <p className="mt-2 text-[12.5px] text-ink-mute">{hint}</p>}
  </fieldset>
)
