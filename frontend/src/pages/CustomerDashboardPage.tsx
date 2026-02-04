import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { usePublicListings } from "../data/PublicListingsStore";
import { useFavorites } from "../data/FavoritesStore";
import type { Vendor } from "../data/vendors";
import "./CustomerDashboardPage.css";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { useAuth } from "../auth/AuthContext";

const CustomerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");
  const [userEmailVerified, setUserEmailVerified] = useState(true);

  const { listings: vendors } = usePublicListings();
  const { toggleFavorite, isFavorite } = useFavorites();
  
  const normalizedSearch = search.toLowerCase();
  const navigate = useNavigate();

  // Check email verification status on mount
  useEffect(() => {
    const checkEmailVerification = async () => {
      try {
        const profile = await authAPI.getProfile();
        if (profile.data?.user) {
          setUserEmailVerified(profile.data.user.emailVerified !== false);
        }
      } catch (err) {
        console.error("Failed to check email verification:", err);
      }
    };
    checkEmailVerification();
  }, []);

  const handleResendVerification = async () => {
    setIsResendingVerification(true);
    setResendError("");
    setResendMessage("");

    try {
      if (!user?.email) {
        setResendError("Email not found. Please log in again.");
        return;
      }

      const response = await authAPI.resendVerification(user.email);
      if (response.status === 'success') {
        setResendMessage("Verification email sent! Please check your inbox.");
        // Clear message after 5 seconds
        setTimeout(() => setResendMessage(""), 5000);
      } else {
        setResendError(response.message || "Failed to resend verification email");
      }
    } catch (err) {
      setResendError(err instanceof Error ? err.message : "Failed to resend verification email");
    } finally {
      setIsResendingVerification(false);
    }
  };

  const handleViewDetails = (id: Vendor["id"]) => {
    navigate(`/vendors/${id}`);
  };

  const filteredVendors = vendors.filter((vendor) => {
    if (!normalizedSearch) return true;
    const combined = `
      ${vendor.name || ""}
      ${vendor.category || ""}
      ${vendor.location || ""}
      ${vendor.description || ""}
    `.toLowerCase();
    return combined.includes(normalizedSearch);
  });

  return (
    <div className="customer-page-root">
      <Navbar />

      <main className="customer-main">
        <header className="customer-header">
          <div>
            <h1>Customer Dashboard</h1>
            <p>Browse all vendors, view their details, and contact them directly.</p>
          </div>

          <div className="customer-search-wrapper">
            <input
              className="customer-search-input"
              type="text"
              placeholder="Search vendors by name, category, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        {!userEmailVerified && (
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto 1rem auto",
              padding: "0.75rem 1rem",
              borderRadius: 8,
              background: "#d1ecf1",
              border: "1px solid #bee5eb",
              color: "#0c5460",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div>
              <strong>Email not verified.</strong> Verify your email to unlock full messaging features.
              {resendMessage && <p style={{ color: "green", margin: "0.5rem 0 0 0", fontSize: "0.9rem" }}>{resendMessage}</p>}
              {resendError && <p style={{ color: "#0c5460", margin: "0.5rem 0 0 0", fontSize: "0.9rem" }}>{resendError}</p>}
            </div>
            <button
              onClick={handleResendVerification}
              disabled={isResendingVerification}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#0c5460",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: isResendingVerification ? "not-allowed" : "pointer",
                opacity: isResendingVerification ? 0.6 : 1,
                whiteSpace: "nowrap",
                fontSize: "0.9rem",
              }}
            >
              {isResendingVerification ? "Sending..." : "Resend Email"}
            </button>
          </div>
        )}

        <section className="customer-vendors-section">
          {filteredVendors.length === 0 ? (
            <p className="customer-empty-state">No vendors match your search yet.</p>
          ) : (
            <div className="customer-vendor-grid">
              {filteredVendors.map((vendor) => {
                const favorite = isFavorite(Number(vendor.id));

                return (
                  <article key={vendor.id} className="vendor-card">
                    <div className="vendor-card-header">
                      <h2 className="vendor-card-title">{vendor.name}</h2>

                      <button
                        type="button"
                        className={
                          favorite
                            ? "vendor-save-btn vendor-save-btn--active"
                            : "vendor-save-btn"
                        }
                        onClick={() => toggleFavorite(Number(vendor.id))}
                      >
                        {favorite ? "♥ Saved" : "♡ Save"}
                      </button>
                    </div>

                    {vendor.category && (
                      <p className="vendor-card-category">{vendor.category}</p>
                    )}

                    {vendor.location && (
                      <p className="vendor-card-location">{vendor.location}</p>
                    )}

                    {vendor.openingHours && (
                      <p className="vendor-card-hours">{vendor.openingHours}</p>
                    )}

                    {vendor.description && (
                      <p className="vendor-card-description">
                        {vendor.description.length > 140
                          ? vendor.description.slice(0, 140) + "..."
                          : vendor.description}
                      </p>
                    )}

                    {/* ✅ Actions row: View Details */}
                    <div className="customer-card-actions">
                      <button
                        className="vendor-card-btn"
                        onClick={() => handleViewDetails(vendor.id)}
                      >
                        View Details
                      </button>
                    </div>

                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CustomerDashboardPage;
