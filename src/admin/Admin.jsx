import { useState } from 'react';
import AdminOrderList from '../adminComponent/adminOrders';
import AdminUserList from '../adminComponent/adminUsersList';
import AdminReviews from '../adminComponent/adminReviews';
import '../styles/admin.css'; 

const Admin = () => {
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <ul className="admin-nav">
          <li
            className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Orders
          </li>
          <li
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Users
          </li>
          <li
            className={`admin-tab ${activeTab === 'review' ? 'active' : ''}`}
            onClick={() => setActiveTab('review')}
          >
            ⭐ Reviews
          </li>
          <li className="admin-tab disabled">⚙ Settings</li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="admin-content">
        {activeTab === 'orders' && <AdminOrderList />}
        {activeTab === 'users' && <AdminUserList />}
        {activeTab ==='review' && <AdminReviews/>}
      </div>
    </div>
  );
};

export default Admin;
