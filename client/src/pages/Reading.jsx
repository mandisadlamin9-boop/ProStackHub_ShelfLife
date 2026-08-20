import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Loader from "../components/Loader";
import { API_URL } from "../config/api";

function Reading() {
  const [shelfItems, setShelfItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const loadReading = async () => {
      const token = localStorage.getItem("shelflifeToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/shelf?status=currently_reading`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Unable to load your reading list.");
        }

        const data = await response.json();

        setShelfItems(data.shelfItems || []);
      } catch (err) {
        console.error("Load reading list error:", err);
        setError("We couldn't load your reading list. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadReading();
  }, []);

  return (
    <div className="shelf-life">
      <Header />

      <main className="discover-page">
        <section className="shelf-hero">
          <span className="shelf-hero-kicker">READING</span>
          <h1 className="shelf-hero-heading">What you're reading now.</h1>
          <p className="shelf-hero-subheading">
            Every book currently in progress, with your latest page and percent
            complete.
          </p>
        </section>

        {!isLoggedIn && (
          <div className="books-state error-state">
            <p>Please sign in to view your reading list.</p>
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
          <section className="books-section">
            <div className="books-heading">
              <div>
                <span className="section-kicker">IN PROGRESS</span>
                <h2>Currently Reading</h2>
              </div>

              <span className="book-count">{shelfItems.length} books</span>
            </div>

            {shelfItems.length === 0 ? (
              <p className="shelf-empty">
                You're not currently reading anything. Head to your{" "}
                <Link to="/my-shelf">shelf</Link> to start a book.
              </p>
            ) : (
              <div className="book-grid">
                {shelfItems.map((item) => {
                  const progressPercent =
                    item.TotalPages > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (item.CurrentPage / item.TotalPages) * 100,
                          ),
                        )
                      : 0;

                  return (
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

                        {item.TotalPages > 0 ? (
                          <>
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>

                            <p className="progress-label">
                              {progressPercent}% · Page {item.CurrentPage} of{" "}
                              {item.TotalPages}
                            </p>
                          </>
                        ) : (
                          <span className="book-year">
                            Page {item.CurrentPage}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="shell-footer">
        <span>© 2026 ShelfLife</span>
        <span>A personal space for better reading.</span>
      </footer>
    </div>
  );
}

export default Reading;
