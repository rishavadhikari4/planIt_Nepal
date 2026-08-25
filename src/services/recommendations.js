import API from './api';

export const getWeddingPackageRecommendation = async (params) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.totalBudget) queryParams.append('totalBudget', params.totalBudget);
    if (params.venueBudget) queryParams.append('venueBudget', params.venueBudget);
    if (params.studioBudget) queryParams.append('studioBudget', params.studioBudget);
    if (params.foodBudget) queryParams.append('foodBudget', params.foodBudget);
    if (params.location) queryParams.append('location', params.location);
    if (params.guestCount) queryParams.append('guestCount', params.guestCount);
    if (params.preferredServices) queryParams.append('preferredServices', params.preferredServices);

    const response = await API.get(`/api/recommend/wedding-package?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching wedding package recommendation:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch recommendations');
  }
};
/** The six occasions this company runs, and what each one implies. */
export const getOccasions = async () => {
  const response = await API.get("/api/recommend/occasions");
  return response.data.data.occasions;
};

/**
 * One budget and a headcount, for any occasion — rather than the three
 * separate budgets the wedding-only planner asked people to invent.
 */
export const getOccasionPackage = async ({ occasion, budget, guests, location, skipStudio }) => {
  const params = new URLSearchParams({ occasion, budget, guests });
  if (location) params.append("location", location);
  if (skipStudio) params.append("skipStudio", "true");
  const response = await API.get(`/api/recommend/package?${params}`);
  return response.data.data;
};
