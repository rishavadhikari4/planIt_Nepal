import API from './api';



export const getAllVenues = async () => {
  try {
    const response = await API.get('/api/venues');
    console.log('Venues fetched successfully:', response.data.venues);
    return response.data.venues;
  } catch (error) {
    console.error('Error fetching venues:', error);
    return [];
  }
};

// // Handle venue selection
// export const handleVenueSelection = (venueId) => {
//   sessionStorage.setItem("selectedVenue", venueId);
//   // Future API call to backend
//   return Promise.resolve({ success: true });
// };