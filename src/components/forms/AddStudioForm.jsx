import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { addStudio } from "../../services/studios"
import { FormPage, Field, Row, FormActions, ImagePicker, CheckboxGroup } from "../ui/FormKit"

// These strings have to match what the backend validates against.
const SERVICES = [
  "Wedding Photography",
  "Pre-wedding Shoot",
  "Video Recording",
  "Album Design",
  "Digital Copies",
  "Drone Photography",
]

const Addstudio = () => {
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
  const [saving, setSaving] = useState(false)

  const change = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!image) return toast.error("Add a photo — customers pick studios by their work.")
    if (Number(form.price) <= 0) return toast.error("Set a price above zero.")

    setSaving(true)
    const data = new FormData()
    data.append("name", form.name)
    data.append("location", form.location)
    data.append("description", form.description)
    data.append("price", form.price)
    data.append("services", JSON.stringify(form.services))
    data.append("image", image)

    try {
      await addStudio(
        data,
        (message) => {
          toast.success(message || `${form.name} is now listed.`)
          navigate("/admin-studios")
        },
        (message) => toast.error(message || "The studio couldn't be saved."),
      )
    } catch {
      toast.error("Something went wrong. The studio wasn't saved.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <FormPage
      backTo="/admin-studios"
      backLabel="Back to studios"
      eyebrow="Studios"
      title="Add a studio"
      description="Everything here is what customers see on the site."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Field id="name" label="Studio name" required>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={change}
            placeholder="Aperture Studio"
            className="field"
            required
          />
        </Field>

        <Row>
          <Field id="location" label="Location" required>
            <input
              id="location"
              name="location"
              value={form.location}
              onChange={change}
              placeholder="Lalitpur"
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
              placeholder="45000"
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
          hint="Customers filter on these, so pick everything this studio actually does."
        />

        <Field id="description" label="Description" required hint="Their style, team size, and what a booking includes.">
          <textarea
            id="description"
            name="description"
            rows={5}
            value={form.description}
            onChange={change}
            placeholder="A two-person team shooting documentary-style, with same-week edited previews."
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
          hint="Use a piece of their actual work, not a logo."
        />

        <FormActions
          onCancel={() => navigate("/admin-studios")}
          submitLabel="Add studio"
          busyLabel="Saving…"
          busy={saving}
        />
      </form>
    </FormPage>
  )
}

export default Addstudio
