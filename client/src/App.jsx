import { useState } from "react";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("Discover");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    {
      label: "Discover",
      icon: "✦",
    },
    {
      label: "My Shelf",
      icon: "▱",
    },
    {
      label: "Reading",
      icon: "◷",
    },
    {
      label: "Statistics",
      icon: "↗",
    },
  ];

  const handleNavigation = (label) => {
    setActivePage(label);
    setMobileMenuOpen(false);
  };

  return (
    <div className="shelf-life">
      <div className="ambient-glow ambient-glow-one" />
      <div className="ambient-glow ambient-glow-two" />

      <header className="topbar">
        <button
          className="brand"
          onClick={() => handleNavigation("Discover")}
          aria-label="Go to ShelfLife Discover"
        >
          <span className="brand-mark">
            <span />
            <span />
          </span>

          <span className="brand-name">ShelfLife</span>
        </button>

        <nav className="desktop-navigation" aria-label="Primary navigation">
          {navigation.map((item) => (
            <button
              key={item.label}
              className={`nav-item ${
                activePage === item.label ? "active" : ""
              }`}
              onClick={() => handleNavigation(item.label)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button
          className="account-button"
          onClick={() => handleNavigation("Account")}
        >
          <span className="account-avatar">S</span>
          <span className="account-label">Account</span>
        </button>

        <button
          className={`mobile-menu-button ${mobileMenuOpen ? "open" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={mobileMenuOpen}
        >
          <span />
          <span />
        </button>
      </header>

      {mobileMenuOpen && (
        <nav className="mobile-navigation" aria-label="Mobile navigation">
          {navigation.map((item) => (
            <button
              key={item.label}
              className={`mobile-nav-item ${
                activePage === item.label ? "active" : ""
              }`}
              onClick={() => handleNavigation(item.label)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}

          <button
            className={`mobile-nav-item ${
              activePage === "Account" ? "active" : ""
            }`}
            onClick={() => handleNavigation("Account")}
          >
            <span>○</span>
            Account
          </button>
        </nav>
      )}

      <main className="shell-content">
        <section className="welcome-section">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            YOUR READING SPACE
          </div>

          <h1>
            Discover something
            <span>worth getting lost in.</span>
          </h1>

          <p className="welcome-copy">
            Explore books, build your shelf, and keep track of the stories that
            stay with you.
          </p>

          <div className="search-preview">
            <span className="search-icon">⌕</span>

            <span className="search-placeholder">
              Search for a book, author, or ISBN...
            </span>

            <span className="search-shortcut">⌘ K</span>
          </div>
        </section>

        <section className="journey-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">THE SHELFLIFE JOURNEY</span>
              <h2>From curiosity to reflection.</h2>
            </div>

            <span className="section-count">01 — 04</span>
          </div>

          <div className="journey-grid">
            <article className="journey-card journey-card-large">
              <span className="journey-number">01</span>

              <div className="journey-visual discovery-visual">
                <div className="floating-book book-one">
                  <span>THE</span>
                  <strong>DISCOVERY</strong>
                </div>

                <div className="floating-book book-two">
                  <span>NEW</span>
                  <strong>CHAPTERS</strong>
                </div>
              </div>

              <div className="journey-content">
                <span>DISCOVER</span>
                <h3>Find your next story.</h3>
                <p>
                  Search an ever-growing world of books and discover something
                  that catches your attention.
                </p>
              </div>
            </article>

            <article className="journey-card">
              <span className="journey-number">02</span>

              <div className="journey-symbol shelf-symbol">
                <span />
                <span />
                <span />
              </div>

              <div className="journey-content">
                <span>SAVE</span>
                <h3>Build a shelf that feels like yours.</h3>
                <p>Keep the books you want to read close at hand.</p>
              </div>
            </article>

            <article className="journey-card">
              <span className="journey-number">03</span>

              <div className="journey-symbol progress-symbol">
                <div>
                  <span />
                </div>
                <strong>68%</strong>
              </div>

              <div className="journey-content">
                <span>READ</span>
                <h3>Make progress, one page at a time.</h3>
                <p>Track where you are without turning reading into a chore.</p>
              </div>
            </article>

            <article className="journey-card">
              <span className="journey-number">04</span>

              <div className="journey-symbol reflection-symbol">
                <span>★★★★★</span>
              </div>

              <div className="journey-content">
                <span>REFLECT</span>
                <h3>Remember what mattered.</h3>
                <p>
                  Rate books, write personal notes, and look back on your
                  reading journey.
                </p>
              </div>
            </article>
          </div>
        </section>
      </main>

      <footer className="shell-footer">
        <span>© 2026 ShelfLife</span>
        <span>A personal space for better reading.</span>
      </footer>
    </div>
  );
}

export default App;
