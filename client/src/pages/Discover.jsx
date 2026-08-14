import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";

function Discover() {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingBookId, setAddingBookId] = useState(null);

  const { isLoggedIn, currentUser, shelfBookIds, addToShelfIds } = useAuth();
  const navigate = useNavigate();

  const fetchBooks = async (query = "") => {
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

  const handleAddToShelf = async (book) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const token = localStorage.getItem("shelflifeToken");

    setAddingBookId(book.id);

    try {
      const response = await fetch("http://localhost:5000/api/shelf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          googleBooksId: book.id,
          title: book.title,
          author: book.author,
          coverUrl: book.coverUrl,
          isbn: book.isbn,
          totalPages: book.totalPages,
          status: "want_to_read",
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to add book to shelf.");
      }

      addToShelfIds(book.id);
    } catch (err) {
      console.error("Add to shelf error:", err);
    } finally {
      setAddingBookId(null);
    }
  };

  return (
    <div className="shelf-life">
      <Header />

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

          {loading && (
            <div className="books-state">
              <div className="loader" />
              <p>Finding books...</p>
            </div>
          )}

          {!loading && error && (
            <div className="books-state error-state">
              <p>{error}</p>

              <button onClick={() => fetchBooks()}>Try again</button>
            </div>
          )}

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

                    {shelfBookIds.has(book.id) ? (
                      <button className="shelf-button added" disabled>
                        On Your Shelf
                      </button>
                    ) : (
                      <button
                        className="shelf-button"
                        onClick={() => handleAddToShelf(book)}
                        disabled={addingBookId === book.id}
                      >
                        {addingBookId === book.id
                          ? "Adding..."
                          : "Add to Shelf"}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="shell-footer">
        <span>© 2026 ShelfLife</span>

        <span>A personal space for better reading.</span>
      </footer>
    </div>
  );
}

export default Discover;
