//this is the part which sends req to the api for the venues
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
