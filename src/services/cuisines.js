import API from './api';

export const getAllCuisines = async (options = {}) => {
  try {
    const params = new URLSearchParams();

    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);

    if (options.sortField) params.append('sortField', options.sortField);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);

    if (options.minPrice) params.append('minPrice', options.minPrice);
    if (options.maxPrice) params.append('maxPrice', options.maxPrice);

    if (options.dishName) params.append('dishName', options.dishName);
    
    const queryString = params.toString();
    const url = queryString ? `/api/cuisines?${queryString}` : '/api/cuisines';
    
    const response = await API.get(url);
    
    return {
      cuisines: response.data.data.cuisines || [],
      pagination: response.data.data.overallPagination || {},
      success: response.data.success
    };
  } catch (error) {
    console.error('Error fetching cuisines:', error);
    return {
      cuisines: [],
      pagination: {},
      success: false
    };
  }
};

export const searchCuisines = async (searchOptions = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (searchOptions.query) params.append('query', searchOptions.query);
    if (searchOptions.limit) params.append('limit', searchOptions.limit);

    const response = await API.get(`/api/cuisines/search?${params.toString()}`);
    
    if (response.data.success) {
      return {
        cuisines: response.data.data.results || [],
        searchQuery: response.data.data.searchQuery,
        totalResults: response.data.data.totalResults
      };
    } else {
      throw new Error(response.data.message || "Failed to search cuisines");
    }
  } catch (error) {
    console.error("Error searching cuisines:", error);
    throw error;
  }
};

export const getDishesForCategory = async (category) => {
  try {
    const response = await API.get(`/api/cuisines/${category}`);
    
    return response.data.data.dishes || [];
  } catch (error) {
    console.error('Error fetching dishes for category:', error);
    return [];
  }
};

export const getDishById = async (dishId) => {
  try {
    const response = await API.get(`/api/cuisines/dishes/${dishId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching dish by ID:', error);
    return null;
  }
};

export const addDish = async (category, formData, onSuccess, onError) => {
  try {
    const response = await API.post(`/api/cuisines/categories/${category}/dishes`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (onSuccess) onSuccess(response.data.message, response.data.data.dish, response.data.data.category);
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to add dish';
    if (onError) onError(message);
  }
};

export const updateDish = async (categoryId, dishId, formData, onSuccess, onError) => {
  try {
    const response = await API.patch(
      `/api/cuisines/${categoryId}/dishes/${dishId}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    if (onSuccess) onSuccess(response.data.message);
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update dish';
    if (onError) onError(message);
  }
};

export const deleteDish = async (categoryId, dishId, onSuccess, onError) => {
  try {
    const response = await API.delete(`/api/cuisines/${categoryId}/dishes/${dishId}`);
    if (onSuccess) {
      onSuccess(response.data.message, response.data.data?.category);
    }
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to delete dish';
    if (onError) onError(message);
  }
};

export const deleteCuisine = async (categoryId, onSuccess, onError) => {
  try {
    const response = await API.delete(`/api/cuisines/${categoryId}`);
    if (onSuccess) onSuccess(response.data.message, response.data.data);
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to delete category';
    if (onError) onError(message);
  }
};

