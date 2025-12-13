import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./AuthPage.css";
import { useAuth } from "../auth/AuthContext";


const VendorLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      console.log("Vendor logged in:", email);
      navigate("/vendor/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    }
  };

  return (
    <div className="auth-page-root">
      <Navbar />

      <main className="auth-main">
        <section className="auth-card">
          <h1 className="auth-title">Vendor Login</h1>
          <p className="auth-subtitle">
            Log in to manage your listings and connect with customers.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="vendor-email">
                Email
              </label>
              <input
                id="vendor-email"
                type="email"
                className="auth-input"
                placeholder="vendor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="vendor-password">
                Password
              </label>
              <input
                id="vendor-password"
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="auth-footer">
            <span>Don&apos;t have a vendor account?</span>
            <button
              className="auth-link-button"
              type="button"
              onClick={() => navigate("/signup/vendor")}
            >
              Sign up as vendor
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default VendorLoginPage;
