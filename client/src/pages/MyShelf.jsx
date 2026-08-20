import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Loader from "../components/Loader";
import { API_URL } from "../config/api";

const SECTION_ACCENTS = {
  "Currently Reading": "#EF9F27",
  "Want to Read": "#5DCAA5",
  Read: "#D4537E",
};

function MyShelf() {
  const [shelfItems, setShelfItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const loadShelf = async () => {
      const token = localStorage.getItem("shelflifeToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/shelf`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unable to load your shelf.");
        }

        const data = await response.json();

        setShelfItems(data.shelfItems || []);
      } catch (err) {
        console.error("Load shelf error:", err);
        setError("We couldn't load your shelf. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadShelf();
  }, []);

  const wantToRead = shelfItems.filter(
    (item) => item.Status === "want_to_read",
  );
  const currentlyReading = shelfItems.filter(
    (item) => item.Status === "currently_reading",
  );
  const read = shelfItems.filter((item) => item.Status === "read");

  const renderShelfSection = (title, items) => (
    <section className="books-section">
      <div className="books-heading">
        <div>
          <span
            className="section-kicker"
            style={{ color: SECTION_ACCENTS[title] }}
          >
            {title.toUpperCase()}
          </span>
          <h2>{title}</h2>
        </div>

        <span className="book-count">{items.length} books</span>
      </div>

      {items.length === 0 ? (
        <p className="shelf-empty">
          No books here yet. <Link to="/">Browse books</Link> to add some.
        </p>
      ) : (
        <div className="book-grid">
          {items.map((item) => (
            <Link
              to={`/shelf/${item.ShelfItemId}`}
              className="book-card"
              key={item.ShelfItemId}
            >
              <div className="book-cover">
                {item.CoverUrl ? (
                  <img
                    src={item.CoverUrl}
                    alt={`Cover of ${item.Title}`}
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
                <h3>{item.Title}</h3>
                <p className="book-author">{item.Author}</p>

                {item.Status === "currently_reading" && item.TotalPages > 0 && (
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            (item.CurrentPage / item.TotalPages) * 100,
                          ),
                        )}%`,
                      }}
                    />
                  </div>
                )}

                {item.Status === "read" && item.Rating && (
                  <span className="book-year">
                    {"★".repeat(item.Rating)}
                    {"☆".repeat(5 - item.Rating)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="shelf-life">
      <Header />

      <main className="discover-page">
        <section className="shelf-hero">
          <span className="shelf-hero-kicker">MY SHELF</span>
          <h1 className="shelf-hero-heading">Your personal library.</h1>
          <p className="shelf-hero-subheading">
            Every book you've saved, organized by where you are in your reading
            journey.
          </p>
        </section>

        {!isLoggedIn && (
          <div className="books-state error-state">
            <p>Please sign in to view your shelf.</p>
          </div>
        )}

        {isLoggedIn && loading && (
          <div className="books-state">
            <Loader label="Loading books..." />
          </div>
        )}

        {isLoggedIn && !loading && error && (
          <div className="books-state error-state">
            <p>{error}</p>
          </div>
        )}

        {isLoggedIn && !loading && !error && (
          <>
            {renderShelfSection("Currently Reading", currentlyReading)}
            {renderShelfSection("Want to Read", wantToRead)}
            {renderShelfSection("Read", read)}
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

export default MyShelf;
