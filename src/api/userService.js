// userService.js
import axios from 'axios';
import API from '../api/api'; // adjust path if needed

// Fetch all users
export const fetchUsers = async () => {
  const token = localStorage.getItem('token');
  const res = await API.get('/api/auth/allUsers', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Delete a user by ID
export const deleteUser = async (id) => {
  const token = localStorage.getItem('token');
  await axios.delete(`/api/auth/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
