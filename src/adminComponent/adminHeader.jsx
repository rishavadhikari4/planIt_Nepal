import { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import '../styles/Header.css';

const AdminHeader = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, adminLogout, isAdmin } = useContext(AuthContext);

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const navLinks = [
    { path: '/admin', label: 'Home' },
    { path: '/admin-venues', label: 'Venues' },
    { path: '/admin-dishes', label: 'Dishes' },
    { path: '/admin-decorations', label: 'Decorations' },
    { path: '/admin-contact', label: 'Contact' },
  ];

  return (
    <header className="header">
      <nav className="header__nav container">
        <Link to="/admin" className="header__logo">Admin Panel</Link>

        <button
          className="header__menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="header__links header__links--open"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`header__link ${location.pathname === link.path ? 'header__link--active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {(isAuthenticated || isAdmin) && (
                <button
                  className="header__log-btn"
                  onClick={() => {
                    isAdmin ? adminLogout() : toast.info('Logging out...');
                    setIsMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop menu */}
        <div className="header__links-desktop header__links">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`header__link ${location.pathname === link.path ? 'header__link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          {(isAuthenticated || isAdmin) && (
            <button
              className="header__log-btn"
              onClick={() => {
                isAdmin ? adminLogout() : toast.info('Logging out...');
              }}
            >
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default AdminHeader;
