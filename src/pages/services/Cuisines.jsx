import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Heart, Minus, Plus, ShoppingBag, Star } from "lucide-react"
import { toast } from "react-toastify"
import { getAllCuisines } from "../../services/cuisines"
import { useCart } from "../../context/CartContext"
import {
  CatalogHeader,
  CatalogToolbar,
  RangeFilter,
  CardSkeleton,
  EmptyState,
  Pagination,
  rs,
} from "../../components/ui/Catalog"

const SORTS = [
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
]

const PER_PAGE = 12

const Cuisines = () => {
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [cuisines, setCuisines] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [searching, setSearching] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [price, setPrice] = useState({ min: "", max: "" })
  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState("name-asc")

  // The menu is built up before anything is committed to the cart, so the page
  // holds a selection of its own: dish id -> quantity.
  const [selection, setSelection] = useState({})
  const [favorites, setFavorites] = useState(new Set())

  const initialised = useRef(false)
  const [sortField, sortOrder] = sort.split("-")
  const hasFilters = Boolean(searchTerm.trim() || price.min || price.max || category !== "all")

  /* Everything goes through getAllCuisines: it is the only cuisine endpoint
     that filters by dish name and price and paginates. The /search endpoint
     takes a `query` and returns every matching category unpaginated, which is
     not what this screen needs. Category is narrowed client-side, since the
     response is already grouped by category. */
  const load = async (nextPage = 1, useFilters = hasFilters) => {
    setLoading(true)
    try {
      const response = await getAllCuisines({
        page: nextPage,
        limit: PER_PAGE,
        sortField,
        sortOrder,
        ...(useFilters && searchTerm.trim() && { dishName: searchTerm.trim() }),
        ...(useFilters && price.min && { minPrice: price.min }),
        ...(useFilters && price.max && { maxPrice: price.max }),
      })

      setCuisines(response.cuisines || [])
      setPagination(response.pagination || {})
      setPage(nextPage)
      setSearching(useFilters)
    } catch {
      toast.error("We couldn't load the menu. Please try again.")
      setCuisines([])
      setPagination({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!initialised.current) {
      initialised.current = true
      load(1)
      return
    }
    load(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort])

  const clear = () => {
    setSearchTerm("")
    setPrice({ min: "", max: "" })
    setCategory("all")
    load(1, false)
  }

  const changePage = (n) => {
    load(n)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const toggleDish = (dishId) =>
    setSelection((prev) => {
      if (prev[dishId]) {
        const { [dishId]: _removed, ...rest } = prev
        return rest
      }
      return { ...prev, [dishId]: 1 }
    })

  const setQuantity = (dishId, next) =>
    setSelection((prev) => ({ ...prev, [dishId]: Math.max(1, next) }))

  const toggleFavorite = (dishId) =>
    setFavorites((prev) => {
      const next = new Set(prev)
      next.has(dishId) ? next.delete(dishId) : next.add(dishId)
      return next
    })

  /* Everything currently selected, flattened out of its category. */
  const selectedDishes = cuisines
    .flatMap((c) => c.dishes || [])
    .filter((d) => selection[d._id])

  const plates = Object.values(selection).reduce((sum, q) => sum + q, 0)
  const subtotal = selectedDishes.reduce((sum, d) => sum + (d.price || 0) * selection[d._id], 0)

  const addSelectionToCart = () => {
    if (!localStorage.getItem("accessToken")) {
      toast.info("Log in to add dishes to your cart.")
      return navigate("/login")
    }
    if (selectedDishes.length === 0) return

    selectedDishes.forEach((dish) =>
      addToCart({ ...dish, type: "dish", quantity: selection[dish._id] }),
    )
    const count = selectedDishes.length
    setSelection({})
    toast.success(`Added ${count} ${count === 1 ? "dish" : "dishes"} to your cart.`)
  }

  const categories = ["all", ...new Set(cuisines.map((c) => c.category).filter(Boolean))]
  const withDishes = cuisines
    .filter((c) => c.dishes?.length > 0)
    .filter((c) => category === "all" || c.category === category)
  const visibleDishes = withDishes.reduce((n, c) => n + c.dishes.length, 0)

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-7xl px-5 py-10 pb-32 sm:px-6 sm:py-14 sm:pb-32 lg:px-8">
        <CatalogHeader
          step="02"
          title="Catering"
          blurb="Build the menu dish by dish. Everything is priced per plate, so the total moves with your headcount."
          count={
            category === "all"
              ? (pagination?.totalDishesAcrossAllCuisines ?? visibleDishes)
              : visibleDishes
          }
          countLabel="dishes"
          searching={searching}
        />

        <CatalogToolbar
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onSearch={() => load(1)}
          placeholder="Search dishes by name or ingredient"
          sortValue={sort}
          onSortChange={setSort}
          sortOptions={SORTS}
          onClear={clear}
          hasFilters={hasFilters}
        >
          {categories.length > 1 && (
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Category"
              className="field w-auto cursor-pointer pr-8 capitalize"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All categories" : c}
                </option>
              ))}
            </select>
          )}
          <RangeFilter label="Price" value={price} onChange={setPrice} />
        </CatalogToolbar>

        <div className="mt-10">
          {loading ? (
            <CardSkeleton />
          ) : withDishes.length === 0 ? (
            <EmptyState
              title="No dishes match that"
              body={
                searching || category !== "all"
                  ? "Try a wider price range or a different category."
                  : "There are no dishes on the menu right now. Check back shortly."
              }
              action={searching || category !== "all" ? "Clear the filters" : undefined}
              onAction={clear}
            />
          ) : (
            <div className="space-y-16">
              {withDishes.map((cuisine) => (
                <section key={cuisine._id || cuisine.category}>
                  <div className="flex items-baseline justify-between border-b border-line pb-3">
                    <h2 className="t-title capitalize">{cuisine.category}</h2>
                    <span className="amount t-caption text-ink-mute">
                      {cuisine.dishes.length} {cuisine.dishes.length === 1 ? "dish" : "dishes"}
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-4">
                    {cuisine.dishes.map((dish) => {
                      const chosen = Boolean(selection[dish._id])
                      const qty = selection[dish._id] || 1
                      return (
                        <motion.article
                          key={dish._id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.15 }}
                          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                          className={`card group relative flex flex-col overflow-hidden transition-colors ${
                            chosen ? "border-crimson" : "hover:border-line-strong"
                          }`}
                        >
                          <div className="relative aspect-square overflow-hidden bg-gray-100">
                            <img
                              src={dish.dishImage || dish.image || "/placeholder.svg"}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
                            />
                            {chosen && (
                              <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded bg-crimson px-1.5 py-0.5 t-caption font-semibold text-white">
                                <Check className="h-3 w-3" strokeWidth={3} />
                                On the menu
                              </span>
                            )}
                            {dish.rating && (
                              <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded bg-crimson-deep/85 px-1.5 py-0.5 t-caption font-semibold text-white">
                                <Star className="h-3 w-3 fill-brass text-brass" />
                                <span className="amount">{dish.rating}</span>
                              </span>
                            )}
                            <button
                              onClick={() => toggleFavorite(dish._id)}
                              aria-pressed={favorites.has(dish._id)}
                              aria-label={
                                favorites.has(dish._id)
                                  ? `Remove ${dish.name} from your shortlist`
                                  : `Add ${dish.name} to your shortlist`
                              }
                              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 text-ink-soft transition-colors hover:text-red-600"
                            >
                              <Heart
                                className={`h-4 w-4 ${
                                  favorites.has(dish._id) ? "fill-red-600 text-red-600" : ""
                                }`}
                                strokeWidth={1.75}
                              />
                            </button>
                          </div>

                          <div className="flex flex-1 flex-col p-4">
                            <h3 className="line-clamp-2 t-body font-semibold leading-snug text-ink">
                              {dish.name}
                            </h3>
                            {dish.description && (
                              <p className="mt-1.5 line-clamp-2 t-small leading-relaxed text-ink-mute">
                                {dish.description}
                              </p>
                            )}

                            <p className="mt-3">
                              <span className="amount t-lead font-semibold text-ink">
                                {dish.price ? rs(dish.price) : "On request"}
                              </span>
                              <span className="ml-1 t-caption text-ink-mute">per plate</span>
                            </p>

                            <div className="mt-auto pt-4">
                              {chosen ? (
                                <div className="flex items-center justify-between rounded-md border border-line bg-crimson-50 p-1">
                                  <button
                                    onClick={() => setQuantity(dish._id, qty - 1)}
                                    disabled={qty <= 1}
                                    aria-label={`Fewer plates of ${dish.name}`}
                                    className="flex h-8 w-8 items-center justify-center rounded text-ink-soft hover:bg-surface disabled:opacity-35"
                                  >
                                    <Minus className="h-3.5 w-3.5" strokeWidth={2} />
                                  </button>
                                  <span className="amount t-small font-semibold text-ink">
                                    {qty} <span className="t-caption font-normal text-ink-mute">plates</span>
                                  </span>
                                  <button
                                    onClick={() => setQuantity(dish._id, qty + 1)}
                                    aria-label={`More plates of ${dish.name}`}
                                    className="flex h-8 w-8 items-center justify-center rounded text-ink-soft hover:bg-surface"
                                  >
                                    <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => toggleDish(dish._id)}
                                  className="btn btn-ghost w-full py-2.5 t-small"
                                >
                                  <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                                  Add to menu
                                </button>
                              )}

                              {chosen && (
                                <button
                                  onClick={() => toggleDish(dish._id)}
                                  className="mt-2 w-full t-caption text-ink-mute hover:text-red-600"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.article>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        <Pagination page={page} totalPages={pagination?.totalPages} onChange={changePage} />
      </div>

      {/* The menu you are building, always visible once it has something in it. */}
      <AnimatePresence>
        {selectedDishes.length > 0 && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface"
          >
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4 sm:px-6 lg:px-8">
              <div className="min-w-0">
                <p className="t-small text-ink-soft">
                  <span className="amount font-semibold text-ink">{selectedDishes.length}</span>{" "}
                  {selectedDishes.length === 1 ? "dish" : "dishes"} ·{" "}
                  <span className="amount font-semibold text-ink">{plates}</span> plates
                </p>
                <p className="amount t-heading font-semibold text-ink">{rs(subtotal)}</p>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <button onClick={() => setSelection({})} className="btn btn-quiet">
                  Clear
                </button>
                <button onClick={addSelectionToCart} className="btn btn-accent">
                  <ShoppingBag className="h-4 w-4" strokeWidth={2} />
                  Add to cart
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Cuisines
