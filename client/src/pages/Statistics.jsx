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
            Authorization: "Bearer " + token,
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

  const plural = (count, singular) => (count === 1 ? singular : singular + "s");

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
            {stats.totalBooks === 0 ? (
              <div className="stats-narrative">
                <p>
                  Your shelf is empty for now. Once you start adding books, this
                  page will fill in with a picture of your reading journey.
                </p>
              </div>
            ) : (
              <>
                <section className="stats-headline">
                  <span className="stats-headline-number">
                    {stats.totalBooks}
                  </span>
                  <span className="stats-headline-label">
                    {plural(stats.totalBooks, "book")} on your shelf
                  </span>
                </section>

                <section className="stats-narrative">
                  <p>
                    {stats.readCount > 0 ? (
                      <>
                        You've finished <strong>{stats.readCount}</strong> of
                        them
                        {stats.totalPagesRead > 0 && (
                          <>
                            {" "}
                            —{" "}
                            <strong>
                              {stats.totalPagesRead.toLocaleString()}
                            </strong>{" "}
                            pages in total.
                          </>
                        )}
                        {stats.totalPagesRead === 0 && "."}
                      </>
                    ) : (
                      "You haven't finished a book yet, but every shelf starts somewhere."
                    )}
                  </p>

                  {stats.currentlyReadingCount > 0 && (
                    <p>
                      Right now you're partway through{" "}
                      <strong>{stats.currentlyReadingCount}</strong>{" "}
                      {plural(stats.currentlyReadingCount, "book")}
                      {stats.pagesInProgress > 0 && (
                        <>
                          , with{" "}
                          <strong>
                            {stats.pagesInProgress.toLocaleString()}
                          </strong>{" "}
                          pages read across them
                        </>
                      )}
                      .
                    </p>
                  )}

                  {stats.wantToReadCount > 0 && (
                    <p>
                      There are <strong>{stats.wantToReadCount}</strong>{" "}
                      {plural(stats.wantToReadCount, "book")} still waiting on
                      your want-to-read list.
                    </p>
                  )}

                  {stats.averageRating !== null && (
                    <p>
                      Across the books you've rated, you've given an average of{" "}
                      <strong>{stats.averageRating.toFixed(1)}</strong> out of 5
                      stars
                      {stats.ratedCount > 0 && (
                        <>
                          {" "}
                          ({stats.ratedCount}{" "}
                          {plural(stats.ratedCount, "rating")}).
                        </>
                      )}
                    </p>
                  )}
                </section>
              </>
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

export default Statistics;
