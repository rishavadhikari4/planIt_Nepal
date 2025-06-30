import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleCartClick = (e) => {
    setIsMenuOpen(false);
    if (!isAuthenticated) {
      e.preventDefault();
      toast.info('Please log in to view your cart.');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tailwind colors variables equivalent (replace with your own colors if needed)
 const primaryColor = 'bg-gradient-to-r from-blue-400 via-blue-400 to-pink-600';
    // replace with your --primary-color
  const secondaryColor = 'bg-pink-800';    // replace with your --secondary-color
  const textColor = 'text-gray-100';       // replace with your --text-color

  return (
    <header className={`sticky top-0 z-50 w-full shadow-md ${primaryColor} py-4`}>
      <nav className="container mx-auto flex justify-between items-center px-4">
        <Link to="/" className="text-2xl font-bold text-gray-100 no-underline">
          Wedding Planner
        </Link>

        {/* Menu toggle for mobile */}
        <button
          className="text-gray-100 text-3xl md:hidden focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        {/* Links container */}
        <div
          className={`flex md:flex-row flex-col md:static absolute top-full left-0 right-0 bg-pink-600 md:bg-transparent shadow-md md:shadow-none md:gap-5 gap-2 p-4 md:p-0 transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'flex' : 'hidden md:flex'
          }`}
        >
          {!isAuthenticated && (
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className={`text-lg px-3 py-1 rounded text-gray-100 ${
                location.pathname === '/login' ? 'bg-pink-800 text-white font-bold' : 'hover:bg-pink-800 hover:text-white '
              }`}
            >
              Login
            </Link>
          )}
          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className={`text-lg px-3 py-1 rounded text-gray-100 ${
              location.pathname === '/' ? 'bg-pink-800 text-white font-bold' : ' hover:bg-pink-800 hover:text-white'
            }`}
          >
            Home
          </Link>
          <Link
            to="/venues"
            onClick={() => setIsMenuOpen(false)}
            className={`text-lg px-3 py-1 rounded text-gray-100 ${
              location.pathname === '/venues' ? 'bg-pink-800 text-white font-bold' : 'hover:bg-pink-800 hover:text-white '
            }`}
          >
            Venues
          </Link>
          <Link
            to="/dishes"
            onClick={() => setIsMenuOpen(false)}
            className={`text-lg px-3 py-1 rounded text-gray-100 ${
              location.pathname === '/dishes' ? 'bg-pink-800 text-white font-bold' : 'hover:bg-pink-800 hover:text-white'
            }`}
          >
            Dishes
          </Link>
          <Link
            to="/decorations"
            onClick={() => setIsMenuOpen(false)}
            className={` text-lg px-3 py-1 rounded text-gray-100 ${
              location.pathname === '/decorations' ? 'bg-pink-800 text-white font-bold' : 'hover:bg-pink-800 hover:text-white'
            }`}
          >
            Decorations
          </Link>
          <Link
            to="/contact"
            onClick={() => setIsMenuOpen(false)}
            className={`text-lg px-3 py-1 rounded text-gray-100 ${
              location.pathname === '/contact' ? 'bg-pink-800 text-white font-bold' : 'hover:bg-pink-800 hover:text-white'
            }`}
          >
            Contact
          </Link>

          <Link
            to="/cart"
            onClick={handleCartClick}
            className={`px-3 py-1 rounded text-gray-100 flex items-center ${
              location.pathname === '/cart' ? 'bg-pink-800 text-white' : 'hover:bg-pink-800 hover:text-white'
            }`}
          >
            <ShoppingCart />
          </Link>

          {isAuthenticated && user && (
            <div className="relative inline-block" ref={dropdownRef}>
              <div
                onClick={toggleDropdown}
                className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden cursor-pointer flex items-center justify-center select-none"
              >
                {user.profileImage ? (
                  <img src={user.profileImage} alt="User" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="font-bold text-gray-700">{user.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>

              {isDropdownOpen && (
                <div className="text-lg absolute right-0 mt-2 w-36 bg-white border border-gray-300 rounded shadow-lg z-50">
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:outline-none"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
