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
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 sm:text-2xl">All Users</h2>

      {users.length === 0 ? (
        <p className="text-center text-gray-600 text-sm">No users found.</p>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-md text-sm">
              <thead className="bg-pink-600 text-white text-sm">
                <tr>
                  <th className="px-4 py-2 text-left font-medium uppercase tracking-wider">Profile</th>
                  <th className="px-4 py-2 text-left font-medium uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 text-left font-medium uppercase tracking-wider">Email</th>
                  <th className="px-4 py-2 text-left font-medium uppercase tracking-wider">User ID</th>
                  <th className="px-4 py-2 text-left font-medium uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-pink-50">
                    <td className="px-4 py-2 whitespace-nowrap">
                      <img
                        src={user.profileImage || 'https://via.placeholder.com/40'}
                        alt="Profile"
                        className="h-8 w-8 rounded-full object-cover border border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-2 text-gray-800">{user.name || 'N/A'}</td>
                    <td className="px-4 py-2 text-gray-700">{user.email}</td>
                    <td className="px-4 py-2 text-gray-600 font-mono truncate max-w-[120px] text-xs">{user._id}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleDelete(user._id)}
                        disabled={deletingId === user._id}
                        className="px-2 py-1 rounded text-xs font-semibold bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === user._id ? (
                          <svg
                            className="animate-spin h-4 w-4"
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

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {users.map((user) => (
              <div key={user._id} className="border border-gray-200 rounded-md p-3 shadow-sm bg-white text-sm">
                <div className="flex items-center gap-2">
                  <img
                    src={user.profileImage || 'https://via.placeholder.com/40'}
                    alt="Profile"
                    className="h-10 w-10 rounded-full object-cover border border-gray-300"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{user.name || 'N/A'}</p>
                    <p className="text-xs text-gray-600 truncate">{user.email}</p>
                    <p className="text-[10px] text-gray-500 font-mono truncate">{user._id}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(user._id)}
                    disabled={deletingId === user._id}
                    className="px-2 py-1 rounded-md text-xs font-semibold bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === user._id ? (
                      <svg
                        className="animate-spin h-4 w-4 text-white"
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
                      '🗑'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminUserList;
