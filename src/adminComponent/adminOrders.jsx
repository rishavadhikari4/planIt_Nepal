import { useEffect, useState } from 'react';
import { getAllOrders } from '../services/orderService';

const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersData = await getAllOrders();
        setOrders(ordersData);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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

  if (error)
    return (
      <p className="text-center text-red-600 font-semibold my-6">
        {error}
      </p>
    );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Orders</h2>

      {orders.length === 0 ? (
        <p className="text-center text-gray-600">No orders found.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            className="mb-8 p-6 bg-white rounded-lg shadow-md border border-gray-200"
          >
            <p className="mb-1">
              <strong>User Name:</strong> {order.userId?.name || 'Unknown'}
            </p>
            <p className="mb-1">
              <strong>User Email:</strong> {order.userId?.email || 'Unknown'}
            </p>
            <p className="mb-4">
              <strong>Order ID:</strong> {order._id}
            </p>

            <ul className="space-y-4">
              {order.items.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center gap-4 bg-gray-50 p-3 rounded"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <span className="text-gray-700 font-medium">
                    {item.name} — {item.quantity} pcs
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminOrderList;
