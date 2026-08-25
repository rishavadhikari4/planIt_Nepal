import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { editVenue, getVenueById, addVenuePhotos, deleteVenuePhoto } from "../../services/venues"
import {
  FormPage,
  Field,
  Row,
  FormActions,
  ImagePicker,
  GalleryManager,
} from "../ui/FormKit"

const EditVenue = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    location: "",
    description: "",
    capacity: "",
    price: "",
  })
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [photos, setPhotos] = useState([])
  const [staged, setStaged] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deletingPhotoId, setDeletingPhotoId] = useState(null)

  useEffect(() => {
    let live = true
    getVenueById(id)
      .then((response) => {
        const venue = response?.data?.venue
        if (!venue) throw new Error("not found")
        if (!live) return
        setForm({
          name: venue.name || "",
          location: venue.location || "",
          description: venue.description || "",
          capacity: venue.capacity || "",
          price: venue.price || "",
        })
        setPreview(venue.venueImage || null)
        setPhotos(venue.photos || [])
      })
      .catch(() => {
        if (!live) return
        toast.error("That venue couldn't be loaded.")
        navigate("/admin-venues")
      })
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Object URLs for staged files are revoked when they leave the staging area.
  useEffect(() => () => staged.forEach((s) => URL.revokeObjectURL(s.url)), [staged])

  const change = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const uploadStaged = () => {
    setUploading(true)
    addVenuePhotos(
      id,
      staged.map((s) => s.file),
      (message, data) => {
        toast.success(message || "Photos uploaded.")
        const updated = data?.venue || data
        const gallery = updated?.photos || updated?.data?.photos
        if (Array.isArray(gallery)) setPhotos(gallery)
        staged.forEach((s) => URL.revokeObjectURL(s.url))
        setStaged([])
        setUploading(false)
      },
      (message) => {
        toast.error(message || "The photos didn't upload.")
        setUploading(false)
      },
    )
  }

  const removePhoto = (photoId) => {
    setDeletingPhotoId(photoId)
    deleteVenuePhoto(
      id,
      photoId,
      (message, updated) => {
        toast.success(message || "Photo deleted.")
        const gallery = updated?.photos || updated?.data?.photos
        setPhotos(Array.isArray(gallery) ? gallery : photos.filter((p) => p._id !== photoId))
        setDeletingPhotoId(null)
      },
      (message) => {
        toast.error(message || "The photo couldn't be deleted.")
        setDeletingPhotoId(null)
      },
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (Number(form.price) <= 0) return toast.error("Set a price above zero.")
    if (Number(form.capacity) <= 0) return toast.error("Set a capacity above zero.")

    setSaving(true)
    const data = new FormData()
    Object.entries(form).forEach(([key, value]) => data.append(key, value))
    if (image) data.append("image", image)

    try {
      await editVenue(
        id,
        data,
        (message) => {
          toast.success(message || `${form.name} was updated.`)
          navigate("/admin-venues")
        },
        (message) => toast.error(message || "The changes didn't save."),
      )
    } catch {
      toast.error("Something went wrong. The changes weren't saved.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-paper">
        <div className="flex items-center gap-3 text-ink-mute">
          <span className="loader" />
          <span className="t-small">Loading the venue…</span>
        </div>
      </div>
    )
  }

  return (
    <FormPage
      backTo="/admin-venues"
      backLabel="Back to venues"
      eyebrow="Venues"
      title={`Edit ${form.name || "venue"}`}
      description="Changes go live on the customer site as soon as you save."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Field id="name" label="Venue name" required>
          <input id="name" name="name" value={form.name} onChange={change} className="field" required />
        </Field>

        <Field id="location" label="Location" required>
          <input
            id="location"
            name="location"
            value={form.location}
            onChange={change}
            className="field"
            required
          />
        </Field>

        <Row>
          <Field id="capacity" label="Capacity" required hint="How many guests it seats.">
            <input
              id="capacity"
              name="capacity"
              type="number"
              min="1"
              inputMode="numeric"
              value={form.capacity}
              onChange={change}
              className="field amount"
              required
            />
          </Field>

          <Field id="price" label="Price per event" required hint="In rupees.">
            <input
              id="price"
              name="price"
              type="number"
              min="1"
              inputMode="numeric"
              value={form.price}
              onChange={change}
              className="field amount"
              required
            />
          </Field>
        </Row>

        <Field id="description" label="Description" required>
          <textarea
            id="description"
            name="description"
            rows={5}
            value={form.description}
            onChange={change}
            className="field resize-y"
            required
          />
        </Field>

        <ImagePicker
          label="Main photo"
          required
          value={image}
          preview={preview}
          onChange={(file, url) => {
            setImage(file)
            setPreview(url || null)
          }}
          hint="Leave it as is to keep the current photo."
        />

        <GalleryManager
          photos={photos}
          staged={staged}
          onStage={(items) => setStaged((prev) => [...prev, ...items])}
          onUnstage={(index) => {
            URL.revokeObjectURL(staged[index].url)
            setStaged((prev) => prev.filter((_, i) => i !== index))
          }}
          onUpload={uploadStaged}
          onDelete={removePhoto}
          uploading={uploading}
          deletingId={deletingPhotoId}
        />

        <FormActions
          onCancel={() => navigate("/admin-venues")}
          cancelLabel="Discard changes"
          submitLabel="Save changes"
          busyLabel="Saving…"
          busy={saving}
        />
      </form>
    </FormPage>
  )
}

export default EditVenue
