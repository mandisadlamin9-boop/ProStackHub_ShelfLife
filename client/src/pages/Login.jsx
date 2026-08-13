import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    setLoginError("");

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError("Please enter your email and password.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.message || "Unable to log in.");
        return;
      }

      login(data.token, data.account);

      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setLoginError(
        "Unable to connect to ShelfLife. Please make sure the server is running.",
      );
    }
  };

  return (
    <div className="shelf-life">
      <main className="login-page">
        <section className="login-card">
          <button className="login-back" onClick={() => navigate("/")}>
            ← Back to Discover
          </button>

          <div className="login-brand">
            <span className="brand-mark">
              <span />
              <span />
            </span>

            <span className="brand-name">ShelfLife</span>
          </div>

          <span className="discover-kicker">WELCOME BACK</span>

          <h1>Sign in to your shelf.</h1>

          <p className="login-description">
            Continue discovering books and keeping track of your reading
            journey.
          </p>

          <form className="login-form" onSubmit={handleLogin}>
            <label htmlFor="login-email">Email</label>

            <input
              id="login-email"
              type="email"
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
            />

            <label htmlFor="login-password">Password</label>

            <input
              id="login-password"
              type="password"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />

            {loginError && (
              <p className="login-error" role="alert">
                {loginError}
              </p>
            )}

            <button className="login-submit" type="submit">
              Sign in
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default Login;
