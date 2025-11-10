import API from './api';

export const getAllVenues = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    if (params.minPrice) queryParams.append('minPrice', params.minPrice);
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
    if (params.location) queryParams.append('location', params.location);
    if (params.minCapacity) queryParams.append('minCapacity', params.minCapacity);
    if (params.maxCapacity) queryParams.append('maxCapacity', params.maxCapacity);
    if (params.name) queryParams.append('name', params.name);

    if (params.sortField) queryParams.append('sortField', params.sortField);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const url = queryString ? `/api/venues?${queryString}` : '/api/venues';
    
    const response = await API.get(url);
  
    return {
      venues: response.data.data.venues || [],
      pagination: response.data.data.pagination || {}
    };
  } catch (error) {
    console.error('Error fetching venues:', error);
    return {
      venues: [],
      pagination: {}
    };
  }
};

export const getVenueById = async (id) => {
  try {
    const response = await API.get(`/api/venues/${id}`);
    return response.data
  } catch (error) {
    console.error('Error Fetching the single venue', error);
    throw error;
  }
};

export const deleteVenue = async (id) => {
  try {
    const response = await API.delete(`/api/venues/${id}`);
    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    console.error("Error deleting venues:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete venue",
    };
  }
};

export const editVenue = async (id, formData, onSuccess, onError) => {
  try {
    const response = await API.patch(
      `/api/venues/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    onSuccess(response.data.message || "Venue updated successfully!");
  } catch (error) {
    console.error("Error editing venues:", error);
    const message = error.response?.data?.message || "Failed to update venue";
    onError(message);
  }
};

export const addVenue = async (formData, onSuccess, onError) => {
  try {
    const response = await API.post('/api/venues/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (onSuccess) {
      onSuccess(response.data.message, response.data.venue);
    }
  } catch (error) {
    console.error('Error adding venue:', error);
    const message = error.response?.data?.message || 'Failed to add venue';
    if (onError) onError(message);
  }
};

export const searchVenues = async (searchOptions = {}) => {
  try {
    const params = new URLSearchParams();

    if (searchOptions.q) params.append('q', searchOptions.q);
    if (searchOptions.minPrice) params.append('minPrice', searchOptions.minPrice);
    if (searchOptions.maxPrice) params.append('maxPrice', searchOptions.maxPrice);
    if (searchOptions.location) params.append('location', searchOptions.location);
    if (searchOptions.minCapacity) params.append('minCapacity', searchOptions.minCapacity);
    if (searchOptions.maxCapacity) params.append('maxCapacity', searchOptions.maxCapacity);
    if (searchOptions.page) params.append('page', searchOptions.page);
    if (searchOptions.limit) params.append('limit', searchOptions.limit);
    if (searchOptions.sortField) params.append('sortField', searchOptions.sortField);
    if (searchOptions.sortOrder) params.append('sortOrder', searchOptions.sortOrder);

    const response = await API.get(`/api/venues/search?${params.toString()}`);
    
    if (response.data.success) {
      return {
        venues: response.data.data.venues,
        pagination: response.data.data.pagination,
        searchQuery: response.data.data.searchQuery
      };
    } else {
      throw new Error(response.data.message || "Failed to search venues");
    }
  } catch (error) {
    console.error("Error searching venues:", error);
    throw error;
  }
};

export const addVenuePhotos = async (venueId, photos, onSuccess, onError) => {
  try {
    if (!photos || photos.length === 0) {
      if (onError) onError("Please select at least one photo to upload");
      return;
    }

    const formData = new FormData();
    
    // Append all photos to formData
    Array.from(photos).forEach(photo => {
      formData.append('photos', photo);
    });

    const response = await API.post(`/api/venues/${venueId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success) {
      if (onSuccess) {
        onSuccess(response.data.message, {
          venue: response.data.venue,
          addedPhotos: response.data.addedPhotos
        });
      }
    } else {
      throw new Error(response.data.message || "Failed to upload photos");
    }
  } catch (error) {
    console.error("Error adding venue photos:", error);
    const message = error.response?.data?.message || "Failed to upload photos";
    if (onError) onError(message);
  }
};

export const deleteVenuePhoto = async (venueId, photoId, onSuccess, onError) => {
  try {
    const response = await API.delete(`/api/venues/${venueId}/photos/${photoId}`);
    
    if (response.data.success) {
      if (onSuccess) {
        onSuccess(response.data.message, response.data.venue);
      }
    } else {
      throw new Error(response.data.message || "Failed to delete photo");
    }
  } catch (error) {
    console.error("Error deleting venue photo:", error);
    const message = error.response?.data?.message || "Failed to delete photo";
    if (onError) onError(message);
  }
};

