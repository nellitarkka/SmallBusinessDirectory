import { useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../auth/AuthContext";
import "./CustomerProfilePage.css";

const CustomerProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || ""); // not editable here
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateProfile({
      name,
      // password is not stored anywhere real, but we simulate update
    });

    setPassword("");
    setStatusMessage("Profile updated successfully (demo only).");
  };

  return (
    <div className="profile-page-root">
      <Navbar />

      <main className="profile-main">
        <header className="profile-header">
          <h1>My Profile</h1>
          <p>Update your account information below.</p>
        </header>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-field">
            <label>Name</label>
            <input
              type="text"
              className="profile-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="profile-field">
            <label>Email</label>
            <input
              type="email"
              className="profile-input"
              value={email}
              disabled
            />
            <small className="profile-hint">
              Email cannot change rn
            </small>
          </div>

          <div className="profile-field">
            <label>New Password</label>
            <input
              type="password"
              className="profile-input"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {statusMessage && (
            <p className="profile-status">{statusMessage}</p>
          )}

          <button type="submit" className="profile-save-btn">
            Save Changes
          </button>
        </form>
      </main>
    </div>
  );
};

export default CustomerProfilePage;
