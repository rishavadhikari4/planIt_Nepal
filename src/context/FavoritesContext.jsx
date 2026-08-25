import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { AuthContext } from './AuthContext'
import { getFavoriteIds, toggleFavorite as toggleOnServer } from '../services/users'

/*
 * The shortlist, held once for the whole app.
 *
 * The heart on a listing used to be local component state: it lit up, nothing
 * recorded it, and it went out again the moment you navigated. Holding the set
 * of ids here means a card knows whether it is shortlisted without asking the
 * server per card, and the answer survives moving between pages.
 *
 * The toggle is optimistic — the heart fills on the click, not on the reply —
 * and rolls back if the server disagrees. Anything else feels broken on a
 * phone connection.
 */

const FavoritesContext = createContext({
  ids: new Set(),
  isFavorite: () => false,
  toggle: async () => {},
  count: 0,
  loading: false,
})

export const useFavorites = () => useContext(FavoritesContext)

const key = (itemType, itemId) => `${itemType}:${itemId}`

export const FavoritesProvider = ({ children }) => {
  const { isAuthenticated, isCustomer } = useContext(AuthContext)
  const [ids, setIds] = useState(() => new Set())
  const [loading, setLoading] = useState(false)

  // A shortlist belongs to an account, so it is loaded on sign-in and dropped
  // on sign-out rather than lingering for the next person at the machine.
  useEffect(() => {
    if (!isAuthenticated || !isCustomer) {
      setIds(new Set())
      return
    }
    let live = true
    setLoading(true)
    getFavoriteIds()
      .then((set) => live && setIds(set))
      .catch(() => {})
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [isAuthenticated, isCustomer])

  const isFavorite = useCallback((itemType, itemId) => ids.has(key(itemType, itemId)), [ids])

  const toggle = useCallback(
    async (itemType, itemId, name) => {
      if (!isAuthenticated || !isCustomer) {
        toast.info('Log in to keep a shortlist.')
        return false
      }

      const id = key(itemType, itemId)
      const wasFavorite = ids.has(id)

      setIds((current) => {
        const next = new Set(current)
        if (wasFavorite) next.delete(id)
        else next.add(id)
        return next
      })

      try {
        const result = await toggleOnServer(itemType, itemId)
        // Settle on the server's answer rather than assuming our flip was right.
        setIds((current) => {
          const next = new Set(current)
          if (result.favorited) next.add(id)
          else next.delete(id)
          return next
        })
        if (result.favorited && name) toast.success(`${name} added to your shortlist`)
        return result.favorited
      } catch (error) {
        setIds((current) => {
          const next = new Set(current)
          if (wasFavorite) next.add(id)
          else next.delete(id)
          return next
        })
        toast.error(error.response?.data?.message || "That didn't save. Try again.")
        return wasFavorite
      }
    },
    [ids, isAuthenticated, isCustomer],
  )

  const value = useMemo(
    () => ({ ids, isFavorite, toggle, count: ids.size, loading }),
    [ids, isFavorite, toggle, loading],
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export default FavoritesContext
