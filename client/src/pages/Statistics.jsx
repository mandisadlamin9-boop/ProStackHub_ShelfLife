import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";

function Statistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const loadStats = async () => {
      const token = localStorage.getItem("shelflifeToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch("http://localhost:5000/api/shelf/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unable to load statistics.");
        }

        const data = await response.json();

        setStats(data.stats);
      } catch (err) {
        console.error("Load stats error:", err);
        setError("We couldn't load your statistics. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="shelf-life">
      <Header />

      <main className="discover-page">
        <section className="discover-header">
          <div>
            <span className="discover-kicker">STATISTICS</span>
            <h1>Your reading journey.</h1>
            <p>
              A look at what you've read, what you're reading, and how it adds
              up.
            </p>
          </div>
        </section>

        {!isLoggedIn && (
          <div className="books-state error-state">
            <p>Please sign in to view your statistics.</p>
          </div>
        )}

        {isLoggedIn && loading && (
          <div className="books-state">
            <div className="loader" />
            <p>Loading your statistics...</p>
          </div>
        )}

        {isLoggedIn && !loading && error && (
          <div className="books-state error-state">
            <p>{error}</p>
          </div>
        )}

        {isLoggedIn && !loading && !error && stats && (
          <>
            <section className="books-section">
              <div className="books-heading">
                <div>
                  <span className="section-kicker">OVERVIEW</span>
                  <h2>Your shelf at a glance</h2>
                </div>
              </div>

              <div className="stat-grid">
                <div className="stat-item">
                  <span className="stat-value">{stats.totalBooks}</span>
                  <span className="stat-label">Total Books</span>
                </div>

                <div className="stat-item">
                  <span className="stat-value">{stats.readCount}</span>
                  <span className="stat-label">Read</span>
                </div>

                <div className="stat-item">
                  <span className="stat-value">
                    {stats.currentlyReadingCount}
                  </span>
                  <span className="stat-label">Currently Reading</span>
                </div>

                <div className="stat-item">
                  <span className="stat-value">{stats.wantToReadCount}</span>
                  <span className="stat-label">Want to Read</span>
                </div>
              </div>
            </section>

            <section className="books-section">
              <div className="books-heading">
                <div>
                  <span className="section-kicker">PROGRESS</span>
                  <h2>Pages and ratings</h2>
                </div>
              </div>

              <div className="stat-grid">
                <div className="stat-item">
                  <span className="stat-value">
                    {stats.totalPagesRead.toLocaleString()}
                  </span>
                  <span className="stat-label">
                    Pages Read (Completed Books)
                  </span>
                </div>

                <div className="stat-item">
                  <span className="stat-value">
                    {stats.pagesInProgress.toLocaleString()}
                  </span>
                  <span className="stat-label">Pages Read (In Progress)</span>
                </div>

                <div className="stat-item">
                  <span className="stat-value">
                    {stats.averageRating !== null
                      ? stats.averageRating.toFixed(1)
                      : "—"}
                  </span>
                  <span className="stat-label">
                    Average Rating
                    {stats.ratedCount > 0 &&
                      ` (${stats.ratedCount} book${
                        stats.ratedCount === 1 ? "" : "s"
                      })`}
                  </span>
                </div>
              </div>
            </section>
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

export default Statistics;
