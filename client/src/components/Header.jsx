import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header() {
  const { isLoggedIn, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getUserInitial = () => {
    if (!currentUser?.FullName) {
      return "S";
    }

    return currentUser.FullName.charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate("/");
  };

  const navLinkClass = ({ isActive }) =>
    isActive ? "nav-item active" : "nav-item";

  return (
    <header className="topbar-wrapper">
      <div className="topbar">
        <Link to="/" className="brand" aria-label="ShelfLife home">
          <span className="brand-mark">
            <span />
            <span />
          </span>

          <span className="brand-name">ShelfLife</span>
        </Link>

        <nav className="desktop-navigation">
          <NavLink to="/" end className={navLinkClass}>
            Discover
          </NavLink>
          <NavLink to="/my-shelf" className={navLinkClass}>
            My Shelf
          </NavLink>
          <NavLink to="/reading" className={navLinkClass}>
            Reading
          </NavLink>
          <NavLink to="/statistics" className={navLinkClass}>
            Statistics
          </NavLink>
        </nav>

        <div className="header-right">
          {isLoggedIn && currentUser ? (
            <div className="account-area">
              <button className="account-button">
                <span className="account-avatar">{getUserInitial()}</span>
                <span className="account-label">{currentUser.FullName}</span>
              </button>

              <button className="logout-button" onClick={handleLogout}>
                Log out
              </button>
            </div>
          ) : (
            <Link to="/login" className="account-button">
              <span className="account-avatar">S</span>
              <span className="account-label">Sign in</span>
            </Link>
          )}

          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="mobile-nav-menu">
            <NavLink
              to="/"
              end
              className={navLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              Discover
            </NavLink>
            <NavLink
              to="/my-shelf"
              className={navLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              My Shelf
            </NavLink>
            <NavLink
              to="/reading"
              className={navLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              Reading
            </NavLink>
            <NavLink
              to="/statistics"
              className={navLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              Statistics
            </NavLink>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;
