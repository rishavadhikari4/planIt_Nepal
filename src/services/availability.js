import API from './api'

/*
 * "What is free on the twelfth?"
 *
 * The first question anyone asks, and until now the site could only answer it
 * one listing at a time.
 */

/** Everything free across the whole catalogue in a date window. */
export const searchAvailability = async ({
  from,
  till,
  guests,
  maxPrice,
  location,
  type,
  limit,
} = {}) => {
  const params = new URLSearchParams({ from })
  if (till) params.append('till', till)
  if (guests) params.append('guests', guests)
  if (maxPrice) params.append('maxPrice', maxPrice)
  if (location) params.append('location', location)
  if (type) params.append('type', type)
  if (limit) params.append('limit', limit)

  const response = await API.get(`/api/availability?${params}`)
  return response.data.data
}

/** Staff: one month of everything held, keyed by day. */
export const getAvailabilityCalendar = async (month) => {
  const response = await API.get(`/api/availability/calendar?month=${month}`)
  return response.data.data
}
