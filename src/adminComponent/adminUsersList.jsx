import { useEffect, useState } from 'react';
import { fetchUsers, deleteUser } from '../services/userService';
import { toast } from 'react-toastify';

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const getUsers = async () => {
      try {
        setLoading(true);
        const data = await fetchUsers();
        setUsers(data);
        setError(null);
      } catch (err) {
        setError("Error fetching users");
        toast.error("Error fetching users");
      } finally {
        setLoading(false);
      }
    };

    getUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    setDeletingId(id);

    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((user) => user._id !== id));
      toast.success("User deleted successfully");
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

if (loading)
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <svg
          className="animate-spin h-12 w-12 text-pink-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
      </div>
    );
  if (error) return <p className="text-center text-red-600 mt-4">{error}</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">All Users</h2>

      {users.length === 0 ? (
        <p className="text-center text-gray-600">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-md">
            <thead className="bg-pink-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Profile</th>
                <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">User ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-pink-50">
                  <td className="px-6 py-4 whitespace-nowrap" data-label="Profile">
                    <img
                      src={user.profileImage || 'https://via.placeholder.com/40'}
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover border border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-medium" data-label="Name">{user.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700" data-label="Email">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm font-mono truncate max-w-[150px]" data-label="User ID">{user._id}</td>
                  <td className="px-6 py-4 whitespace-nowrap" data-label="Action">
                    <button
                      onClick={() => handleDelete(user._id)}
                      disabled={deletingId === user._id}
                      className="px-3 py-1 rounded-md text-sm font-semibold bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {deletingId === user._id ? (
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          ></path>
                        </svg>
                      ) : (
                        '🗑 Delete'
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUserList;
