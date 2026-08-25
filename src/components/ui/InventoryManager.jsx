import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"
import { toast } from "react-toastify"
import {
  AdminPage,
  AdminHeading,
  AdminToolbar,
  FilterSelect,
  Table,
  Td,
  TableSkeleton,
  AdminEmpty,
  AdminError,
  ConfirmDialog,
  rs,
  formatDate,
} from "./Admin"
import { Pagination } from "./Catalog"

/*
 * Venues and studios are the same management screen with different nouns:
 * a searchable, sortable, paginated list with edit and delete per row and one
 * "add" action. This holds that screen once; each page supplies its vocabulary
 * and its service functions.
 */

const SORTS = [
  { value: "createdAt-desc", label: "Newest first" },
  { value: "createdAt-asc", label: "Oldest first" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "price-asc", label: "Price: low to high" },
]

const PER_PAGE = 10

const InventoryManager = ({
  noun, // "venue"
  nounPlural, // "venues"
  title,
  description,
  addPath,
  editPath, // (id) => path
  imageKey, // "venueImage"
  countKey, // "totalVenues"
  listKey, // "venues"
  fetchAll,
  remove,
  extraColumn, // { label, render(item) }
}) => {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("createdAt-desc")
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [sortField, sortOrder] = sort.split("-")

  const load = async (nextPage = page, term = search) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetchAll({
        page: nextPage,
        limit: PER_PAGE,
        sortField,
        sortOrder,
        ...(term.trim() && { name: term.trim() }),
      })
      setItems(response[listKey] || [])
      setPagination(response.pagination || {})
      setPage(nextPage)
    } catch {
      setError(`The ${nounPlural} didn't load.`)
      setItems([])
      setPagination({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(1, search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort])

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      const result = await remove(pendingDelete._id)
      if (result?.success === false) throw new Error(result.message)
      toast.success(`${pendingDelete.name} was deleted.`)
      setPendingDelete(null)
      // Step back a page if the last row on this page just went away.
      load(items.length === 1 && page > 1 ? page - 1 : page)
    } catch (err) {
      toast.error(err.message || `The ${noun} couldn't be deleted.`)
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    noun === "venue" ? "Venue" : "Studio",
    "Location",
    ...(extraColumn ? [extraColumn.label] : []),
    { label: "Price", align: "right" },
    "Added",
    { label: "", align: "right" },
  ]

  return (
    <AdminPage>
      <AdminHeading
        eyebrow="Staff"
        title={title}
        description={description}
        count={pagination?.[countKey] ?? items.length}
        countLabel={nounPlural}
      >
        <button onClick={() => navigate(addPath)} className="btn btn-accent">
          <Plus className="h-4 w-4" strokeWidth={2} />
          Add {noun}
        </button>
      </AdminHeading>

      <AdminToolbar
        search={search}
        onSearch={setSearch}
        placeholder={`Search ${nounPlural} by name`}
      >
        <button onClick={() => load(1, search)} className="btn btn-primary">
          Search
        </button>
        <FilterSelect value={sort} onChange={setSort} options={SORTS} label="Sort" />
      </AdminToolbar>

      {error ? (
        <AdminError message={error} onRetry={() => load(page)} />
      ) : !loading && items.length === 0 ? (
        <AdminEmpty
          title={search ? `No ${nounPlural} match that` : `No ${nounPlural} yet`}
          body={
            search
              ? "Try a different name, or clear the search to see everything."
              : `Add your first ${noun} and it will appear here and on the customer site.`
          }
          action={search ? "Clear the search" : `Add ${noun}`}
          onAction={() => {
            if (search) {
              setSearch("")
              load(1, "")
            } else {
              navigate(addPath)
            }
          }}
        />
      ) : (
        <>
          <Table head={columns}>
            {loading ? (
              <TableSkeleton columns={columns.length} />
            ) : (
              items.map((item) => (
                <tr key={item._id} className="transition-colors hover:bg-gray-50">
                  <Td>
                    <div className="flex items-center gap-3">
                      <img
                        src={item[imageKey] || "/placeholder.svg"}
                        alt=""
                        loading="lazy"
                        className="h-11 w-11 shrink-0 rounded-md border border-line object-cover"
                      />
                      <span className="min-w-0">
                        <span className="block max-w-[24ch] truncate font-medium">{item.name}</span>
                        {item.rating && (
                          <span className="amount block t-caption text-ink-mute">
                            {item.rating} rating
                          </span>
                        )}
                      </span>
                    </div>
                  </Td>

                  <Td className="max-w-[20ch] truncate text-ink-soft">{item.location || "—"}</Td>

                  {extraColumn && <Td className="text-ink-soft">{extraColumn.render(item)}</Td>}

                  <Td align="right" className="amount font-semibold whitespace-nowrap">
                    {item.price ? rs(item.price) : "On request"}
                  </Td>

                  <Td className="amount whitespace-nowrap text-ink-soft">
                    {formatDate(item.createdAt)}
                  </Td>

                  <Td align="right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => navigate(editPath(item._id))}
                        className="t-small font-medium text-crimson hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setPendingDelete(item)}
                        className="t-small font-medium text-ink-mute hover:text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </Table>

          <Pagination
            page={page}
            totalPages={pagination?.totalPages}
            onChange={(n) => {
              load(n)
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
          />
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        busy={deleting}
        title={`Delete ${pendingDelete?.name || `this ${noun}`}?`}
        body={`This removes the ${noun} from the customer site permanently. Existing orders that already booked it are not changed. This cannot be undone.`}
        confirmLabel={`Delete ${noun}`}
      />
    </AdminPage>
  )
}

export default InventoryManager
