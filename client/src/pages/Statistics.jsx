import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Loader from "../components/Loader";
import { API_URL } from "../config/api";

const STATUS_META = [
  { key: "wantToReadCount", label: "Want to Read", color: "var(--teal)" },
  {
    key: "currentlyReadingCount",
    label: "Currently Reading",
    color: "var(--amber)",
  },
  { key: "readCount", label: "Read", color: "var(--pink)" },
];

function StatusDonut({ stats }) {
  const total =
    stats.wantToReadCount + stats.currentlyReadingCount + stats.readCount;

  if (total === 0) return null;

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let offsetSoFar = 0;

  const segments = STATUS_META.map((meta) => {
    const count = stats[meta.key];
    const fraction = count / total;
    const dash = fraction * circumference;
    const segment = {
      ...meta,
      count,
      dashArray: `${dash} ${circumference - dash}`,
      dashOffset: -offsetSoFar,
    };
    offsetSoFar += dash;
    return segment;
  });

  return (
    <div className="stats-donut-block">
      <svg viewBox="0 0 180 180" className="stats-donut">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="var(--paper)"
          strokeWidth="22"
        />
        {segments.map(
          (segment) =>
            segment.count > 0 && (
              <circle
                key={segment.label}
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth="22"
                strokeDasharray={segment.dashArray}
                strokeDashoffset={segment.dashOffset}
                transform="rotate(-90 90 90)"
                strokeLinecap="butt"
              />
            ),
        )}
        <text x="90" y="84" textAnchor="middle" className="stats-donut-number">
          {total}
        </text>
        <text
          x="90"
          y="104"
          textAnchor="middle"
          className="stats-donut-caption"
        >
          books
        </text>
      </svg>

      <ul className="stats-donut-legend">
        {STATUS_META.map((meta) => (
          <li key={meta.label}>
            <span
              className="stats-donut-swatch"
              style={{ background: meta.color }}
            />
            <span className="stats-donut-legend-label">{meta.label}</span>
            <span className="stats-donut-legend-count">{stats[meta.key]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RatingBar({ averageRating, ratedCount }) {
  if (averageRating === null) return null;

  const percent = (averageRating / 5) * 100;

  return (
    <div className="stats-rating-block">
      <div className="stats-rating-top">
        <span className="stats-rating-number">{averageRating.toFixed(1)}</span>
        <span className="stats-rating-out-of">/ 5 average rating</span>
      </div>

      <div className="stats-rating-bar">
        <div className="stats-rating-fill" style={{ width: `${percent}%` }} />
      </div>

      <p className="stats-rating-caption">
        Based on {ratedCount} {ratedCount === 1 ? "rating" : "ratings"}
      </p>
    </div>
  );
}

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

        const response = await fetch(`${API_URL}/api/shelf/stats`, {
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
        <section className="shelf-hero">
          <span className="shelf-hero-kicker">STATISTICS</span>
          <h1 className="shelf-hero-heading">Your reading journey.</h1>
          <p className="shelf-hero-subheading">
            A look at what you've read, what you're reading, and how it adds up.
          </p>
        </section>

        {!isLoggedIn && (
          <div className="books-state error-state">
            <p>Please sign in to view your statistics.</p>
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
                <section className="stats-charts">
                  <StatusDonut stats={stats} />
                  <RatingBar
                    averageRating={stats.averageRating}
                    ratedCount={stats.ratedCount}
                  />

                  <div className="stats-metric-cards">
                    {stats.totalPagesRead > 0 && (
                      <div className="stats-metric-card" data-accent="violet">
                        <span className="stats-metric-number">
                          {stats.totalPagesRead.toLocaleString()}
                        </span>
                        <span className="stats-metric-label">
                          pages read across finished books
                        </span>
                      </div>
                    )}

                    {stats.currentlyReadingCount > 0 &&
                      stats.pagesInProgress > 0 && (
                        <div className="stats-metric-card" data-accent="amber">
                          <span className="stats-metric-number">
                            {stats.pagesInProgress.toLocaleString()}
                          </span>
                          <span className="stats-metric-label">
                            pages into books open right now
                          </span>
                        </div>
                      )}

                    {stats.readCount === 0 && (
                      <p className="stats-empty-note">
                        You haven't finished a book yet, but every shelf starts
                        somewhere.
                      </p>
                    )}
                  </div>
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
