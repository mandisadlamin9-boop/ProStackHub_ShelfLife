import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Loader from "../components/Loader";

const HERO_SLIDE_COUNT = 5;
const AUTO_ADVANCE_MS = 6000;

const CATEGORIES = [
  { label: "All", query: "", color: "#534AB7", tint: "#EBE9FB" },
  {
    label: "Fiction",
    query: "subject:fiction",
    color: "#D85A30",
    tint: "#FBEAE3",
  },
  {
    label: "Nonfiction",
    query: "subject:nonfiction",
    color: "#5DCAA5",
    tint: "#E7F7F0",
  },
  {
    label: "Romance",
    query: "subject:romance",
    color: "#EF9F27",
    tint: "#FDF2E1",
  },
  {
    label: "Fantasy",
    query: "subject:fantasy",
    color: "#D4537E",
    tint: "#FBE7EE",
  },
];

function Discover() {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingBookId, setAddingBookId] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const isPaused = useRef(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { isLoggedIn, currentUser, shelfBookIds, addToShelfIds } = useAuth();
  const navigate = useNavigate();

  const fetchBooks = async (query = "") => {
    try {
      setLoading(true);
      setError("");
      setActiveSlide(0);

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

  const heroBooks = books.slice(0, HERO_SLIDE_COUNT);
  const rawGridBooks = books.slice(HERO_SLIDE_COUNT);
  const gridBooks = rawGridBooks.slice(
    0,
    Math.floor(rawGridBooks.length / 5) * 5,
  );

  useEffect(() => {
    if (heroBooks.length < 2) return;

    const interval = setInterval(() => {
      if (isPaused.current) return;
      setActiveSlide((prev) => (prev + 1) % heroBooks.length);
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(interval);
  }, [heroBooks.length]);

  const goToSlide = (index) => setActiveSlide(index);
  const nextSlide = () =>
    setActiveSlide((prev) => (prev + 1) % heroBooks.length);
  const prevSlide = () =>
    setActiveSlide((prev) => (prev - 1 + heroBooks.length) % heroBooks.length);
  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchTerm.trim();
    setActiveCategory(null);

    if (!query) {
      fetchBooks();
      return;
    }

    const cleaned = query.replace(/[-\s]/g, "");
    const isIsbn = /^(97[89])?\d{9}(\d|X)$/i.test(cleaned);

    if (isIsbn) {
      fetchBooks(`isbn:${cleaned}`);
    } else {
      fetchBooks(`intitle:${query} OR inauthor:${query}`);
    }
  };
  const handleCategoryClick = (category) => {
    setSearchTerm("");
    setActiveCategory(category.query);
    fetchBooks(category.query);
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

  const renderShelfButton = (book) =>
    shelfBookIds.has(book.id) ? (
      <button className="shelf-button added" disabled>
        On Your Shelf
      </button>
    ) : (
      <button
        className="shelf-button"
        onClick={() => handleAddToShelf(book)}
        disabled={addingBookId === book.id}
      >
        {addingBookId === book.id ? "Adding..." : "Add to Shelf"}
      </button>
    );

  const activeCategoryObj = CATEGORIES.find((c) => c.query === activeCategory);
  const isCustomSearch = Boolean(searchTerm.trim());
  const isFilteredCategory =
    !isCustomSearch && activeCategoryObj && activeCategoryObj.label !== "All";

  const gridHeading = isCustomSearch
    ? `More results for "${searchTerm.trim()}"`
    : isFilteredCategory
      ? `${activeCategoryObj.label} picks`
      : "More discoveries";

  const heroKicker = isCustomSearch
    ? "Top result"
    : isFilteredCategory
      ? `${activeCategoryObj.label} pick`
      : "Featured today";

  return (
    <div className="shelf-life">
      <Header />

      <main className="discover-page">
        <section className="discover-topline">
          <span className="discover-kicker">DISCOVER</span>

          <div className={`discover-search${searchOpen ? " open" : ""}`}>
            {searchOpen && (
              <form onSubmit={handleSearch} className="discover-search-form">
                <input
                  type="text"
                  autoFocus
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by title, author, or ISBN..."
                  aria-label="Search books"
                />
              </form>
            )}
            <button
              type="button"
              className="search-toggle-button"
              onClick={() => setSearchOpen((prev) => !prev)}
              aria-label="Toggle search"
            >
              ⌕
            </button>
          </div>
        </section>

        {loading && (
          <div className="books-state">
            <Loader label="Loading books..." />
          </div>
        )}

        {!loading && error && (
          <div className="books-state error-state">
            <p>{error}</p>

            <button onClick={() => fetchBooks()}>Try again</button>
          </div>
        )}

        {!loading && !error && heroBooks.length > 0 && (
          <>
            <section
              className="hero-carousel"
              onMouseEnter={() => (isPaused.current = true)}
              onMouseLeave={() => (isPaused.current = false)}
            >
              <div className="hero-inner">
                {heroBooks.length > 1 && (
                  <button
                    type="button"
                    className="carousel-arrow prev"
                    onClick={prevSlide}
                    aria-label="Previous book"
                  >
                    ‹
                  </button>
                )}

                <div className="hero-track-clip">
                  <div
                    className="hero-track"
                    style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                  >
                    {heroBooks.map((book, index) => (
                      <div className="hero-slide" key={`${book.id}-${index}`}>
                        <div className="featured-cover">
                          {book.coverUrl ? (
                            <img
                              src={book.coverUrl}
                              alt={`Cover of ${book.title}`}
                            />
                          ) : (
                            <div className="no-cover">
                              <span>ShelfLife</span>
                              <strong>No Cover</strong>
                            </div>
                          )}
                        </div>

                        <div className="featured-information">
                          <span className="section-kicker">
                            {index === 0
                              ? heroKicker
                              : isCustomSearch
                                ? `Result ${index + 1}`
                                : "Featured today"}
                          </span>

                          <h1>{book.title}</h1>
                          <p className="book-author">{book.author}</p>

                          {book.description && (
                            <p className="featured-description">
                              {book.description.length > 280
                                ? `${book.description.slice(0, 280).trim()}…`
                                : book.description}
                            </p>
                          )}

                          {renderShelfButton(book)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {heroBooks.length > 1 && (
                  <button
                    type="button"
                    className="carousel-arrow next"
                    onClick={nextSlide}
                    aria-label="Next book"
                  >
                    ›
                  </button>
                )}
              </div>

              {heroBooks.length > 1 && (
                <div className="carousel-dots">
                  {heroBooks.map((book, index) => (
                    <button
                      key={book.id}
                      type="button"
                      className={`carousel-dot${index === activeSlide ? " active" : ""}`}
                      onClick={() => goToSlide(index)}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </section>
            <div className="category-pills">
              {CATEGORIES.map((category) => {
                const isActive =
                  !isCustomSearch && activeCategory === category.query;
                return (
                  <button
                    key={category.label}
                    type="button"
                    className={`category-pill${isActive ? " active" : ""}`}
                    style={{
                      background: isActive ? category.color : category.tint,
                      color: isActive ? "#ffffff" : category.color,
                    }}
                    onClick={() => handleCategoryClick(category)}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
            {gridBooks.length > 0 && (
              <section className="books-section">
                <div className="books-heading">
                  <div>
                    <span className="section-kicker">BROWSE BOOKS</span>

                    <h2>{gridHeading}</h2>
                  </div>

                  <span className="book-count">{gridBooks.length} books</span>
                </div>

                <div className="book-grid">
                  {gridBooks.map((book, index) => (
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

                        {renderShelfButton(book)}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <footer className="shell-footer">
        <span>© 2026 ShelfLife</span>

        <span>A personal space for better reading.</span>
      </footer>
    </div>
  );
}

export default Discover;
