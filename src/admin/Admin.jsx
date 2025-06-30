import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminOrderList from '../adminComponent/adminOrders';
import AdminUserList from '../adminComponent/adminUsersList';
import AdminReviews from '../adminComponent/adminReviews';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('orders');

  // Animation variants
  const fadeVariant = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <nav className="py-6">
          <ul className="flex flex-col space-y-2 px-4">
            <li
              onClick={() => setActiveTab('orders')}
              className={`cursor-pointer rounded px-3 py-2 text-lg flex items-center gap-2 transition-colors ${
                activeTab === 'orders'
                  ? 'bg-pink-600 text-white font-semibold'
                  : 'text-gray-700 hover:bg-pink-100'
              }`}
            >
              📦 Orders
            </li>
            <li
              onClick={() => setActiveTab('users')}
              className={`cursor-pointer rounded px-3 py-2 text-lg flex items-center gap-2 transition-colors ${
                activeTab === 'users'
                  ? 'bg-pink-600 text-white font-semibold'
                  : 'text-gray-700 hover:bg-pink-100'
              }`}
            >
              👥 Users
            </li>
            <li
              onClick={() => setActiveTab('review')}
              className={`cursor-pointer rounded px-3 py-2 text-lg flex items-center gap-2 transition-colors ${
                activeTab === 'review'
                  ? 'bg-pink-600 text-white font-semibold'
                  : 'text-gray-700 hover:bg-pink-100'
              }`}
            >
              ⭐ Reviews
            </li>
            <li className="cursor-not-allowed rounded px-3 py-2 text-lg text-gray-400 flex items-center gap-2 select-none">
              ⚙ Settings
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8">
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
      </main>
    </div>
  );
};

export default Admin;
