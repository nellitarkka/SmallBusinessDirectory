import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./AuthPage.css";
import { useAuth } from "../auth/AuthContext";

const VendorRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [businessError, setBusinessError] = useState("");
  const [cityError, setCityError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");



  const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
  
    if (!passwordPolicy.test(password)) {
      setError(
        "Password must be at least 8 characters and include 1 uppercase letter, 1 lowercase letter, and 1 number."
      );
      return;
    }
  
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
  
    const fnErr = validateName(firstName, "First name");
    const lnErr = validateName(lastName, "Last name");
    setFirstNameError(fnErr);
    setLastNameError(lnErr);
    if (fnErr || lnErr) return;
  
    const eErr = validateEmail(email);
    setEmailError(eErr);
    if (eErr) return;
  
    const bErr = businessName.trim() ? "" : "Business name is required.";
    const cErr = city.trim() ? "" : "City is required.";
    setBusinessError(bErr);
    setCityError(cErr);
    if (bErr || cErr) return;
  
    try {
      await register({
        email,
        password,
        firstName,
        lastName,
        businessName,
        city,
        vatNumber,
        role: "vendor",
      });
      navigate("/vendor/dashboard");
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
          <h1 className="auth-title">Vendor Sign Up</h1>
          <p className="auth-subtitle">
            Create a vendor account to list your business and share offers.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="vendor-first-name">
                First Name
              </label>
              <input
                id="vendor-first-name"
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
              <label className="auth-label" htmlFor="vendor-last-name">
                Last Name
              </label>
              <input
                id="vendor-last-name"
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
              <label className="auth-label" htmlFor="vendor-business-name">
                Business Name
              </label>
              <input
                id="vendor-business-name"
                type="text"
                className="auth-input"
                placeholder="Your business name"
                value={businessName}
                onChange={(e) => {
                  const v = e.target.value;
                  setBusinessName(v);
                  setBusinessError(v.trim() ? "" : "Business name is required.");
                  setError("")
                }}
                required
              />
              {businessError && <p className="auth-field-error">{businessError}</p>}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="vendor-city">
                City
              </label>
              <input
                id="vendor-city"
                type="text"
                className="auth-input"
                placeholder="City of operation"
                value={city}
                onChange={(e) => {
                  const v = e.target.value;
                  setCity(v);
                  setCityError(v.trim() ? "" : "City is required.");
                  setError("")
                }}                
                required
              />
              {cityError && <p className="auth-field-error">{cityError}</p>}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="vendor-vat-number">
                VAT Number
              </label>
              <input
                id="vendor-vat-number"
                type="text"
                className="auth-input"
                placeholder="VAT / Tax ID"
                value={vatNumber}
                onChange={(e) => setVatNumber(e.target.value)}
              />
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
              <label className="auth-label" htmlFor="vendor-password">
                Password
              </label>
              <input
                id="vendor-password"
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
              <label
                className="auth-label"
                htmlFor="vendor-confirm-password"
              >
                Confirm Password
              </label>
              <input
                id="vendor-confirm-password"
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
