import { useEffect, useState } from 'react';
import '../styles/adminUser.css';
import { fetchUsers, deleteUser } from '../api/userService';
import { toast } from 'react-toastify';

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null); // Track deleting user ID

  // Load users on mount
  useEffect(() => {
    const getUsers = async () => {
      try {
        setLoading(true);
        const data = await fetchUsers();
        setUsers(data);
      } catch (err) {
        setError(err);
        console.error(err);
        toast.error("Error Fetching the users");
      } finally {
        setLoading(false);
      }
    };

    getUsers();
  }, []);

  // Handle user deletion
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    setDeletingId(id); // Start loader on delete button

    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((user) => user._id !== id));
      toast.success("User deleted Successfully");
    } catch (err) {
      console.error(err);
      setError(err);
      toast.error("Failed to delete the user");
    } finally {
      setDeletingId(null); // Stop loader
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-user-container">
      <h2>All Users</h2>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Profile</th>
              <th>Name</th>
              <th>Email</th>
              <th>User ID</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="user-avatar"
                  />
                </td>
                <td>{user.name || 'N/A'}</td>
                <td>{user.email}</td>
                <td>{user._id}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(user._id)}
                    disabled={deletingId === user._id} // disable button while deleting
                  >
                    {deletingId === user._id ? (
                      <div
                        className="small-loader"
                      />
                    ) : (
                      '🗑 Delete'
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUserList;
