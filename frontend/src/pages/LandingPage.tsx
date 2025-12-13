import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { usePublicListings } from "../data/PublicListingsStore";
import { useFavorites } from "../data/FavoritesStore";
import type { Vendor } from "../data/vendors";

import "./LandingPage.css";

const LandingPage: React.FC = () => {
  const { listings, isLoading } = usePublicListings();
  const { toggleFavorite, isFavorite } = useFavorites();
  const navigate = useNavigate();

  // only show approved vendors
  const approvedVendors = listings;

  // --- filters state ---
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  const categories = Array.from(
    new Set(approvedVendors.map((v) => v.category).filter(Boolean))
  ) as string[];
  const locations = Array.from(
    new Set(approvedVendors.map((v) => v.location).filter(Boolean))
  ) as string[];

  const normalizedSearch = search.toLowerCase();

  const filteredVendors = approvedVendors.filter((vendor) => {
    if (
      selectedCategory !== "all" &&
      vendor.category?.toLowerCase() !== selectedCategory.toLowerCase()
    ) {
      return false;
    }

    if (
      selectedLocation !== "all" &&
      vendor.location?.toLowerCase() !== selectedLocation.toLowerCase()
    ) {
      return false;
    }

    if (!normalizedSearch) return true;

    const combined = `
      ${vendor.name || ""}
      ${vendor.category || ""}
      ${vendor.location || ""}
      ${vendor.description || ""}
    `.toLowerCase();

    return combined.includes(normalizedSearch);
  });

  const sampleVendors = filteredVendors.slice(0, 6);

  // --- actions ---

  const handleViewDetails = (id: Vendor["id"]) => {
    // we can add /vendors/:id page later
    navigate(`/vendors/${id}`);
  };

  const handleContactEmail = (vendor: Vendor) => {
    const email = vendor.email || "vendor@example.com";
    const subject = encodeURIComponent("Inquiry from Local Vendor Hub");
    const body = encodeURIComponent(
      `Hi ${vendor.name},\n\nI saw your listing on Local Vendor Hub.\n\nBest regards,`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const handleCallVendor = (vendor: Vendor) => {
    const phone = vendor.phone || "+0000000000";
    window.location.href = `tel:${phone}`;
  };

  const handleShare = async (vendor: Vendor) => {
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
      // ignore cancel
    }
  };

  return (
    <div className="landing-root">
      <Navbar />

      <main className="landing-main">
        {/* HERO */}
        <section className="landing-hero">
          <div className="landing-hero-text">
            <h1>Discover Local Vendors Near You</h1>
            <p>
              Browse small businesses, compare services, and contact vendors –
              all in one place.
            </p>
          </div>

          {/* FILTER BAR */}
          <div className="landing-filters">
            <input
              className="landing-search-input"
              type="text"
              placeholder="Search by name, category, or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="landing-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              className="landing-select"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="all">All locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* FEATURED VENDORS */}
        <section className="landing-vendors-section">
          <div className="landing-vendors-header">
            <h2>Featured Vendors</h2>
            <p>
              Filter by category and city, then open a listing for more details.
            </p>
          </div>

          {isLoading ? (
            <p className="landing-empty-state">Loading vendors...</p>
          ) : sampleVendors.length === 0 ? (
            <p className="landing-empty-state">
              No vendors match your filters yet. Try clearing some filters.
            </p>
          ) : (
            <div className="landing-vendor-grid">
              {sampleVendors.map((vendor) => {
                const favorite = isFavorite(vendor.id);
                return (
                  <article key={vendor.id} className="vendor-card">
                    <div className="vendor-card-header">
                      <h3 className="vendor-card-title">{vendor.name}</h3>
                      <button
                        type="button"
                        className={
                          favorite
                            ? "vendor-save-btn vendor-save-btn--active"
                            : "vendor-save-btn"
                        }
                        onClick={() => toggleFavorite(vendor.id)}
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
                        {vendor.description.length > 120
                          ? vendor.description.slice(0, 120) + "..."
                          : vendor.description}
                      </p>
                    )}

                    {/* contact + actions */}
                    <div className="vendor-card-footer">
                      <button
                        className="vendor-card-btn"
                        onClick={() => handleViewDetails(vendor.id)}
                      >
                        View Details
                      </button>

                      <div className="vendor-card-secondary-actions">
                        <button
                          type="button"
                          className="vendor-secondary-btn"
                          onClick={() => handleContactEmail(vendor)}
                        >
                          Email
                        </button>
                        <button
                          type="button"
                          className="vendor-secondary-btn"
                          onClick={() => handleCallVendor(vendor)}
                        >
                          Call
                        </button>
                        <button
                          type="button"
                          className="vendor-secondary-btn"
                          onClick={() => handleShare(vendor)}
                        >
                          Share
                        </button>
                      </div>
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

export default LandingPage;
