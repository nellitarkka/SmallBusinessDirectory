import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../auth/AuthContext";
import { authAPI } from "../services/api";
import "./CustomerProfilePage.css";

const CustomerProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState("");
  const email = user?.email || "";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [statusMessage, setStatusMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // keep name in sync if user loads later
  useEffect(() => {
    setName(user?.name || "");
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage("");

    try {
      setIsSaving(true);

      // 1) Update name if changed
      const trimmedName = name.trim();
      const prevName = (user?.name || "").trim();

      if (trimmedName && trimmedName !== prevName) {
        await updateProfile({ name: trimmedName });
      }

      // 2) Change password if any field is filled
      const wantsPasswordChange =
        currentPassword.trim() || newPassword.trim() || confirmPassword.trim();

      if (wantsPasswordChange) {
        if (!currentPassword.trim()) {
          setStatusMessage("Please enter your current password.");
          return;
        }
        if (!newPassword.trim()) {
          setStatusMessage("Please enter a new password.");
          return;
        }
        if (newPassword !== confirmPassword) {
          setStatusMessage("New passwords do not match.");
          return;
        }

        await authAPI.changePassword({
          currentPassword,
          newPassword,
        });

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }

      setStatusMessage("Profile updated successfully.");
    } catch (err: any) {
      setStatusMessage(err?.message || "Update failed.");
    } finally {
      setIsSaving(false);
    }
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
            <input type="email" className="profile-input" value={email} disabled />
            <small className="profile-hint">Email cannot change.</small>
          </div>

          <div className="profile-field">
            <label>Current Password</label>
            <input
              type="password"
              className="profile-input"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="profile-field">
            <label>New Password</label>
            <input
              type="password"
              className="profile-input"
              placeholder="Enter new password (min 8 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="profile-field">
            <label>Confirm New Password</label>
            <input
              type="password"
              className="profile-input"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {statusMessage && <p className="profile-status">{statusMessage}</p>}

          <button type="submit" className="profile-save-btn" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default CustomerProfilePage;
