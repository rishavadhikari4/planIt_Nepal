import React, { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaPencilAlt } from 'react-icons/fa';
import {
  fetchLoginUser,
  updateProfilePicture,
  updateProfile,
} from '../services/userService';

const UserProfile = () => {
  const { logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState('');
  const [editValue, setEditValue] = useState('');
  const modalRef = useRef(null); // Ref to detect outside clicks

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchLoginUser();
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        toast.error('Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModal]);

  // Greeting function
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Hello';
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { image } = await updateProfilePicture(file);
      const updatedUser = { ...user, profileImage: image };
      setUser(updatedUser);
      updateUser(updatedUser);
      toast.success('Profile picture updated!');
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast.error('Failed to update profile picture.');
    } finally {
      setUploading(false);
    }
  };

  const openEditModal = (field) => {
    setFieldToEdit(field);
    setEditValue(user[field]);
    setShowModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      const updated = { ...user, [fieldToEdit]: editValue };
      const response = await updateProfile({ [fieldToEdit]: editValue });
      setUser(response.user);
      updateUser(response.user);
      toast.success(`${fieldToEdit} updated successfully!`);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Update failed.');
    } finally {
      setShowModal(false);
    }
  };

if (loading)
  return (
    <div className="flex items-center justify-center h-64">
      <svg
        className="animate-spin -ml-1 mr-3 h-10 w-10 text-blue-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label="Loading"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
    </div>
  );

  if (!user) return <div>No user data available.</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-md mt-8">
      <div className="mb-4 text-2xl font-semibold">
        {getGreeting()},
      </div>
      {/* Profile image */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative w-24 h-24">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-4xl font-bold text-gray-700">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={uploading}
            id="profileImageInput"
            className="hidden"
          />
          <label
            htmlFor="profileImageInput"
            className="absolute bottom-0 right-0 bg-white rounded-full p-1 cursor-pointer border border-gray-300 hover:bg-gray-100"
            title="Change profile picture"
          >
            <FaPencilAlt className="text-gray-700 w-5 h-5" />
          </label>
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <button
              onClick={() => openEditModal('name')}
              className="text-blue-600 hover:text-blue-800"
              title="Edit name"
            >
              <FaPencilAlt />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-gray-600">{user.email}</p>
            <button
              onClick={() => openEditModal('email')}
              className="text-blue-600 hover:text-blue-800"
              title="Edit email"
            >
              <FaPencilAlt />
            </button>
          </div>
          {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
        </div>
      </div>

      {/* Details */}
      <div className="text-sm text-gray-700">
        <p><strong>User ID:</strong> {user._id}</p>
        <p><strong>Account Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
        <p><strong>Last Updated:</strong> {new Date(user.updatedAt).toLocaleDateString()}</p>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Logout
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div
            ref={modalRef}
            className="bg-white/70 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-[500px] border border-white/30"
          >
            <h2 className="text-xl font-bold mb-6">Edit {fieldToEdit}</h2>
            <input
              type={fieldToEdit === 'email' ? 'email' : 'text'}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg mb-6 text-base bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 bg-gray-300 text-gray-800 font-medium rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
