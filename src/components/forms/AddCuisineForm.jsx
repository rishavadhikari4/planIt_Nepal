import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { addDish, getAllCuisines } from "../../services/cuisines"
import { FormPage, Field, Row, FormActions, ImagePicker } from "../ui/FormKit"

const NEW_CATEGORY = "__new__"

const AddCuisineForm = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ category: "", name: "", price: "", description: "" })
  const [categories, setCategories] = useState([])
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let live = true
    getAllCuisines({ limit: 500 })
      .then((response) => {
        if (!live) return
        const names = [...new Set((response.cuisines || []).map((c) => c.category).filter(Boolean))]
        setCategories(names)
        // With no categories yet, the only option is to create one.
        if (names.length === 0) setCreatingCategory(true)
      })
      .catch(() => live && toast.error("The categories didn't load."))
    return () => {
      live = false
    }
  }, [])

  const change = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const pickCategory = (value) => {
    if (value === NEW_CATEGORY) {
      setCreatingCategory(true)
      setForm((prev) => ({ ...prev, category: "" }))
    } else {
      setCreatingCategory(false)
      setForm((prev) => ({ ...prev, category: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.category.trim()) return toast.error("Pick a category, or create one.")
    if (!image) return toast.error("Add a photo of the dish.")
    if (Number(form.price) <= 0) return toast.error("Set a price above zero.")

    setSaving(true)
    const data = new FormData()
    data.append("name", form.name)
    data.append("price", form.price)
    data.append("description", form.description)
    data.append("image", image)

    try {
      await addDish(
        form.category.trim(),
        data,
        (message) => {
          toast.success(message || `${form.name} was added to ${form.category}.`)
          navigate("/admin-cuisines")
        },
        (message) => toast.error(message || "The dish couldn't be saved."),
      )
    } catch {
      toast.error("Something went wrong. The dish wasn't saved.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <FormPage
      backTo="/admin-cuisines"
      backLabel="Back to catering"
      eyebrow="Catering"
      title="Add a dish"
      description="Dishes live inside a category. Prices are per plate."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Field
          id="category"
          label="Category"
          required
          hint={
            creatingCategory
              ? "A new category appears on the customer menu as soon as it has a dish."
              : "Pick where this dish belongs on the menu."
          }
        >
          {creatingCategory ? (
            <div className="flex gap-2">
              <input
                id="category"
                name="category"
                value={form.category}
                onChange={change}
                placeholder="Newari khaja set"
                className="field"
                required
                autoFocus
              />
              {categories.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setCreatingCategory(false)
                    setForm((prev) => ({ ...prev, category: "" }))
                  }}
                  className="btn btn-ghost shrink-0"
                >
                  Cancel
                </button>
              )}
            </div>
          ) : (
            <select
              id="category"
              value={form.category}
              onChange={(e) => pickCategory(e.target.value)}
              className="field cursor-pointer"
              required
            >
              <option value="">Choose a category</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value={NEW_CATEGORY}>+ Create a new category</option>
            </select>
          )}
        </Field>

        <Row>
          <Field id="name" label="Dish name" required>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={change}
              placeholder="Chatamari"
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
              placeholder="350"
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
            placeholder="Rice-flour crepe topped with minced buff, egg and coriander. Served hot."
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
            setPreview(url)
          }}
          hint="Shot on a plate, close up — it sells the dish."
        />

        <FormActions
          onCancel={() => navigate("/admin-cuisines")}
          submitLabel="Add dish"
          busyLabel="Saving…"
          busy={saving}
        />
      </form>
    </FormPage>
  )
}

export default AddCuisineForm
