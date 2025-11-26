import Navbar from "../components/Navbar";
import { useParams, useNavigate } from "react-router-dom";
import { useVendors } from "../data/VendorStore";
import { useFavorites } from "../data/FavoritesStore";
import type { Vendor } from "../data/vendors";
import "./VendorDetailPage.css";

const VendorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vendors } = useVendors();
  const { toggleFavorite, isFavorite } = useFavorites();

  // find vendor by id (string-compare so it works for number or string ids)
  const vendor = vendors.find((v) => String(v.id) === String(id)) as
    | Vendor
    | undefined;

  if (!vendor || vendor.status !== "approved") {
    return (
      <div className="vendor-detail-root">
        <Navbar />
        <main className="vendor-detail-main">
          <p className="vendor-detail-error">
            This vendor could not be found or is not available.
          </p>
          <button
            className="vendor-detail-back-btn"
            onClick={() => navigate(-1)}
          >
            Go back
          </button>
        </main>
      </div>
    );
  }

  const favorite = isFavorite(vendor.id);

  const handleContactEmail = () => {
    const email = vendor.email || "vendor@example.com";
    const subject = encodeURIComponent("Inquiry from Local Vendor Hub");
    const body = encodeURIComponent(
      `Hi ${vendor.name},\n\nI saw your listing on Local Vendor Hub.\n\nBest regards,`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const handleCallVendor = () => {
    const phone = vendor.phone || "+0000000000";
    window.location.href = `tel:${phone}`;
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/vendors/${vendor.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: vendor.name,
          text: `Check out ${vendor.name} on Local Vendor Hub`,
          url,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard.");
      } else {
        alert(url);
      }
    } catch {
      // ignore if user cancels
    }
  };

  return (
    <div className="vendor-detail-root">
      <Navbar />

      <main className="vendor-detail-main">
        <button
          className="vendor-detail-back-link"
          onClick={() => navigate(-1)}
        >
          ← Back to vendors
        </button>

        <section className="vendor-detail-card">
          <header className="vendor-detail-header">
            <div>
              <h1>{vendor.name}</h1>
              <div className="vendor-detail-tags">
                {vendor.category && (
                  <span className="vendor-detail-tag">{vendor.category}</span>
                )}
                {vendor.location && (
                  <span className="vendor-detail-tag">{vendor.location}</span>
                )}
                {vendor.openingHours && (
                  <p className="vendor-detail-hours">{vendor.openingHours}</p>
                )}
                {vendor.openingHours && (
                  <p className="vendor-detail-hours">{vendor.openingHours}</p>
                )}


              </div>
            </div>

            <button
              type="button"
              className={
                favorite
                  ? "vendor-detail-fav-btn vendor-detail-fav-btn--active"
                  : "vendor-detail-fav-btn"
              }
              onClick={() => toggleFavorite(vendor.id)}
            >
              {favorite ? "♥ Saved" : "♡ Save"}
            </button>
          </header>

          {vendor.description && (
            <p className="vendor-detail-description">{vendor.description}</p>
          )}

          {/* Placeholder for hours / photos if you add them later */}
          <div className="vendor-detail-extra">
            <h2>Contact</h2>
            <p>
              You can reach <strong>{vendor.name}</strong> using the options
              below.
            </p>

            <div className="vendor-detail-contact">
              <button
                className="vendor-detail-btn vendor-detail-btn--primary"
                onClick={handleContactEmail}
              >
                Email
              </button>
              <button
                className="vendor-detail-btn"
                onClick={handleCallVendor}
              >
                Call
              </button>
              <button
                className="vendor-detail-btn"
                onClick={handleShare}
              >
                Share
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default VendorDetailPage;
