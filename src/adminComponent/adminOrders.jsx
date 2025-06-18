import { useEffect, useState } from 'react';
import { getAllOrders } from '../api/orderService'; 
import '../styles/adminOrder.css';

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

  if (loading) return (
    <div className="loader-container">
      <div className="loader"></div>
    </div>
  );

  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="admin-orders-container">
      <h2>Orders</h2>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="order-card">
            <p><strong>User Name:</strong> {order.userId?.name || 'Unknown'}</p>
            <p><strong>User Email:</strong> {order.userId?.email || 'Unknown'}</p>
            <p><strong>Order ID:</strong> {order._id}</p>

            <ul className="order-items-list">
              {order.items.map((item, index) => (
                <li key={index} className="order-item">
                  <img src={item.image} alt={item.name} className="order-item-image" />
                  <span>{item.name} — {item.quantity} pcs</span>
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
