import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBooks = async (query = "fiction") => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(
          query,
        )}&limit=12`,
      );

      if (!response.ok) {
        throw new Error("Unable to load books.");
      }

      const data = await response.json();

      setBooks(data.docs || []);
    } catch (err) {
      console.error("Book search error:", err);
      setError("We couldn't load the books. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
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

        <button className="account-button">
          <span className="account-avatar">S</span>

          <span className="account-label">Account</span>
        </button>
      </header>

      {/* =========================================
          MAIN
      ========================================== */}

      <main className="discover-page">
        <section className="discover-header">
          <div>
            <span className="discover-kicker">DISCOVER</span>

            <h1>
              Find your next
              <span>great read.</span>
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
              {books.map((book, index) => {
                const coverId = book.cover_i;

                const coverUrl = coverId
                  ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
                  : null;

                return (
                  <article className="book-card" key={`${book.key}-${index}`}>
                    <div className="book-cover">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
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
                      <h3>{book.title || "Untitled"}</h3>

                      <p className="book-author">
                        {book.author_name?.[0] || "Unknown author"}
                      </p>

                      {book.first_publish_year && (
                        <span className="book-year">
                          {book.first_publish_year}
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
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
