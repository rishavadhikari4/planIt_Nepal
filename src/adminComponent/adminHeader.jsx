import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const AdminHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, adminLogout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(prev => !prev);

  const navLinks = [
    { path: '/admin', label: 'Home' },
    { path: '/admin-venues', label: 'Venues' },
    { path: '/admin-dishes', label: 'Dishes' },
    { path: '/admin-decorations', label: 'Decorations' },
    { path: '/admin-contact', label: 'Contact' },
  ];

  const handleLogout = () => {
    if (isAdmin) {
      adminLogout();
      toast.success('Logged out successfully');
      navigate('/admin-login'); // or wherever you want to redirect
    } else {
      toast.info('You are not authorized');
    }
    setIsMenuOpen(false);
  };

const primaryColor = 'bg-gradient-to-r from-gray-400 via-blue-500 to-blue-600';

  const activeBgColor = 'bg-pink-800';
  const textColor = 'text-gray-100';

  return (
    <header className={`sticky top-0 z-50 w-full shadow-md ${primaryColor} py-4`}>
      <nav className="container mx-auto flex justify-between items-center px-4">
        <Link to="/admin" className={`text-2xl font-bold ${textColor} no-underline`}>
          Admin Panel
        </Link>

        {/* Mobile menu toggle */}
        <button
          className={`${textColor} text-3xl md:hidden focus:outline-none`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>

        {/* Links container */}
        <div
          className={`flex md:flex-row flex-col md:static absolute top-full left-0 right-0 ${activeBgColor} md:bg-transparent shadow-md md:shadow-none md:gap-5 gap-2 p-4 md:p-0 transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'flex' : 'hidden md:flex'
          }`}
        >
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
              className={`text-lg px-3 py-1 rounded ${textColor} ${
                location.pathname === link.path ? `${activeBgColor} text-white font-bold` : `hover:${activeBgColor} hover:text-white`
              }`}
            >
              {link.label}
            </Link>
          ))}

          {(isAuthenticated && isAdmin) && (
            <button
              onClick={handleLogout}
              className={`text-lg px-3 py-1 rounded ${textColor} hover:${activeBgColor} hover:text-white`}
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
