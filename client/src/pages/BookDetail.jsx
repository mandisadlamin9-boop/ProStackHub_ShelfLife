import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";

function BookDetail() {
  const { shelfItemId } = useParams();
  const navigate = useNavigate();

  const [shelfItem, setShelfItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState("");
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const token = localStorage.getItem("shelflifeToken");

  const loadShelfItem = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/shelf/${shelfItemId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Unable to load this book.");
      }

      const data = await response.json();

      setShelfItem(data.shelfItem);
      setCurrentPage(data.shelfItem.CurrentPage || 0);
      setRating(data.shelfItem.Rating || 0);
      setReview(data.shelfItem.Review || "");
    } catch (err) {
      console.error("Load shelf item error:", err);
      setError("We couldn't load this book. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShelfItem();
  }, [shelfItemId]);

  const updateShelfItem = async (updates) => {
    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/shelf/${shelfItemId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        },
      );

      if (!response.ok) {
        throw new Error("Unable to update this book.");
      }

      const data = await response.json();

      setShelfItem(data.shelfItem);
    } catch (err) {
      console.error("Update shelf item error:", err);
      setError("We couldn't save your changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    updateShelfItem({ status: newStatus });
  };

  const handleProgressSave = (event) => {
    event.preventDefault();

    let pageNumber = parseInt(currentPage, 10);

    if (Number.isNaN(pageNumber) || pageNumber < 0) {
      return;
    }

    if (shelfItem.TotalPages > 0 && pageNumber > shelfItem.TotalPages) {
      pageNumber = shelfItem.TotalPages;
    }

    updateShelfItem({ currentPage: pageNumber });
  };

  const handleReviewSave = (event) => {
    event.preventDefault();

    updateShelfItem({ rating, review });
  };

  const handleRemove = async () => {
    const confirmed = window.confirm(
      "Remove this book from your shelf? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/shelf/${shelfItemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Unable to remove this book.");
      }

      navigate("/my-shelf");
    } catch (err) {
      console.error("Remove shelf item error:", err);
      setError("We couldn't remove this book. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="shelf-life">
        <Header />
        <main className="discover-page">
          <div className="books-state">
            <div className="loader" />
            <p>Loading book...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && !shelfItem) {
    return (
      <div className="shelf-life">
        <Header />
        <main className="discover-page">
          <div className="books-state error-state">
            <p>{error}</p>
            <Link to="/my-shelf">Back to My Shelf</Link>
          </div>
        </main>
      </div>
    );
  }

  if (!shelfItem) {
    return null;
  }

  const progressPercent =
    shelfItem.TotalPages > 0
      ? Math.min(
          100,
          Math.round((shelfItem.CurrentPage / shelfItem.TotalPages) * 100),
        )
      : 0;

  const previewUrl = shelfItem.Isbn
    ? "https://books.google.com/books?isbn=" + shelfItem.Isbn
    : null;

  return (
    <div className="shelf-life">
      <Header />

      <main className="discover-page">
        <section className="discover-header">
          <Link to="/my-shelf" className="login-back">
            Back to My Shelf
          </Link>
        </section>

        <section className="book-detail">
          <div className="book-detail-cover">
            {shelfItem.CoverUrl ? (
              <img
                src={shelfItem.CoverUrl}
                alt={"Cover of " + shelfItem.Title}
              />
            ) : (
              <div className="no-cover">
                <span>ShelfLife</span>
                <strong>No Cover</strong>
              </div>
            )}
          </div>

          <div className="book-detail-information">
            <h1>{shelfItem.Title}</h1>
            <p className="book-author">{shelfItem.Author}</p>

            {shelfItem.Isbn && (
              <p className="book-year">
                {"ISBN: " + shelfItem.Isbn}
                {previewUrl && (
                  <>
                    {" — "}

                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="preview-link"
                    >
                      Preview on Google Books
                    </a>
                  </>
                )}
              </p>
            )}

            <div className="status-controls">
              <span className="section-kicker">READING STATUS</span>

              <div className="status-buttons">
                <button
                  className={
                    shelfItem.Status === "want_to_read"
                      ? "shelf-button added"
                      : "shelf-button"
                  }
                  onClick={() => handleStatusChange("want_to_read")}
                  disabled={saving}
                >
                  Want to Read
                </button>

                <button
                  className={
                    shelfItem.Status === "currently_reading"
                      ? "shelf-button added"
                      : "shelf-button"
                  }
                  onClick={() => handleStatusChange("currently_reading")}
                  disabled={saving}
                >
                  Currently Reading
                </button>

                <button
                  className={
                    shelfItem.Status === "read"
                      ? "shelf-button added"
                      : "shelf-button"
                  }
                  onClick={() => handleStatusChange("read")}
                  disabled={saving}
                >
                  Read
                </button>
              </div>
            </div>

            {shelfItem.Status === "currently_reading" && (
              <div className="progress-controls">
                <span className="section-kicker">READING PROGRESS</span>

                {shelfItem.TotalPages > 0 && (
                  <>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: progressPercent + "%" }}
                      />
                    </div>

                    <p className="progress-label">
                      {progressPercent}% complete
                      {" · "}
                      Page {shelfItem.CurrentPage} of {shelfItem.TotalPages}
                    </p>
                  </>
                )}

                <form onSubmit={handleProgressSave} className="progress-form">
                  <input
                    type="number"
                    min="0"
                    max={shelfItem.TotalPages || undefined}
                    value={currentPage}
                    onChange={(event) => setCurrentPage(event.target.value)}
                    placeholder="Current page"
                  />

                  <button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Update Progress"}
                  </button>
                </form>
              </div>
            )}

            {shelfItem.Status === "read" && (
              <div className="review-controls">
                <span className="section-kicker">YOUR RATING & REVIEW</span>

                <form onSubmit={handleReviewSave} className="review-form">
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        className={star <= rating ? "star filled" : "star"}
                        onClick={() => setRating(star)}
                        aria-label={"Rate " + star + " stars"}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={review}
                    onChange={(event) => setReview(event.target.value)}
                    placeholder="Write your thoughts on this book..."
                    rows={5}
                  />

                  <button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Review"}
                  </button>
                </form>
              </div>
            )}

            {error && (
              <p className="login-error" role="alert" style={{ marginTop: 20 }}>
                {error}
              </p>
            )}

            <button className="remove-button" onClick={handleRemove}>
              Remove from Shelf
            </button>
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

export default BookDetail;
