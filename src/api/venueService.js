//this is the part which sends req to the api for the venues
import API from './api';



export const getAllVenues = async () => {
  try {
    const response = await API.get('/api/venues');
    return response.data.venues;
  } catch (error) {
    console.error('Error fetching venues:', error);
    return [];
  }
};

export const getOneVenue = async (id) =>{
  try{
    const response = await API.get(`/api/venues/${id}`);
    return response.data.venue;

  }catch(error){
    console.error('Error Fetching the single venue',error);
    return null;
  }
};

export const deleteVenue = async (id) =>{
  try{
    const response = await API.delete(`/api/venues/${id}`);
    return {
      success:true,
      message:response.data.message
    };
  }catch(error){
    console.error("Error deleting venues:",error);
    return {
      success:false,
      message:
        error.response?.data?.message || "Failed to delete venue",
    };
  }
};


export const editVenue = async (id, formData, onSuccess,  onError) =>{
  try{
    const response = await API.patch(
      `/api/venues/${id}`,
      formData,
      {
        headers:{
          'Content-Type' : 'multipart/form-data',
        },
      }
    );
    onSuccess(response.data.message || "Venue updated Successfully!");
  }catch(error){
    console.error("Error editing venues:",error);
    const message = 
      err.response?.data?.message || "Failed to update venue";
    onError(message);
  }
};
