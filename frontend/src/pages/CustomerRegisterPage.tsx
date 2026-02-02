import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./AuthPage.css";
import { useAuth } from "../auth/AuthContext";

const CustomerRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");

  const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
  
    const pErr = validatePassword(password);
    setPasswordError(pErr);
    if (pErr) return;
  
    const cErr = confirmPassword && confirmPassword !== password ? "Passwords do not match." : "";
    setConfirmError(cErr);
    if (cErr) return;
  
    const fnErr = validateName(firstName, "First name");
    const lnErr = validateName(lastName, "Last name");
    setFirstNameError(fnErr);
    setLastNameError(lnErr);
    if (fnErr || lnErr) return;
  
    const eErr = validateEmail(email);
    setEmailError(eErr);
    if (eErr) return;
  
    try {
      await register({
        email,
        password,
        firstName,
        lastName,
        role: "customer",
      });
      navigate("/customer/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };
  

  const validateEmail = (value: string) => {
    if (!value) return "Email is required.";
    // simple email check (good enough for frontend)
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    return ok ? "" : "Please enter a valid email address.";
  };

  const validatePassword = (value: string) => {
    if (!value) return "Password is required.";
    if (!passwordPolicy.test(value))
      return "Min 8 chars + 1 uppercase + 1 lowercase + 1 number.";
    return "";
  };
  
  const validateName = (value: string, label: string) => {
    const trimmed = value.trim();
    if (!trimmed) return `${label} is required.`;
    // letters (incl. accents) + space + apostrophe + hyphen
    const ok = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(trimmed);
    return ok ? "" : `${label} should not include numbers or special characters.`;
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
              <label className="auth-label" htmlFor="customer-first-name">
                First Name
              </label>
              <input
                id="customer-first-name"
                type="text"
                className="auth-input"
                placeholder="Your first name"
                value={firstName}
                onChange={(e) => {
                  const v = e.target.value;
                  setFirstName(v);
                  setFirstNameError(validateName(v, "First name"));
                  setError("");
                }}
                required
              />
              {firstNameError && <p className="auth-field-error">{firstNameError}</p>}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="customer-last-name">
                Last Name
              </label>
              <input
                id="customer-last-name"
                type="text"
                className="auth-input"
                placeholder="Your last name"
                value={lastName}
                onChange={(e) => {
                  const v = e.target.value;
                  setLastName(v);
                  setLastNameError(validateName(v, "Last name"));
                  setError("");
                }}
                required
              />
              {lastNameError && <p className="auth-field-error">{lastNameError}</p>}
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
                onChange={(e) => {
                  const v = e.target.value;
                  setEmail(v);
                  setEmailError(validateEmail(v));
                  setError("");
                }}
                required
              />
              {emailError && <p className="auth-field-error">{emailError}</p>}
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
                onChange={(e) => {
                  const v = e.target.value;
                  setPassword(v);
                  setPasswordError(validatePassword(v));
                  setError("")
                }}                
                required
              />
              {passwordError && <p className="auth-field-error">{passwordError}</p>}
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
                onChange={(e) => {
                  const v = e.target.value;
                  setConfirmPassword(v);
                  setConfirmError(v && v !== password ? "Passwords do not match." : "");
                  setError("")
                }}                
                required
              />
              {confirmError && <p className="auth-field-error">{confirmError}</p>}
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
