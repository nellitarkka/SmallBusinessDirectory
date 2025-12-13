import Navbar from "../components/Navbar";
import { useVendors } from "../data/VendorStore";
import { useFavorites } from "../data/FavoritesStore";
import type { Vendor } from "../data/vendors";
import "./CustomerDashboardPage.css"; 

const CustomerMyVendorsPage: React.FC = () => {
  const { vendors } = useVendors();
  const { favoriteVendorIds } = useFavorites();

  const favoriteVendors: Vendor[] = vendors.filter(
    (v) => v.status === "approved" && favoriteVendorIds.includes(v.id)
  );

  return (
    <div className="customer-page-root">
      <Navbar />

      <main className="customer-main">
        <header className="customer-header">
          <div>
            <h1>My Vendors</h1>
            <p>
              These are the vendors you&apos;ve saved from the customer
              dashboard.
            </p>
          </div>
        </header>

        <section className="customer-vendors-section">
          {favoriteVendors.length === 0 ? (
            <p className="customer-empty-state">
              You haven&apos;t saved any vendors yet. Browse the Customer
              Dashboard and click &quot;Save&quot; on vendors you like.
            </p>
          ) : (
            <div className="customer-vendor-grid">
              {favoriteVendors.map((vendor) => (
                <article key={vendor.id} className="customer-vendor-card">
                  <h2 className="customer-vendor-title">{vendor.name}</h2>
                  {vendor.category && (
                    <p className="customer-vendor-category">
                      {vendor.category}
                    </p>
                  )}
                  {vendor.location && (
                    <p className="customer-vendor-location">
                      {vendor.location}
                    </p>
                  )}
                  {vendor.description && (
                    <p className="customer-vendor-description">
                      {vendor.description.length > 140
                        ? vendor.description.slice(0, 140) + "..."
                        : vendor.description}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CustomerMyVendorsPage;
