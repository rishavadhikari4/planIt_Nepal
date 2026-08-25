import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"
import { toast } from "react-toastify"
import { getAllCuisines, deleteDish, deleteCuisine } from "../../services/cuisines"
import {
  AdminPage,
  AdminHeading,
  AdminToolbar,
  FilterSelect,
  AdminEmpty,
  AdminError,
  ConfirmDialog,
  rs,
} from "../../components/ui/Admin"

/* Catering is the one inventory that is two levels deep — categories hold
   dishes — so it keeps its own screen rather than using the shared
   InventoryManager that venues and studios share. */

const AdminCuisines = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [pending, setPending] = useState(null) // { kind: 'dish' | 'category', ... }
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getAllCuisines({ limit: 500 })
      setCategories(response.cuisines || [])
    } catch {
      setError("The menu didn't load.")
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const removeDish = (categoryId, dishId) =>
    setCategories((list) =>
      list.map((c) =>
        c._id === categoryId ? { ...c, dishes: (c.dishes || []).filter((d) => d._id !== dishId) } : c,
      ),
    )

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      if (pending.kind === "dish") {
        await deleteDish(
          pending.categoryId,
          pending.dish._id,
          (message, updatedCategory) => {
            if (updatedCategory) {
              setCategories((list) =>
                list.map((c) => (c._id === pending.categoryId ? updatedCategory : c)),
              )
            } else {
              removeDish(pending.categoryId, pending.dish._id)
            }
            toast.success(message || `${pending.dish.name} was removed from the menu.`)
          },
          (message) => toast.error(message || "The dish couldn't be deleted."),
        )
      } else {
        await deleteCuisine(
          pending.category._id,
          (message) => {
            setCategories((list) => list.filter((c) => c._id !== pending.category._id))
            toast.success(message || `The ${pending.category.category} category was deleted.`)
          },
          (message) => toast.error(message || "The category couldn't be deleted."),
        )
      }
      setPending(null)
    } catch {
      toast.error("Something went wrong. Nothing was deleted.")
    } finally {
      setDeleting(false)
    }
  }

  const term = search.trim().toLowerCase()
  const categoryNames = ["all", ...new Set(categories.map((c) => c.category).filter(Boolean))]

  const visible = categories
    .filter((c) => category === "all" || c.category === category)
    .map((c) => ({
      ...c,
      dishes: (c.dishes || []).filter(
        (d) =>
          !term ||
          d.name?.toLowerCase().includes(term) ||
          d.description?.toLowerCase().includes(term),
      ),
    }))
    .filter((c) => c.dishes.length > 0 || (!term && category !== "all"))

  const totalDishes = categories.reduce((n, c) => n + (c.dishes?.length || 0), 0)

  return (
    <AdminPage>
      <AdminHeading
        eyebrow="Staff"
        title="Catering"
        description="Dishes grouped by category. Prices here are per plate, and are what customers see."
        count={totalDishes}
        countLabel={`dishes across ${categories.length} ${categories.length === 1 ? "category" : "categories"}`}
      >
        <button onClick={() => navigate("/admin-cuisines/add")} className="btn btn-accent">
          <Plus className="h-4 w-4" strokeWidth={2} />
          Add dish
        </button>
      </AdminHeading>

      <AdminToolbar search={search} onSearch={setSearch} placeholder="Search dishes by name or description">
        <FilterSelect
          value={category}
          onChange={setCategory}
          options={categoryNames}
          label="Categories"
        />
      </AdminToolbar>

      {error ? (
        <AdminError message={error} onRetry={load} />
      ) : loading ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card overflow-hidden" aria-hidden>
              <div className="aspect-square animate-pulse bg-gray-100" />
              <div className="space-y-2.5 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <AdminEmpty
          title={totalDishes === 0 ? "No dishes yet" : "Nothing matches that"}
          body={
            totalDishes === 0
              ? "Add your first dish and it will appear here and in the customer catering catalogue."
              : "Try a different search, or pick another category."
          }
          action={totalDishes === 0 ? "Add dish" : "Clear filters"}
          onAction={() => {
            if (totalDishes === 0) navigate("/admin-cuisines/add")
            else {
              setSearch("")
              setCategory("all")
            }
          }}
        />
      ) : (
        <div className="mt-8 space-y-12">
          {visible.map((cat) => (
            <section key={cat._id}>
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
                <div className="flex items-baseline gap-3">
                  <h2 className="text-[22px] capitalize">{cat.category}</h2>
                  <span className="amount text-[12.5px] text-ink-mute">
                    {cat.dishes.length} {cat.dishes.length === 1 ? "dish" : "dishes"}
                  </span>
                </div>
                <button
                  onClick={() => setPending({ kind: "category", category: cat })}
                  className="text-[13px] font-medium text-ink-mute hover:text-red-600 hover:underline"
                >
                  Delete category
                </button>
              </div>

              {cat.dishes.length === 0 ? (
                <p className="py-6 text-[14px] text-ink-mute">
                  This category has no dishes.
                </p>
              ) : (
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {cat.dishes.map((dish) => (
                    <article key={dish._id} className="card flex flex-col overflow-hidden">
                      <div className="aspect-square overflow-hidden bg-gray-100">
                        <img
                          src={dish.dishImage || dish.image || "/placeholder.svg"}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex flex-1 flex-col p-4">
                        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink">
                          {dish.name}
                        </h3>
                        {dish.description && (
                          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink-mute">
                            {dish.description}
                          </p>
                        )}

                        <p className="amount mt-3 text-[16px] font-semibold text-ink">
                          {dish.price ? rs(dish.price) : "No price set"}
                          {dish.price && (
                            <span className="ml-1 text-[12px] font-normal text-ink-mute">
                              per plate
                            </span>
                          )}
                        </p>

                        <div className="mt-auto flex items-center gap-3 pt-4">
                          <button
                            onClick={() =>
                              navigate(`/admin-cuisines/edit/${cat._id}/${dish._id}`)
                            }
                            className="text-[13px] font-medium text-crimson hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              setPending({ kind: "dish", categoryId: cat._id, dish })
                            }
                            className="text-[13px] font-medium text-ink-mute hover:text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pending)}
        onCancel={() => setPending(null)}
        onConfirm={confirmDelete}
        busy={deleting}
        title={
          pending?.kind === "dish"
            ? `Delete ${pending.dish.name}?`
            : `Delete the ${pending?.category?.category} category?`
        }
        body={
          pending?.kind === "dish"
            ? "This removes the dish from the customer menu permanently. Orders that already include it are not changed."
            : `This deletes the category and all ${pending?.category?.dishes?.length || 0} dishes inside it, permanently. Orders that already include them are not changed.`
        }
        confirmLabel={pending?.kind === "dish" ? "Delete dish" : "Delete category"}
      />
    </AdminPage>
  )
}

export default AdminCuisines
