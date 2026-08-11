import "./App.css";

const featuredBooks = [
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    category: "Fiction",
    status: "Want to Read",
    cover:
      "https://books.google.com/books/content?id=2f5QEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl",
  },
  {
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    author: "Gabrielle Zevin",
    category: "Contemporary Fiction",
    status: "Want to Read",
    cover:
      "https://books.google.com/books/content?id=9G1dEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl",
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    category: "Personal Development",
    status: "Currently Reading",
    cover:
      "https://books.google.com/books/content?id=fFCjDQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl",
  },
  {
    title: "The Creative Act",
    author: "Rick Rubin",
    category: "Creativity",
    status: "Want to Read",
    cover:
      "https://books.google.com/books/content?id=6yVdEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl",
  },
];

function App() {
  return (
    <div className="shelflife-app">
      <header className="site-header">
        <a className="brand" href="/" aria-label="ShelfLife home">
          <span className="brand-mark">S</span>
          <span>ShelfLife</span>
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          <a className="nav-link active" href="/">
            Discover
          </a>
          <a className="nav-link" href="#shelf">
            My Shelf
          </a>
          <a className="nav-link" href="#reading">
            Reading
          </a>
          <a className="nav-link" href="#statistics">
            Statistics
          </a>
        </nav>

        <button className="account-button" type="button">
          <span className="account-avatar">R</span>
          <span>My Account</span>
        </button>
      </header>

      <main>
        <section className="discover-hero">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              YOUR READING SPACE
            </span>

            <h1>
              Find your next
              <em> favourite story.</em>
            </h1>

            <p className="hero-description">
              Discover books worth remembering, keep your reading life
              organised, and make every page part of your journey.
            </p>

            <div className="hero-search">
              <span className="search-icon" aria-hidden="true">
                ⌕
              </span>

              <input
                type="search"
                placeholder="Search by title, author, or subject..."
                aria-label="Search books"
              />

              <button type="button">Search</button>
            </div>

            <div className="popular-searches">
              <span>Explore:</span>
              <button type="button">Fiction</button>
              <button type="button">Self-development</button>
              <button type="button">Classics</button>
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />

            <div className="floating-note note-top">
              <span>READ</span>
              <strong>
                something
                <br />
                worth keeping.
              </strong>
            </div>

            <div className="hero-book">
              <div className="book-spine" />
              <div className="book-cover">
                <span className="book-cover-small">A SHELFLIFE</span>
                <strong>
                  quiet
                  <br />
                  pages
                </strong>
                <span className="book-cover-line" />
                <small>YOUR READING JOURNEY</small>
              </div>
            </div>

            <div className="floating-note note-bottom">
              <span>01</span>
              <strong>DISCOVER</strong>
            </div>
          </div>
        </section>

        <section className="content-section" id="discover">
          <div className="section-heading">
            <div>
              <span className="section-kicker">CURATED FOR YOU</span>
              <h2>Books to get lost in.</h2>
            </div>

            <button className="text-button" type="button">
              View all <span>→</span>
            </button>
          </div>

          <div className="book-grid">
            {featuredBooks.map((book) => (
              <article className="book-card" key={book.title}>
                <div className="book-cover-wrap">
                  <img src={book.cover} alt={`${book.title} cover`} />

                  <span className="book-status">{book.status}</span>

                  <button
                    className="save-button"
                    type="button"
                    aria-label={`Save ${book.title}`}
                  >
                    +
                  </button>
                </div>

                <div className="book-info">
                  <span className="book-category">{book.category}</span>
                  <h3>{book.title}</h3>
                  <p>{book.author}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="journey-section">
          <div className="journey-intro">
            <span className="section-kicker">THE SHELFLIFE JOURNEY</span>
            <h2>
              From the first page
              <br />
              to the last thought.
            </h2>
          </div>

          <div className="journey-steps">
            <div className="journey-step">
              <span>01</span>
              <strong>Discover</strong>
              <p>Find stories that spark your curiosity.</p>
            </div>

            <div className="journey-step">
              <span>02</span>
              <strong>Save</strong>
              <p>Keep promising reads close at hand.</p>
            </div>

            <div className="journey-step">
              <span>03</span>
              <strong>Read</strong>
              <p>Track where you are, one page at a time.</p>
            </div>

            <div className="journey-step">
              <span>04</span>
              <strong>Reflect</strong>
              <p>Capture what stayed with you.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <span className="brand-mark">S</span>
          <span>ShelfLife</span>
        </div>

        <p>Your personal space for books worth remembering.</p>

        <span className="footer-year">2026</span>
      </footer>
    </div>
  );
}

export default App;
