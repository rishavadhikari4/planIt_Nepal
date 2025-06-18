import { useContext, useState } from 'react';
import { Link, useLocation} from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/Header.css';

const AdminHeader = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, adminLogout,isAdmin } = useContext(AuthContext);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <nav className="header__nav container">
        <Link to="/admin" className="header__logo">
          Admin Panel
        </Link>
        <button
          className="header__menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <div className={`header__links ${isMenuOpen ? 'header__links--open' : ''}`}>
          <Link
            to="/admin"
            className={`header__link ${location.pathname === '/admin' ? 'header__link--active' : ''}`}
            onClick={() => setIsMenuOpen(false)}  
          >
            Home
          </Link>
          <Link
            to="/admin-venues"
            className={`header__link ${location.pathname === '/admin-venues' ? 'header__link--active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Venues
          </Link>
          <Link
            to="/admin-dishes"
            className={`header__link ${location.pathname === '/admin-dishes' ? 'header__link--active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Dishes
          </Link>
          <Link
            to="/admin-decorations"
            className={`header__link ${location.pathname === '/admin-decorations' ? 'header__link--active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Decorations
          </Link>
          <Link
            to="/admin-contact"
            className={`header__link ${location.pathname === '/admin-contact' ? 'header__link--active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </Link>
            {(isAuthenticated || isAdmin) && (
              <button
                className="header__link header__log-btn"
                onClick={() => {
                  isAdmin ? adminLogout() : logout();
                  setIsMenuOpen(false);
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