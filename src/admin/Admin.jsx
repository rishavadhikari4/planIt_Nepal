import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminOrderList from '../adminComponent/adminOrders';
import AdminUserList from '../adminComponent/adminUsersList';
import AdminReviews from '../adminComponent/adminReviews';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('orders');

  const fadeVariant = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  const icons = {
    orders: '📦',
    users: '👥',
    review: '⭐',
    settings: '⚙',
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className="
          bg-white shadow-md
          fixed top-11 bottom-0 left-0
          w-12        /* Small width just enough for icon */
          lg:w-64     /* Full width on desktop */
          flex flex-col
          border-r border-gray-200
          overflow-hidden
        "
      >
        <nav className="py-6 flex flex-col flex-grow">
          <ul className="flex flex-col space-y-2">
            {['orders', 'users', 'review', 'settings'].map((tab) => (
              <li
                key={tab}
                onClick={() => tab !== 'settings' && setActiveTab(tab)}
                className={`
                  cursor-pointer
                  rounded
                  flex items-center
                  justify-center   /* center icon horizontally on mobile */
                  lg:justify-start /* left align on desktop */
                  px-0 lg:px-3     /* remove horizontal padding on mobile */
                  py-3 text-lg
                  transition-colors
                  ${
                    activeTab === tab
                      ? 'bg-pink-600 text-white font-semibold'
                      : tab === 'settings'
                      ? 'text-gray-400 cursor-not-allowed select-none'
                      : 'text-gray-700 hover:bg-pink-100'
                  }
                `}
              >
                <span className="text-xl">{icons[tab]}</span>
                {/* Text label hidden on mobile, shown on desktop */}
                <span className="hidden lg:inline ml-3">
                  {tab === 'review' ? 'Reviews' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </span>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className="
          flex-1 p-8
          ml-12     /* margin left = sidebar width on mobile */
          lg:ml-64  /* margin left = sidebar width on desktop */
          overflow-auto max-h-screen
        "
      >
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
