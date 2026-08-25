import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { addVenue } from "../../services/venues"
import { FormPage, Field, Row, FormActions, ImagePicker } from "../ui/FormKit"

const AddVenue = () => {
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
  const [saving, setSaving] = useState(false)

  const change = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!image) return toast.error("Add a photo — customers won't book a venue they can't see.")
    if (Number(form.price) <= 0) return toast.error("Set a price above zero.")
    if (Number(form.capacity) <= 0) return toast.error("Set a capacity above zero.")

    setSaving(true)
    const data = new FormData()
    Object.entries(form).forEach(([key, value]) => data.append(key, value))
    data.append("image", image)

    try {
      await addVenue(
        data,
        (message) => {
          toast.success(message || `${form.name} is now listed.`)
          navigate("/admin-venues")
        },
        (message) => toast.error(message || "The venue couldn't be saved."),
      )
    } catch {
      toast.error("Something went wrong. The venue wasn't saved.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <FormPage
      backTo="/admin-venues"
      backLabel="Back to venues"
      eyebrow="Venues"
      title="Add a venue"
      description="Everything here is what customers see on the site."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Field id="name" label="Venue name" required>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={change}
            placeholder="Hyatt Regency Lawn"
            className="field"
            required
          />
        </Field>

        <Field id="location" label="Location" required hint="The area customers would search for.">
          <input
            id="location"
            name="location"
            value={form.location}
            onChange={change}
            placeholder="Boudha, Kathmandu"
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
              placeholder="250"
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
              placeholder="80000"
              className="field amount"
              required
            />
          </Field>
        </Row>

        <Field
          id="description"
          label="Description"
          required
          hint="What makes it worth booking — the space, the setting, what's included."
        >
          <textarea
            id="description"
            name="description"
            rows={5}
            value={form.description}
            onChange={change}
            placeholder="A covered garden lawn with its own kitchen access and parking for 40 cars."
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
            setPreview(url)
          }}
          hint="This is the photo customers see in the catalogue."
        />

        <FormActions
          onCancel={() => navigate("/admin-venues")}
          submitLabel="Add venue"
          busyLabel="Saving…"
          busy={saving}
        />
      </form>
    </FormPage>
  )
}

export default AddVenue
