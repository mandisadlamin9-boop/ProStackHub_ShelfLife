import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header() {
  const { isLoggedIn, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const getUserInitial = () => {
    if (!currentUser?.FullName) {
      return "S";
    }

    return currentUser.FullName.charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="topbar-shell">
      <header className="topbar">
        <Link to="/" className="brand" aria-label="ShelfLife home">
          <span className="brand-mark">
            <span />
            <span />
          </span>

          <span className="brand-name">ShelfLife</span>
        </Link>

        <nav className="desktop-navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            Discover
          </NavLink>

          <NavLink
            to="/my-shelf"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            My Shelf
          </NavLink>

          <NavLink
            to="/reading"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            Reading
          </NavLink>

          <NavLink
            to="/statistics"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            Statistics
          </NavLink>
        </nav>

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
      </header>
    </div>
  );
}

export default Header;
