// src/pages/VendorDashboardPage.tsx
import { type FormEvent, useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "./VendorDashboardPage.css";
import { listingsAPI, vendorAPI } from "../services/api";
import { useAuth } from "../auth/AuthContext";

interface Listing {
  id: number;
  vendor_id: number;
  title: string;
  description: string;
  city: string;
  contact_email?: string;
  contact_phone?: string;
  status: string;
  opening_hours?: string;
}

interface VendorProfile {
  id: number;
  user_id: number;
  business_name: string;
  vat_number?: string;
  city?: string;
  is_verified: boolean;
}

const VendorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [contactPhone, setContactPhone] = useState("");
  const [openingHours, setOpeningHours] = useState("");

  // Fetch vendor profile and listings on mount
  useEffect(() => {
    const initializeData = async () => {
      await fetchVendorProfile();
      await fetchMyListings();
    };
    initializeData();
  }, []);

  const fetchVendorProfile = async () => {
    try {
      const response = await vendorAPI.getProfile();
      if (response.status === 'success') {
        const profile = response.data.vendor;
        setVendorProfile(profile);
        // Pre-fill form with vendor data
        if (!title && profile.business_name) {
          setTitle(profile.business_name);
        }
        if (!city && profile.city) {
          setCity(profile.city);
        }
      }
    } catch (err) {
      console.error('Error fetching vendor profile:', err);
    }
  };

  const fetchMyListings = async () => {
    setIsLoading(true);
    try {
      const response = await listingsAPI.getMine();
      if (response.status === 'success') {
        setListings(response.data.listings);
      }
    } catch (err) {
      console.error('Error fetching listings:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to load listings');
    } finally {
      setIsLoading(false);
    }
  };

  const loadListingIntoForm = (listing: Listing) => {
    setTitle(listing.title);
    setDescription(listing.description);
    setCity(listing.city);
    setContactEmail(listing.contact_email || user?.email || "");
    setContactPhone(listing.contact_phone || "");
    setOpeningHours(listing.opening_hours || "");
  };

  // Update form when selected listing changes
  useEffect(() => {
    if (selectedListingId) {
      const listing = listings.find(l => l.id === selectedListingId);
      if (listing) {
        console.log('Loading listing into form:', listing);
        loadListingIntoForm(listing);
      }
    }
  }, [selectedListingId, listings]);

  const handleCreateListing = async () => {
    setSubmitError("");
    setStatusMessage("");
    setIsSubmitting(true);

    try {
      const response = await listingsAPI.create({
        title,
        description,
        city,
        contactPhone,
        contactEmail: contactEmail || user?.email || "",
        openingHours,
      });
      
      if (response.status === 'success') {
        setShowCreateForm(false);
        setStatusMessage("Listing created successfully!");
        await fetchMyListings(); // Refresh listings
        // Clear form
        setTitle("");
        setDescription("");
        setCity("");
        setContactPhone("");
        setOpeningHours("");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create listing";
      setSubmitError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatusMessage("");
    setSubmitError("");
    setIsSubmitting(true);

    if (!selectedListingId) {
      setSubmitError("No listing selected");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await listingsAPI.update(selectedListingId, {
        title,
        description,
        city,
        contactPhone,
        contactEmail,
        openingHours,
      });
      
      if (response.status === 'success') {
        setStatusMessage("Listing updated successfully!");
        await fetchMyListings(); // Refresh listings
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update listing";
      setSubmitError(errorMsg);
      setStatusMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!selectedListingId) return;

    setStatusMessage("");
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const response = await listingsAPI.update(selectedListingId, {
        status: 'submitted',
      });
      
      if (response.status === 'success') {
        setStatusMessage("Listing submitted for admin review!");
        await fetchMyListings(); // Refresh to show new status
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to submit for review";
      setSubmitError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="vendor-page-root">
      <Navbar />

      <main className="vendor-main">
        <header className="vendor-header">
          <h1>Vendor Dashboard</h1>
          <p>
            Manage your business listings so customers can find and contact you
            easily.
          </p>
        </header>

        {isLoading ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <p>Loading your listings...</p>
          </div>
        ) : (
        <>
        {/* Show message if vendor has no listings */}
        {listings.length === 0 && !showCreateForm && (
          <section style={{ padding: "2rem", textAlign: "center", maxWidth: "600px", margin: "2rem auto" }}>
            <h2>You don't have any listings yet</h2>
            <p>Create your first listing to get started and let customers find you.</p>
            <button
              type="button"
              className="vendor-submit-button"
              onClick={() => setShowCreateForm(true)}
            >
              Create Your First Listing
            </button>
          </section>
        )}

        {/* Show create form if no listings and user clicked create */}
        {listings.length === 0 && showCreateForm && (
          <section className="vendor-layout">
            <form className="vendor-form" onSubmit={(e) => { e.preventDefault(); handleCreateListing(); }}>
              <h2 className="vendor-section-title">Create Your Business Listing</h2>
              
              <div className="vendor-field">
                <label className="vendor-label" htmlFor="vendor-title">Business Title</label>
                <input
                  id="vendor-title"
                  type="text"
                  className="vendor-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="vendor-field">
                <label className="vendor-label" htmlFor="vendor-city">City</label>
                <input
                  id="vendor-city"
                  type="text"
                  className="vendor-input"
                  placeholder="Luxembourg, Esch-sur-Alzette..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              <div className="vendor-field">
                <label className="vendor-label" htmlFor="vendor-email">Contact email</label>
                <input
                  id="vendor-email"
                  type="email"
                  className="vendor-input"
                  placeholder="you@business.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>

              <div className="vendor-field">
                <label className="vendor-label" htmlFor="vendor-phone">Phone number</label>
                <input
                  id="vendor-phone"
                  type="tel"
                  className="vendor-input"
                  placeholder="+352 ..."
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>

              <div className="vendor-field">
                <label className="vendor-label" htmlFor="vendor-hours">Opening hours</label>
                <input
                  id="vendor-hours"
                  type="text"
                  className="vendor-input"
                  placeholder="e.g. Mon–Fri 9:00–18:00, Sat 10:00–16:00"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                />
              </div>

              <div className="vendor-field">
                <label className="vendor-label" htmlFor="vendor-description">Description</label>
                <textarea
                  id="vendor-description"
                  className="vendor-textarea"
                  rows={4}
                  placeholder="Describe your services and special offers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {submitError && (
                <p style={{ color: "red", marginBottom: "1rem" }}>{submitError}</p>
              )}

              <button type="submit" className="vendor-save-button" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Listing"}
              </button>

              <button
                type="button"
                className="vendor-save-button"
                onClick={() => setShowCreateForm(false)}
                style={{ marginLeft: "1rem", backgroundColor: "#999" }}
              >
                Cancel
              </button>
            </form>
          </section>
        )}

        {/* Show edit form if vendor has listings */}
        {listings.length > 0 && (
        <>
          {/* Listings Overview Table */}
          <section style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2>My Listings</h2>
              <button
                type="button"
                className="vendor-submit-button"
                onClick={() => {
                  setShowCreateForm(true);
                  setTitle(vendorProfile?.business_name || "");
                  setCity(vendorProfile?.city || "");
                  setDescription("");
                  setContactPhone("");
                  setOpeningHours("");
                }}
              >
                + Create New Listing
              </button>
            </div>
            
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                    <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: 600 }}>Title</th>
                    <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: 600 }}>City</th>
                    <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: 600 }}>Status</th>
                    <th style={{ padding: "0.75rem", textAlign: "center", fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                      <td style={{ padding: "0.75rem" }}>{listing.title}</td>
                      <td style={{ padding: "0.75rem" }}>{listing.city}</td>
                      <td style={{ padding: "0.75rem" }}>
                        <span style={{
                          padding: "0.25rem 0.75rem",
                          borderRadius: "12px",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          backgroundColor: 
                            listing.status === 'active' ? '#d4edda' :
                            listing.status === 'submitted' ? '#fff3cd' :
                            listing.status === 'rejected' ? '#f8d7da' :
                            '#e2e3e5',
                          color:
                            listing.status === 'active' ? '#155724' :
                            listing.status === 'submitted' ? '#856404' :
                            listing.status === 'rejected' ? '#721c24' :
                            '#383d41'
                        }}>
                          {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem", textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => {
                            console.log('Edit button clicked for listing:', listing.id);
                            setSelectedListingId(listing.id);
                            setShowCreateForm(false);
                            // Scroll to edit form after React re-renders
                            setTimeout(() => {
                              const editSection = document.querySelector('.vendor-layout');
                              console.log('Edit section found:', editSection);
                              if (editSection) {
                                const top = editSection.getBoundingClientRect().top + window.scrollY - 100;
                                window.scrollTo({ top, behavior: 'smooth' });
                              }
                            }, 100);
                          }}
                          style={{
                            padding: "0.375rem 0.75rem",
                            backgroundColor: selectedListingId === listing.id ? "#007bff" : "#6c757d",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.875rem"
                          }}
                        >
                          {selectedListingId === listing.id ? "Editing" : "Edit"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        
          {selectedListingId && (
        <section className="vendor-layout">
          {/* LEFT: EDIT FORM */}
          <form className="vendor-form" onSubmit={handleSubmit}>
            <h2 className="vendor-section-title">Edit Listing: {listings.find(l => l.id === selectedListingId)?.title}</h2>

            <div className="vendor-field">
              <label className="vendor-label" htmlFor="vendor-title">
                Business Title
              </label>
              <input
                id="vendor-title"
                type="text"
                className="vendor-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="vendor-field">
              <label className="vendor-label" htmlFor="vendor-city">
                City
              </label>
              <input
                id="vendor-city"
                type="text"
                className="vendor-input"
                placeholder="Luxembourg, Esch-sur-Alzette..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            <div className="vendor-field">
              <label className="vendor-label" htmlFor="vendor-email">
                Contact email
              </label>
              <input
                id="vendor-email"
                type="email"
                className="vendor-input"
                placeholder="you@business.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>

            <div className="vendor-field">
              <label className="vendor-label" htmlFor="vendor-phone">
                Phone number
              </label>
              <input
                id="vendor-phone"
                type="tel"
                className="vendor-input"
                placeholder="+352 ..."
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>

            <div className="vendor-field">
              <label className="vendor-label" htmlFor="vendor-hours">
                Opening hours
              </label>
              <input
                id="vendor-hours"
                type="text"
                className="vendor-input"
                placeholder="e.g. Mon–Fri 9:00–18:00, Sat 10:00–16:00"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
              />
            </div>

            <div className="vendor-field">
              <label className="vendor-label" htmlFor="vendor-description">
                Description
              </label>
              <textarea
                id="vendor-description"
                className="vendor-textarea"
                rows={4}
                placeholder="Describe your services and special offers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {statusMessage && (
              <p className="vendor-status-message">{statusMessage}</p>
            )}

            {submitError && (
              <p style={{ color: "red", marginBottom: "1rem" }}>{submitError}</p>
            )}

            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <button type="submit" className="vendor-save-button" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
              
              {listings.find(l => l.id === selectedListingId)?.status === 'draft' && (
                <button
                  type="button"
                  className="vendor-submit-button"
                  onClick={handleSubmitForReview}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit for Review"}
                </button>
              )}
            </div>

            {listings.find(l => l.id === selectedListingId) && (
              <div style={{ 
                marginTop: "1rem", 
                padding: "1rem", 
                backgroundColor: "#f8f9fa", 
                borderRadius: "4px",
                border: "1px solid #dee2e6"
              }}>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#495057" }}>
                  Current status: <strong style={{ 
                    color: 
                      listings.find(l => l.id === selectedListingId)?.status === 'active' ? '#155724' :
                      listings.find(l => l.id === selectedListingId)?.status === 'submitted' ? '#856404' :
                      listings.find(l => l.id === selectedListingId)?.status === 'rejected' ? '#721c24' :
                      '#383d41'
                  }}>
                    {listings.find(l => l.id === selectedListingId)?.status.toUpperCase()}
                  </strong>
                </p>
                {listings.find(l => l.id === selectedListingId)?.status === 'draft' && (
                  <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.875rem", color: "#6c757d" }}>
                    💡 Submit your listing for admin review to make it visible to customers
                  </p>
                )}
                {listings.find(l => l.id === selectedListingId)?.status === 'submitted' && (
                  <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.875rem", color: "#6c757d" }}>
                    ⏳ Your listing is pending admin approval
                  </p>
                )}
                {listings.find(l => l.id === selectedListingId)?.status === 'active' && (
                  <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.875rem", color: "#6c757d" }}>
                    ✅ Your listing is live and visible to customers
                  </p>
                )}
                {listings.find(l => l.id === selectedListingId)?.status === 'rejected' && (
                  <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.875rem", color: "#6c757d" }}>
                    ❌ Your listing was rejected. Please review and update it before resubmitting
                  </p>
                )}
              </div>
            )}
          </form>

          {/* RIGHT: PREVIEW */}
          <aside className="vendor-preview-wrapper">
            <h2 className="vendor-section-title">Preview for customers</h2>

            <article className="vendor-preview-card">
              <h3 className="vendor-preview-title">
                {title || "Your Business"}
              </h3>

              {city && (
                <p className="vendor-preview-location">{city}</p>
              )}

              {openingHours && (
                <p className="vendor-preview-hours">{openingHours}</p>
              )}

              {description && (
                <p className="vendor-preview-description">
                  {description.length > 180
                    ? description.slice(0, 180) + "..."
                    : description}
                </p>
              )}

              <div className="vendor-preview-contact">
                {contactEmail && <p className="vendor-preview-item">📧 {contactEmail}</p>}
                {contactPhone && <p className="vendor-preview-item">📞 {contactPhone}</p>}
              </div>
            </article>
          </aside>
        </section>
          )}
        </>
        )}

        {/* Create form modal when editing existing listings */}
        {listings.length > 0 && showCreateForm && (
          <section className="vendor-layout" style={{ marginTop: "2rem", borderTop: "2px solid #333", paddingTop: "2rem" }}>
            <form className="vendor-form" onSubmit={(e) => { e.preventDefault(); handleCreateListing(); }}>
              <h2 className="vendor-section-title">Create New Business Listing</h2>
              
              <div className="vendor-field">
                <label className="vendor-label" htmlFor="new-vendor-title">Business Title</label>
                <input
                  id="new-vendor-title"
                  type="text"
                  className="vendor-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="vendor-field">
                <label className="vendor-label" htmlFor="new-vendor-city">City</label>
                <input
                  id="new-vendor-city"
                  type="text"
                  className="vendor-input"
                  placeholder="Luxembourg, Esch-sur-Alzette..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              <div className="vendor-field">
                <label className="vendor-label" htmlFor="new-vendor-description">Description</label>
                <textarea
                  id="new-vendor-description"
                  className="vendor-textarea"
                  rows={4}
                  placeholder="Describe your services and special offers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {submitError && (
                <p style={{ color: "red", marginBottom: "1rem" }}>{submitError}</p>
              )}

              <button type="submit" className="vendor-save-button" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Listing"}
              </button>

              <button
                type="button"
                className="vendor-save-button"
                onClick={() => setShowCreateForm(false)}
                style={{ marginLeft: "1rem", backgroundColor: "#999" }}
              >
                Cancel
              </button>
            </form>
          </section>
        )}
        </>
        )}
      </main>
    </div>
  );
};

export default VendorDashboardPage;
