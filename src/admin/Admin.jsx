import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminOrderList from '../adminComponent/adminOrders';
import AdminUserList from '../adminComponent/adminUsersList';
import AdminReviews from '../adminComponent/adminReviews';
import '../styles/admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('orders');

  // Animation variants
  const fadeVariant = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

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
        <AnimatePresence mode="wait">
          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              variants={fadeVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <AdminOrderList />
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              key="users"
              variants={fadeVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <AdminUserList />
            </motion.div>
          )}

          {activeTab === 'review' && (
            <motion.div
              key="review"
              variants={fadeVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <AdminReviews />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Admin;
