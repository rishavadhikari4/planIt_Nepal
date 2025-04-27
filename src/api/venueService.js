import API from './api';



export const getVenues = async () => {
  try {
    const response = await API.get('/api/venues');
    console.log('Venues fetched successfully:', response.data.venues);
    return response.data.venues;
  } catch (error) {
    console.error('Error fetching venues:', error);
    return [];
  }
};

export const addVenue = async (venueData) => {
    try {
        const response = await axios.post(API_URL, venueData);
        return response.data.venue;
    } catch (error) {
        console.error("Error adding venue:", error);
        throw error;
    }
};

// Update a venue
export const updateVenue = async (id, venueData) => {
    try {
        const response = await axios.patch(`${API_URL}/${id}`, venueData);
        return response.data.venue;
    } catch (error) {
        console.error("Error updating venue:", error);
        throw error;
    }
};

// Delete a venue
export const deleteVenue = async (id) => {
    try {
        await axios.delete(`${API_URL}/${id}`);
    } catch (error) {
        console.error("Error deleting venue:", error);
        throw error;
    }
};

// // Handle venue selection
// export const handleVenueSelection = (venueId) => {
//   sessionStorage.setItem("selectedVenue", venueId);
//   // Future API call to backend
//   return Promise.resolve({ success: true });
// };