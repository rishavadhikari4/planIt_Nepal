import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import {
  updateStudio,
  getStudioById,
  addStudioPhotos,
  deleteStudioPhoto,
} from "../../services/studios"
import {
  FormPage,
  Field,
  Row,
  FormActions,
  ImagePicker,
  GalleryManager,
  CheckboxGroup,
} from "../ui/FormKit"

// These strings have to match what the backend validates against.
const SERVICES = [
  "Wedding Photography",
  "Pre-wedding Shoot",
  "Video Recording",
  "Album Design",
  "Digital Copies",
  "Drone Photography",
]

const EditStudio = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    location: "",
    description: "",
    price: "",
    services: [],
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
    getStudioById(id)
      .then((response) => {
        const studio = response?.data?.studio
        if (!studio) throw new Error("not found")
        if (!live) return
        setForm({
          name: studio.name || "",
          location: studio.location || "",
          description: studio.description || "",
          price: studio.price || "",
          services: Array.isArray(studio.services) ? studio.services : [],
        })
        setPreview(studio.studioImage || null)
        setPhotos(studio.photos || [])
      })
      .catch(() => {
        if (!live) return
        toast.error("That studio couldn't be loaded.")
        navigate("/admin-studios")
      })
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => () => staged.forEach((s) => URL.revokeObjectURL(s.url)), [staged])

  const change = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const uploadStaged = async () => {
    setUploading(true)
    const data = new FormData()
    staged.forEach((s) => data.append("photos", s.file))

    try {
      const response = await addStudioPhotos(id, data)
      const updated = response?.data?.studio || response?.studio || response?.data || response
      const gallery = updated?.photos || updated?.galleryImages
      if (Array.isArray(gallery)) setPhotos(gallery)
      staged.forEach((s) => URL.revokeObjectURL(s.url))
      setStaged([])
      toast.success("Photos uploaded.")
    } catch (err) {
      toast.error(err?.response?.data?.message || "The photos didn't upload.")
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = async (photoId) => {
    setDeletingPhotoId(photoId)
    try {
      await deleteStudioPhoto(
        id,
        photoId,
        (message, updated) => {
          setPhotos(
            Array.isArray(updated?.photos)
              ? updated.photos
              : photos.filter((p) => p._id !== photoId),
          )
          toast.success(message || "Photo deleted.")
          setDeletingPhotoId(null)
        },
        (message) => {
          toast.error(message || "The photo couldn't be deleted.")
          setDeletingPhotoId(null)
        },
      )
    } catch {
      toast.error("The photo couldn't be deleted.")
      setDeletingPhotoId(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (Number(form.price) <= 0) return toast.error("Set a price above zero.")

    setSaving(true)
    const data = new FormData()
    data.append("name", form.name)
    data.append("location", form.location)
    data.append("description", form.description)
    data.append("price", form.price)
    data.append("services", JSON.stringify(form.services))
    if (image) data.append("image", image)

    try {
      await updateStudio(
        id,
        data,
        (message) => {
          toast.success(message || `${form.name} was updated.`)
          navigate("/admin-studios")
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
          <span className="text-[14px]">Loading the studio…</span>
        </div>
      </div>
    )
  }

  return (
    <FormPage
      backTo="/admin-studios"
      backLabel="Back to studios"
      eyebrow="Studios"
      title={`Edit ${form.name || "studio"}`}
      description="Changes go live on the customer site as soon as you save."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Field id="name" label="Studio name" required>
          <input id="name" name="name" value={form.name} onChange={change} className="field" required />
        </Field>

        <Row>
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

        <CheckboxGroup
          label="Services offered"
          options={SERVICES}
          value={form.services}
          onChange={(services) => setForm((prev) => ({ ...prev, services }))}
          hint="Customers filter on these."
        />

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
          onCancel={() => navigate("/admin-studios")}
          cancelLabel="Discard changes"
          submitLabel="Save changes"
          busyLabel="Saving…"
          busy={saving}
        />
      </form>
    </FormPage>
  )
}

export default EditStudio
