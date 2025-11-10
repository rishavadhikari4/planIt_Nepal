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