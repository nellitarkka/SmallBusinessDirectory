import Navbar from "../components/Navbar";
import { usePublicListings } from "../data/PublicListingsStore";
import { useFavorites } from "../data/FavoritesStore";
import type { Vendor } from "../data/vendors";
import { useNavigate } from "react-router-dom";
import "./CustomerDashboardPage.css";

const CustomerMyVendorsPage: React.FC = () => {
  const { listings: vendors } = usePublicListings();
  const { favoriteVendorIds, toggleFavorite, isFavorite } = useFavorites();
  const navigate = useNavigate();

  const favoriteVendors: Vendor[] = vendors.filter((v) =>
    favoriteVendorIds.includes(Number(v.id))
  );

  const handleViewDetails = (id: Vendor["id"]) => {
    navigate(`/vendors/${id}`);
  };

  return (
    <div className="customer-page-root">
      <Navbar />

      <main className="customer-main">
        <header className="customer-header">
          <div>
            <h1>My Vendors</h1>
            <p>These are the vendors you&apos;ve saved from the customer dashboard.</p>
          </div>
        </header>

        <section className="customer-vendors-section">
          {favoriteVendors.length === 0 ? (
            <p className="customer-empty-state">
              You haven&apos;t saved any vendors yet. Browse vendors and click
              “Save”.
            </p>
          ) : (
            <div className="customer-vendor-grid">
              {favoriteVendors.map((vendor) => {
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

                    <button
                      className="vendor-card-btn"
                      onClick={() => handleViewDetails(vendor.id)}
                    >
                      View Details
                    </button>
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

export default CustomerMyVendorsPage;
