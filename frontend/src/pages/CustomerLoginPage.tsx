// src/pages/CustomerLoginPage.tsx
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./AuthPage.css";
import { useAuth } from "../auth/AuthContext";

const CustomerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsCustomer } = useAuth();   // <- from AuthContext
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // TODO: replace with real auth later
    console.log("Customer login:", { email, password });

    
    loginAsCustomer(email);

    // go to customer dashboard
    navigate("/customer/dashboard");
  };

  return (
    <div className="auth-page-root">
      <Navbar />

      <main className="auth-main">
        <section className="auth-card">
          <h1 className="auth-title">Customer Login</h1>
          <p className="auth-subtitle">
            Log in to browse vendors, save your favourites, and contact them.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="auth-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-button">
              Login
            </button>
          </form>

          <div className="auth-footer">
            <span>Don&apos;t have an account?</span>
            <button
              className="auth-link-button"
              type="button"
              onClick={() => navigate("/signup/customer")}
            >
              Sign up as customer
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CustomerLoginPage;
