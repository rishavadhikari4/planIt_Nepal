import API from './api';

export const getAllStudios = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    if (params.minPrice) queryParams.append('minPrice', params.minPrice);
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
    if (params.location) queryParams.append('location', params.location);
    if (params.service) queryParams.append('service', params.service);

    if (params.sortField) queryParams.append('sortField', params.sortField);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const url = queryString ? `/api/studios?${queryString}` : '/api/studios';
    
    const response = await API.get(url);

    if (response.data.success) {
      return {
        studios: response.data.data.studios || [],
        pagination: response.data.data.pagination || {}
      };
    } else {
      return {
        studios: [],
        pagination: {}
      };
    }
  } catch (error) {
    console.error('Error fetching studios:', error);
    return {
      studios: [],
      pagination: {}
    };
  }
};

export const searchStudios = async (searchOptions = {}) => {
  try {
    const params = new URLSearchParams();

    if (searchOptions.q) params.append('q', searchOptions.q);
    if (searchOptions.services) params.append('services', searchOptions.services);
    if (searchOptions.minPrice) params.append('minPrice', searchOptions.minPrice);
    if (searchOptions.maxPrice) params.append('maxPrice', searchOptions.maxPrice);
    if (searchOptions.location) params.append('location', searchOptions.location);
    if (searchOptions.page) params.append('page', searchOptions.page);
    if (searchOptions.limit) params.append('limit', searchOptions.limit);

    const response = await API.get(`/api/studios/search?${params.toString()}`);
    
    if (response.data.success) {
      return {
        studios: response.data.data.studios,
        pagination: response.data.data.pagination,
        searchQuery: response.data.data.searchQuery
      };
    } else {
      throw new Error(response.data.message || "Failed to search studios");
    }
  } catch (error) {
    console.error("Error searching studios:", error);
    throw error;
  }
};

export const getStudioById = async (id) => {
  try {
    const response = await API.get(`/api/studios/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching studio by ID:', error);
    throw error;
  }
};

export const addStudio = async (formData, onSuccess, onError) => {
  try {
    const response = await API.post('/api/studios', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (onSuccess) {
      onSuccess(response.data.message, response.data.studio);
    }
  } catch (error) {
    console.error('Error adding studio:', error);
    const message = error.response?.data?.message || 'Failed to add studio';
    if (onError) onError(message);
  }
};

export const updateStudio = async (id, formData, onSuccess, onError) => {
  try {
    const response = await API.patch(
      `/api/studios/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    onSuccess(response.data.message || "Studio updated successfully!");
  } catch (error) {
    console.error("Error editing studio:", error);
    const message = error.response?.data?.message || "Failed to update studio";
    onError(message);
  }
};

export const deleteStudio = async (id) => {
  try {
    const response = await API.delete(`/api/studios/${id}`);
    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    console.error("Error deleting studio:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete studio",
    };
  }
};

export const addStudioPhotos = async (studioId, formData, onSuccess, onError) => {
  try {
    const response = await API.post(`/api/studios/${studioId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (onSuccess) onSuccess(response.data.message, response.data.studio, response.data.addedPhotos);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to upload studio photos';
    if (onError) onError(message);
    throw error;
  }
};

export const deleteStudioPhoto = async (studioId, photoId, onSuccess, onError) => {
  try {
    const response = await API.delete(`/api/studios/${studioId}/photos/${photoId}`);
    
    if (onSuccess) {
      onSuccess(response.data.message, response.data.studio);
    }
  } catch (error) {
    console.error('Error deleting studio photo:', error);
    const message = error.response?.data?.message || 'Failed to delete photo';
    if (onError) onError(message);
  }
};
