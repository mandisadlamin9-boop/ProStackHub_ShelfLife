import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const fetchBooks = async (query = "fiction") => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/books/search?q=${encodeURIComponent(query)}`,
      );

      if (!response.ok) {
        throw new Error("Unable to load books.");
      }

      const data = await response.json();

      setBooks(data.books || []);
    } catch (err) {
      console.error("Book search error:", err);
      setError("We couldn't load the books. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();

    const savedToken = localStorage.getItem("shelflifeToken");
    const savedUser = localStorage.getItem("shelflifeUser");

    if (savedToken && savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
        setIsLoggedIn(true);
      } catch (err) {
        console.error("Unable to restore login session:", err);
        localStorage.removeItem("shelflifeToken");
        localStorage.removeItem("shelflifeUser");
      }
    }
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchTerm.trim();

    if (!query) {
      fetchBooks();
      return;
    }

    fetchBooks(query);
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    setLoginError("");

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError("Please enter your email and password.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.message || "Unable to log in.");
        return;
      }

      localStorage.setItem("shelflifeToken", data.token);
      localStorage.setItem("shelflifeUser", JSON.stringify(data.account));

      setCurrentUser(data.account);
      setIsLoggedIn(true);
      setShowLogin(false);

      setLoginEmail("");
      setLoginPassword("");
      setLoginError("");

      fetchBooks();
    } catch (err) {
      console.error("Login error:", err);
      setLoginError(
        "Unable to connect to ShelfLife. Please make sure the server is running.",
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("shelflifeToken");
    localStorage.removeItem("shelflifeUser");

    setCurrentUser(null);
    setIsLoggedIn(false);
    setShowLogin(false);
  };

  const getUserInitial = () => {
    if (!currentUser?.FullName) {
      return "S";
    }

    return currentUser.FullName.charAt(0).toUpperCase();
  };

  if (showLogin) {
    return (
      <div className="shelf-life">
        <main className="login-page">
          <section className="login-card">
            <button
              className="login-back"
              onClick={() => {
                setShowLogin(false);
                setLoginError("");
              }}
            >
              ← Back to Discover
            </button>

            <div className="login-brand">
              <span className="brand-mark">
                <span />
                <span />
              </span>

              <span className="brand-name">ShelfLife</span>
            </div>

            <span className="discover-kicker">WELCOME BACK</span>

            <h1>Sign in to your shelf.</h1>

            <p className="login-description">
              Continue discovering books and keeping track of your reading
              journey.
            </p>

            <form className="login-form" onSubmit={handleLogin}>
              <label htmlFor="login-email">Email</label>

              <input
                id="login-email"
                type="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
              />

              <label htmlFor="login-password">Password</label>

              <input
                id="login-password"
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />

              {loginError && (
                <p className="login-error" role="alert">
                  {loginError}
                </p>
              )}

              <button className="login-submit" type="submit">
                Sign in
              </button>
            </form>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="shelf-life">
      {/* =========================================
          HEADER
      ========================================== */}

      <header className="topbar">
        <button
          className="brand"
          onClick={() => fetchBooks()}
          aria-label="ShelfLife home"
        >
          <span className="brand-mark">
            <span />
            <span />
          </span>

          <span className="brand-name">ShelfLife</span>
        </button>

        <nav className="desktop-navigation">
          <button className="nav-item active">Discover</button>

          <button className="nav-item">My Shelf</button>

          <button className="nav-item">Reading</button>

          <button className="nav-item">Statistics</button>
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
          <button className="account-button" onClick={() => setShowLogin(true)}>
            <span className="account-avatar">S</span>

            <span className="account-label">Sign in</span>
          </button>
        )}
      </header>

      {/* =========================================
          MAIN
      ========================================== */}

      <main className="discover-page">
        <section className="discover-header">
          <div>
            <span className="discover-kicker">DISCOVER</span>

            <h1>
              {isLoggedIn && currentUser ? (
                <>
                  Hello, <span>{currentUser.FullName.split(" ")[0]}.</span>
                  <br />
                  Ready for your next read?
                </>
              ) : (
                <>
                  Find your next
                  <span>great read.</span>
                </>
              )}
            </h1>

            <p>
              Explore books from a world of authors, stories, and ideas. Search
              for something specific or simply browse what's available.
            </p>
          </div>

          {/* =====================================
              SEARCH
          ====================================== */}

          <form className="book-search" onSubmit={handleSearch}>
            <span className="search-icon">⌕</span>

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by title, author, or ISBN..."
              aria-label="Search books"
            />

            <button type="submit">Search</button>
          </form>
        </section>

        {/* =========================================
            RESULTS HEADER
        ========================================== */}

        <section className="books-section">
          <div className="books-heading">
            <div>
              <span className="section-kicker">BROWSE BOOKS</span>

              <h2>
                {searchTerm.trim()
                  ? `Results for "${searchTerm.trim()}"`
                  : "Popular discoveries"}
              </h2>
            </div>

            <span className="book-count">{books.length} books</span>
          </div>

          {/* =========================================
              LOADING
          ========================================== */}

          {loading && (
            <div className="books-state">
              <div className="loader" />
              <p>Finding books...</p>
            </div>
          )}

          {/* =========================================
              ERROR
          ========================================== */}

          {!loading && error && (
            <div className="books-state error-state">
              <p>{error}</p>

              <button onClick={() => fetchBooks()}>Try again</button>
            </div>
          )}

          {/* =========================================
              BOOK GRID
          ========================================== */}

          {!loading && !error && (
            <div className="book-grid">
              {books.map((book, index) => (
                <article className="book-card" key={`${book.id}-${index}`}>
                  <div className="book-cover">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={`Cover of ${book.title}`}
                        loading="lazy"
                      />
                    ) : (
                      <div className="no-cover">
                        <span>ShelfLife</span>
                        <strong>No Cover</strong>
                      </div>
                    )}
                  </div>

                  <div className="book-information">
                    <h3>{book.title}</h3>

                    <p className="book-author">{book.author}</p>

                    {book.year && (
                      <span className="book-year">{book.year}</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* =========================================
          FOOTER
      ========================================== */}

      <footer className="shell-footer">
        <span>© 2026 ShelfLife</span>

        <span>A personal space for better reading.</span>
      </footer>
    </div>
  );
}

export default App;
