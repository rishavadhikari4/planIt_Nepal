import API from './api';


export const getAllDecorations = async () => {
  try {
    const response = await API.get('/api/decorations');
    return response.data.decorations;
  } catch (err) {
    console.error("Error Fetching decorations:", err);
    return [];
  }
};

export const getOneDecoration = async (id) => {
  try {
    const response = await API.get(`/api/decorations/${id}`);
    return response.data.decoration; 
  } catch (err) {
    console.error("Error Fetching the decoration", err);
    return null;
  }
};


export const deleteDecoration = async (id) => {
  try {
    const response = await API.delete(`/api/decorations/${id}`);
    return { success: true, message: response.data.message };
  } catch (error) {
    console.error("Error deleting decoration:", error);
    return {
      success: false,
      message:
        err.response?.data?.message || "Failed to delete decoration",
    };
  }
};

export const editDecoration = async (id, formData, onSuccess, onError) => {
  try {
    const response = await API.patch(
      `/api/decorations/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    onSuccess(response.data.message || "Decoration updated successfully!");
  } catch (err) {
    console.error("Error editing decoration:", err);
    const message =
      err.response?.data?.message || "Failed to update decoration";
    onError(message);
  }
};


export const addDecoration = async (fromData, onSuccess, onError) => {
  try{
    const response = await API.post('/api/decorations/',
      fromData,{
        headers:{
          'Content-Type' : 'multipart/form-data',
        },
      });
      if(onSuccess){
        onSuccess(response.data.message,response.data.decoration);
      }
  }catch(error){
    const message = error.response?.data?.message ||
    'Failed to add decoraion';
    if(onError) onError(mesasge);
  }
};
