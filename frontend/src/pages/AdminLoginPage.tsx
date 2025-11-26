// src/pages/AdminLoginPage.tsx
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./AuthPage.css";
import { mockUsers } from "../auth/mockAuth";   // <- no .ts at the end needed
import { useAuth } from "../auth/AuthContext";

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsAdmin } = useAuth();
  const [email, setEmail] = useState("admin@localvendorhub.com"); // prefill for demo
  const [password, setPassword] = useState("admin123");           // prefill for demo
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // find matching admin in the mockUsers list
    const adminUser = mockUsers.find(
      (user) =>
        user.email === email &&
        user.password === password &&
        user.role === "admin"
    );

    if (!adminUser) {
      setError("Invalid admin credentials.");
      return;
    }

    console.log("Admin logged in:", adminUser);

    // ✅ use adminUser here, not mockUser
    loginAsAdmin(adminUser.email);

    navigate("/admin/dashboard");
  };

  return (
    <div className="auth-page-root">
      <Navbar />

      <main className="auth-main">
        <section className="auth-card">
          <h1 className="auth-title">Admin Login</h1>
          <p className="auth-subtitle">
            Administrative access for managing users and vendor listings.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="admin-email">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                className="auth-input"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="admin-password">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-button">
              Login
            </button>
          </form>

          <div className="auth-footer">
            <span>Admin access only.</span>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminLoginPage;
