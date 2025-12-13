import { type FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./AuthPage.css";
import { useAuth } from "../auth/AuthContext";

const VendorRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const [businessName, setBusinessName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const VAT_ALLOWED = useMemo(() => /^[A-Za-z0-9 .\-_/]+$/, []);
  const normalizeVat = (value: string) => value.trim().toUpperCase();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const normalizedVat = normalizeVat(vatNumber);

    if (!normalizedVat) {
      setError("VAT / Tax number is required.");
      return;
    }
    if (normalizedVat.length < 6) {
      setError("VAT / Tax number looks too short (min 6 characters).");
      return;
    }
    if (!VAT_ALLOWED.test(normalizedVat)) {
      setError("VAT / Tax number contains invalid characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await register({
        email,
        password,
        firstName: businessName.split(" ")[0] || businessName,
        lastName: businessName.split(" ").slice(1).join(" ") || "",
        role: "vendor",
        businessName,

      });

      navigate("/vendor/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  return (
    <div className="auth-page-root">
      <Navbar />

      <main className="auth-main">
        <section className="auth-card">
          <h1 className="auth-title">Vendor Sign Up</h1>
          <p className="auth-subtitle">
            Create a vendor account to list your business and share offers.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="vendor-business-name">
                Business Name
              </label>
              <input
                id="vendor-business-name"
                type="text"
                className="auth-input"
                placeholder="Your business name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />
            </div>

            {/* VAT field (added) */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="vendor-vat">
                VAT / Tax Number
              </label>
              <input
                id="vendor-vat"
                type="text"
                className="auth-input"
                placeholder="e.g., NL123456789B01"
                value={vatNumber}
                onChange={(e) => setVatNumber(e.target.value)}
                required
                inputMode="text"
                autoComplete="off"
              />
              <small className="auth-hint">
                We use this for verification and invoicing (if applicable).
              </small>
            </div>

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

            <div className="auth-field">
              <label className="auth-label" htmlFor="vendor-confirm-password">
                Confirm Password
              </label>
              <input
                id="vendor-confirm-password"
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Vendor Account"}
            </button>
          </form>

          <div className="auth-footer">
            <span>Already have a vendor account?</span>
            <button
              className="auth-link-button"
              type="button"
              onClick={() => navigate("/login/vendor")}
            >
              Log in as vendor
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default VendorRegisterPage;
