import { useState } from "react";
import Navbar from "../components/Navbar";
import { usePublicListings } from "../data/PublicListingsStore";
import { useFavorites } from "../data/FavoritesStore";
import type { Vendor } from "../data/vendors";
import "./CustomerDashboardPage.css";
import { useMessages } from "../data/MessagesStore";
import { useAuth } from "../auth/AuthContext";


type VendorId = Vendor["id"];

const CustomerDashboardPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [expandedVendorId, setExpandedVendorId] = useState<VendorId | null>(
    null
  );

  const { listings: vendors } = usePublicListings();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addMessage } = useMessages();
  const { user } = useAuth();

  const [messageText, setMessageText] = useState("");

  const approvedVendors = vendors;

  const handleToggleExpand = (id: VendorId) => {
    setExpandedVendorId((prev) => (prev === id ? null : id));
  };

  const normalizedSearch = search.toLowerCase();

  

  const filteredVendors = approvedVendors.filter((vendor) => {
    if (!normalizedSearch) return true;
    const combined = `
      ${vendor.name || ""}
      ${vendor.category || ""}
      ${vendor.location || ""}
      ${vendor.description || ""}
    `.toLowerCase();
    return combined.includes(normalizedSearch);
  });

  const handleSendMessage = async (vendor: Vendor) => {
    if (!messageText.trim()) {
      alert("Please type a message before sending.");
      return;
    }
  
    try {
      await addMessage({
        vendorId: vendor.id,
        vendorName: vendor.name,
        customerEmail: user?.email,
        body: messageText.trim(),
      });
  
      setMessageText("");
      alert("Your message has been sent.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send message");
    }
  };
  

  const handleContactEmail = (vendor: Vendor) => {
    const email = vendor.email || "vendor@example.com";
    const subject = encodeURIComponent("Customer inquiry from Local Vendor Hub");
    const body = encodeURIComponent(
      `Hi ${vendor.name},\n\nI am interested in your services.\n\nBest regards,`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const handleCallVendor = (vendor: Vendor) => {
    const phone = vendor.phone || "+0000000000";
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="customer-page-root">
      <Navbar />

      <main className="customer-main">
        <header className="customer-header">
          <div>
            <h1>Customer Dashboard</h1>
            <p>
              Browse all vendors, view their details, and contact them directly.
            </p>
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

        <section className="customer-vendors-section">
          {filteredVendors.length === 0 ? (
            <p className="customer-empty-state">
              No vendors match your search yet.
            </p>
          ) : (
            <div className="customer-vendor-grid">
              {filteredVendors.map((vendor) => {
                const isExpanded = expandedVendorId === vendor.id;
                const favorite = isFavorite(vendor.id);

                return (
                  <article key={vendor.id} className="customer-vendor-card">
                    <div className="customer-vendor-card-header">
                      <h2 className="customer-vendor-title">{vendor.name}</h2>

                      <button
                        type="button"
                        className={
                          favorite
                            ? "customer-favorite-btn customer-favorite-btn--active"
                            : "customer-favorite-btn"
                        }
                        onClick={() => toggleFavorite(vendor.id)}
                      >
                        {favorite ? "♥ Saved" : "♡ Save"}
                      </button>
                    </div>

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
                    {vendor.openingHours && (
                      <p className="customer-vendor-location">
                        {vendor.location} · {vendor.openingHours}
                      </p>
                    )}
                    {vendor.description && (
                      <p className="customer-vendor-description">
                        {vendor.description.length > 140
                          ? vendor.description.slice(0, 140) + "..."
                          : vendor.description}
                      </p>
                    )}

                    <button
                      className="customer-vendor-toggle-btn"
                      onClick={() => handleToggleExpand(vendor.id)}
                    >
                      {isExpanded
                        ? "Hide contact options"
                        : "View contact options"}
                    </button>

                    {isExpanded && (
                      <div className="customer-vendor-contact">
                        <p className="customer-contact-title">
                          Contact {vendor.name}
                        </p>
                        <textarea
                          className="customer-message-textarea"
                          placeholder="Write a message to the vendor..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          rows={3}
                        />
                        <div className="customer-contact-buttons">
                          <button
                            className="contact-btn contact-btn--primary"
                            onClick={() => handleContactEmail(vendor)}
                          >
                            Contact via email
                          </button>
                          <button
                            className="contact-btn contact-btn--primary"
                            onClick={() => handleSendMessage(vendor)}
                          >
                            Send message
                          </button>
                          <button
                            className="contact-btn contact-btn--outline"
                            onClick={() => handleCallVendor(vendor)}
                          >
                            Call vendor
                          </button>
                        </div>
                      </div>
                    )}
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
