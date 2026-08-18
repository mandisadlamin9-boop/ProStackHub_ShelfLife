import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import CaptchaModal from "../components/CaptchaModal";

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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [captchaModalOpen, setCaptchaModalOpen] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleSubmit(e) {
    e.preventDefault();

    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }

    setError("");
    setCaptchaModalOpen(true);
  }

  async function doLogin() {
    setSubmitting(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Couldn't sign in. Check your details and try again.",
        );
      }

      login(data.token, data.account);
      navigate("/");
    } catch (err) {
      setError(
        err.message || "Couldn't sign in. Check your details and try again.",
      );
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
          <h1 className="login-heading">Welcome back to your shelf</h1>
          <p className="login-subheading">
            Continue discovering books and tracking your reading.
          </p>

          {location.state?.registered && (
            <p className="login-success">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3f6848"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Account created. Sign in to continue.
            </p>
          )}

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <label className="login-label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@email.com"
            />

            <label className="login-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />

            {error && <p className="login-error">{error}</p>}

            <button
              type="submit"
              className="login-button"
              disabled={submitting}
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="login-footer-link">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>

      {captchaModalOpen && (
        <CaptchaModal
          onClose={() => setCaptchaModalOpen(false)}
          onVerified={() => {
            setCaptchaModalOpen(false);
            doLogin();
          }}
        />
      )}
    </div>
  );
}
