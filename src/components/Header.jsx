import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/Header.css';

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header">
      <nav className="header__nav container">
        <Link to="/" className="header__logo">Wedding Planner</Link>

        <button className="header__menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          ☰
        </button>

        <div className={`header__links ${isMenuOpen ? 'header__links--open' : ''}`}>
          {!isAuthenticated && (
            <Link
              to="/login"
              className={`header__link header__log-btn ${location.pathname === '/login' ? 'header__link--active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
          )}
          <Link to="/" className={`header__link ${location.pathname === '/' ? 'header__link--active' : ''}`} onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/venues" className={`header__link ${location.pathname === '/venues' ? 'header__link--active' : ''}`} onClick={() => setIsMenuOpen(false)}>Venues</Link>
          <Link to="/dishes" className={`header__link ${location.pathname === '/dishes' ? 'header__link--active' : ''}`} onClick={() => setIsMenuOpen(false)}>Dishes</Link>
          <Link to="/decorations" className={`header__link ${location.pathname === '/decorations' ? 'header__link--active' : ''}`} onClick={() => setIsMenuOpen(false)}>Decorations</Link>
          <Link to="/contact" className={`header__link ${location.pathname === '/contact' ? 'header__link--active' : ''}`} onClick={() => setIsMenuOpen(false)}>Contact</Link>

          <Link to="/cart" className={`header__link ${location.pathname === '/cart' ? 'header__link--active' : ''}`} onClick={handleCartClick}>
            <ShoppingCart />
          </Link>

          {isAuthenticated && user && (
            <div className="header__user-dropdown" ref={dropdownRef}>
              <div className="header__avatar" onClick={toggleDropdown}>
                {user.profileImage ? (
                  <img src={user.profileImage} alt="User" className="header__avatar-img" />
                ) : (
                  <span className="header__avatar-placeholder">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {isDropdownOpen && (
                <div className="header__dropdown-menu">
                  <button onClick={logout} className="header__dropdown-item">Logout</button>
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
