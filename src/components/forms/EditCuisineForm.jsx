import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { getDishById, updateDish } from "../../services/cuisines"
import { FormPage, Field, Row, FormActions, ImagePicker } from "../ui/FormKit"

const EditCuisines = () => {
  const { categoryId, dishId } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: "", description: "", price: "" })
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let live = true
    getDishById(dishId)
      .then((data) => {
        const dish = data?.dish
        if (!dish) throw new Error("not found")
        if (!live) return
        setForm({
          name: dish.name || "",
          description: dish.description || "",
          price: dish.price || "",
        })
        setPreview(dish.dishImage || dish.image || null)
      })
      .catch(() => {
        if (!live) return
        toast.error("That dish couldn't be loaded.")
        navigate("/admin-cuisines")
      })
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dishId])

  const change = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (Number(form.price) <= 0) return toast.error("Set a price above zero.")

    setSaving(true)
    const data = new FormData()
    data.append("name", form.name)
    data.append("description", form.description)
    data.append("price", form.price)
    if (image) data.append("image", image)

    try {
      await updateDish(
        categoryId,
        dishId,
        data,
        (message) => {
          toast.success(message || `${form.name} was updated.`)
          navigate("/admin-cuisines")
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
          <span className="t-small">Loading the dish…</span>
        </div>
      </div>
    )
  }

  return (
    <FormPage
      backTo="/admin-cuisines"
      backLabel="Back to catering"
      eyebrow="Catering"
      title={`Edit ${form.name || "dish"}`}
      description="Changes go live on the customer menu as soon as you save."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Row>
          <Field id="name" label="Dish name" required>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={change}
              className="field"
              required
            />
          </Field>

          <Field id="price" label="Price per plate" required hint="In rupees.">
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

        <Field id="description" label="Description" required hint="What's in it, and how it's served.">
          <textarea
            id="description"
            name="description"
            rows={4}
            value={form.description}
            onChange={change}
            className="field resize-y"
            required
          />
        </Field>

        <ImagePicker
          label="Dish photo"
          required
          value={image}
          preview={preview}
          onChange={(file, url) => {
            setImage(file)
            setPreview(url || null)
          }}
          hint="Leave it as is to keep the current photo."
        />

        <FormActions
          onCancel={() => navigate("/admin-cuisines")}
          cancelLabel="Discard changes"
          submitLabel="Save changes"
          busyLabel="Saving…"
          busy={saving}
        />
      </form>
    </FormPage>
  )
}

export default EditCuisines
