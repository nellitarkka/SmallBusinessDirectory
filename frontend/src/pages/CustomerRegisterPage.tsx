import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./AuthPage.css";

const CustomerRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // TODO: send to backend
    console.log("Customer register:", { name, email, password });

    // after successful registration you might redirect to login
    navigate("/login/customer");
  };

  return (
    <div className="auth-page-root">
      <Navbar />

      <main className="auth-main">
        <section className="auth-card">
          <h1 className="auth-title">Customer Sign Up</h1>
          <p className="auth-subtitle">
            Create a customer account to browse vendors and contact them.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="customer-name">
                Name
              </label>
              <input
                id="customer-name"
                type="text"
                className="auth-input"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="customer-email">
                Email
              </label>
              <input
                id="customer-email"
                type="email"
                className="auth-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="customer-password">
                Password
              </label>
              <input
                id="customer-password"
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="customer-confirm-password">
                Confirm Password
              </label>
              <input
                id="customer-confirm-password"
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-button">
              Create Customer Account
            </button>
          </form>

          <div className="auth-footer">
            <span>Already have an account?</span>
            <button
              className="auth-link-button"
              type="button"
              onClick={() => navigate("/login/customer")}
            >
              Log in as customer
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CustomerRegisterPage;
