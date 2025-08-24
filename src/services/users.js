import API from './api';

export const fetchUsers = async () => {
  const res = await API.get('/api/users/');
  return res.data.users;
};

export const deleteUser = async (userId) => {
  const res = await API.delete(`/api/users/${userId}`);
  return res.data;
};

export const fetchLoginUser = async () => {
  const res = await API.get('/api/users/me');
  return res.data.user;
};

export const updateProfile = async (userData) => {
  const res = await API.patch('/api/users/me', userData);
  return res.data.user;
};

export const updateProfilePicture = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const res = await API.patch('/api/users/me/picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return res.data;
};

export const deleteAccountOfOwn = async (password) => {
  const res = await API.delete('/api/users/me', {
    data: { password }
  });
  return res.data;
};

export const getUserInspectionData = async (userId) => {
  try {
    const response = await API.get(`/api/users/inspect/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user inspection data:', error);
    throw error;
  }
};



