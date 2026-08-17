import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const SHELF_ROWS = [
  [
    "#D4537E",
    "#EF9F27",
    "#5DCAA5",
    "#F0997B",
    "#FAC775",
    "#ED93B1",
    "#9FE1CB",
    "#D85A30",
    "#CECBF6",
    "#5DCAA5",
  ],
  [
    "#F0997B",
    "#ED93B1",
    "#FAC775",
    "#5DCAA5",
    "#D4537E",
    "#9FE1CB",
    "#EF9F27",
    "#CECBF6",
    "#D85A30",
    "#FAC775",
  ],
];

function BookshelfIllustration() {
  return (
    <svg
      viewBox="0 0 220 220"
      role="img"
      aria-hidden="true"
      className="shelf-illustration"
    >
      {SHELF_ROWS.map((row, rowIndex) => {
        const rowY = 20 + rowIndex * 98;
        let x = 10;
        return (
          <g key={rowIndex}>
            <rect x="10" y={rowY} width="200" height="4" fill="#EEEDFE" />
            {row.map((color, i) => {
              const width = 12 + ((i * 7) % 10);
              const rect = (
                <rect
                  key={i}
                  x={x}
                  y={rowY + 4}
                  width={width}
                  height="60"
                  fill={color}
                />
              );
              x += width + 2;
              return rect;
            })}
          </g>
        );
      })}
    </svg>
  );
}

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password) {
      setError("Fill in your name, email and password.");
      return;
    }
    if (fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Couldn't create your account. Try again.",
        );
      }

      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setError(err.message || "Couldn't create your account. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <span
          className="login-confetti login-confetti--sq"
          style={{ top: 14, left: 24, background: "#EF9F27" }}
        />
        <span
          className="login-confetti login-confetti--dot"
          style={{ top: 40, left: 60, background: "#D4537E" }}
        />
        <span
          className="login-confetti login-confetti--sq"
          style={{ top: 20, right: 70, background: "#5DCAA5" }}
        />
        <span
          className="login-confetti login-confetti--dot"
          style={{ bottom: 24, left: 36, background: "#7F77DD" }}
        />

        <div className="login-shelf-panel">
          <BookshelfIllustration />
        </div>

        <div className="login-form-panel">
          <div className="login-wordmark">ShelfLife</div>
          <h1 className="login-heading">Create your shelf</h1>
          <p className="login-subheading">
            Start tracking what you read, one book at a time.
          </p>

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <label className="login-label" htmlFor="register-name">
              Full name
            </label>
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jordan Lee"
            />

            <label className="login-label" htmlFor="register-email">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@email.com"
            />

            <label className="login-label" htmlFor="register-password">
              Password
            </label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />

            {error && <p className="login-error">{error}</p>}

            <button
              type="submit"
              className="login-button"
              disabled={submitting}
            >
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="login-footer-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
