import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <nav className="header__nav container">
        <Link to="/" className="header__logo">
          Lagan Gaatho
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
            to="/"
            className={`header__link ${location.pathname === '/' ? 'header__link--active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/venues"
            className={`header__link ${location.pathname === '/venues' ? 'header__link--active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Venues
          </Link>
          <Link
            to="/dishes"
            className={`header__link ${location.pathname === '/dishes' ? 'header__link--active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Dishes
          </Link>
          <Link
            to="/decorations"
            className={`header__link ${location.pathname === '/decorations' ? 'header__link--active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Decorations
          </Link>
          <Link
            to="/contact"
            className={`header__link ${location.pathname === '/contact' ? 'header__link--active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
