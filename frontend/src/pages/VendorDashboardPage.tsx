// src/pages/VendorDashboardPage.tsx
import { type FormEvent, useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "./VendorDashboardPage.css";
import { useVendors } from "../data/VendorStore";
import type { Vendor } from "../data/vendors";
import { useMessages } from "../data/MessagesStore";
import { useAuth } from "../auth/AuthContext";

const VendorDashboardPage: React.FC = () => {
  const { vendors, updateVendor, updateVendorStatus, createListing } = useVendors();
  const { messages, addReply } = useMessages();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // vendors that belong to the logged-in vendor (by email)
  const myVendors = vendors.filter(
    (v) => user?.role === "vendor" && v.email === user.email
  );

  const fallbackVendor: Vendor = {
    id: undefined as any,
    name: "Your Business Name",
    category: "",
    location: "",
    description: "",
    email: user?.email || "",
    phone: "",
    status: "draft",
    openingHours: "",
  };

  // allow multiple listings via dropdown later if you want
  const [selectedVendorId, setSelectedVendorId] = useState<Vendor["id"] | null>(null);
  
  // Update selectedVendorId when myVendors changes
  useEffect(() => {
    if (myVendors.length > 0 && selectedVendorId === null) {
      setSelectedVendorId(myVendors[0].id);
    }
  }, [myVendors, selectedVendorId]);

  const currentVendor =
    selectedVendorId ? (myVendors.find((v) => v.id === selectedVendorId) || fallbackVendor) : fallbackVendor;

  // form state
  const [name, setName] = useState(currentVendor.name);
  const [category, setCategory] = useState(currentVendor.category || "");
  const [location, setLocation] = useState(currentVendor.location || "");
  const [description, setDescription] = useState(
    currentVendor.description || ""
  );
  const [email, setEmail] = useState(user?.email || currentVendor.email || ""); // Initialize with user's email
  const [phone, setPhone] = useState(currentVendor.phone || "");
  const [openingHours, setOpeningHours] = useState(
    currentVendor.openingHours || ""
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [images, setImages] = useState<string[]>([]);

  // reply drafts for each message
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  // Update form when selected vendor changes (not when vendor data updates)
  useEffect(() => {
    if (selectedVendorId && currentVendor.id !== undefined) {
      setName(currentVendor.name);
      setCategory(currentVendor.category || "");
      setLocation(currentVendor.location || "");
      setDescription(currentVendor.description || "");
      setEmail(currentVendor.email || "");
      setPhone(currentVendor.phone || "");
      setOpeningHours(currentVendor.openingHours || "");
    }
  }, [selectedVendorId]);

  const handleCreateListing = async () => {
    setSubmitError("");
    setIsSubmitting(true);

    try {
      // Use the user's actual email, not form input
      const newVendor = await createListing({
        name,
        category,
        location,
        description,
        email: user?.email || email, // Use authenticated user's email
        phone,
        openingHours,
      });
      setSelectedVendorId(newVendor.id);
      setShowCreateForm(false);
      setStatusMessage("Listing created successfully!");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create listing";
      setSubmitError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // messages for this vendor
  const vendorMessages = messages.filter(
    (m) => m.vendorId === currentVendor.id
  );
  const totalMessages = vendorMessages.length;
  const repliedMessages = vendorMessages.filter((m) => m.vendorReply).length;

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      newUrls.push(url);
    }

    setImages((prev) => [...prev, ...newUrls]);
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatusMessage("");
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const updatedVendor: Vendor = {
        ...currentVendor,
        name,
        category,
        location,
        description,
        email,
        phone,
        openingHours,
      };

      await updateVendor(updatedVendor);
      setStatusMessage("Your vendor profile has been saved successfully.");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save profile";
      setSubmitError(errorMsg);
      setStatusMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitForReview = async () => {
    setStatusMessage("");
    setSubmitError("");
    setIsSubmitting(true);

    try {
      await updateVendorStatus(currentVendor.id, "submitted");
      setStatusMessage("Your listing has been submitted for review.");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to submit for review";
      setSubmitError(errorMsg);
      setStatusMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeReply = (id: string | number, text: string) => {
    setReplyDrafts((prev) => ({ ...prev, [id]: text }));
  };

  const handleSendReply = async (id: string | number) => {
    const text = replyDrafts[id]?.trim();
    if (!text) {
      alert("Please type a reply before sending.");
      return;
    }
    try {
      await addReply(id, text);
      setReplyDrafts((prev) => ({ ...prev, [id]: "" }));
      alert("Reply sent successfully.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send reply");
    }
  };

  return (
    <div className="vendor-page-root">
      <Navbar />

      <main className="vendor-main">
        <header className="vendor-header">
          <h1>Vendor Dashboard</h1>
          <p>
            Manage your business listing so customers can find and contact you
            easily.
          </p>
        </header>

        {/* Show message if vendor has no listings */}
        {vendors.length === 0 && !showCreateForm && (
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
        {vendors.length === 0 && showCreateForm && (
          <section className="vendor-layout">
            <form className="vendor-form" onSubmit={(e) => { e.preventDefault(); handleCreateListing(); }}>
              <h2 className="vendor-section-title">Create Your Business Listing</h2>
              
              <div className="vendor-field">
                <label className="vendor-label" htmlFor="vendor-name">Business name</label>
                <input
                  id="vendor-name"
                  type="text"
                  className="vendor-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="vendor-field">
                <label className="vendor-label" htmlFor="vendor-category">Category</label>
                <input
                  id="vendor-category"
                  type="text"
                  className="vendor-input"
                  placeholder="Bakery, Grocery, Restaurant..."
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="vendor-field">
                <label className="vendor-label" htmlFor="vendor-location">Location</label>
                <input
                  id="vendor-location"
                  type="text"
                  className="vendor-input"
                  placeholder="City / Area"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="vendor-field">
                <label className="vendor-label" htmlFor="vendor-email">Contact email</label>
                <input
                  id="vendor-email"
                  type="email"
                  className="vendor-input"
                  placeholder="you@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="vendor-field">
                <label className="vendor-label" htmlFor="vendor-phone">Phone number</label>
                <input
                  id="vendor-phone"
                  type="tel"
                  className="vendor-input"
                  placeholder="+352 ..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
        {vendors.length > 0 && currentVendor.id !== undefined && (
        <section className="vendor-layout">
          {/* LEFT: EDIT FORM */}
          <form className="vendor-form" onSubmit={handleSubmit}>
            <h2 className="vendor-section-title">Your vendor profile</h2>

            <div className="vendor-field">
              <label className="vendor-label" htmlFor="vendor-name">
                Business name
              </label>
              <input
                id="vendor-name"
                type="text"
                className="vendor-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="vendor-field">
              <label className="vendor-label" htmlFor="vendor-category">
                Category
              </label>
              <input
                id="vendor-category"
                type="text"
                className="vendor-input"
                placeholder="Bakery, Grocery, Restaurant..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="vendor-field">
              <label className="vendor-label" htmlFor="vendor-location">
                Location
              </label>
              <input
                id="vendor-location"
                type="text"
                className="vendor-input"
                placeholder="City / Area"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
              />
            </div>

            {/* IMAGES SECTION */}
            <div className="vendor-field">
              <label className="vendor-label" htmlFor="vendor-images">
                Store images
              </label>
              <input
                id="vendor-images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
              />
              <p className="vendor-help-text">
                You can upload multiple images to showcase your store or
                products.
              </p>

              {images.length > 0 && (
                <div className="vendor-images-grid">
                  {images.map((url, index) => (
                    <div key={url} className="vendor-image-wrapper">
                      <img src={url} alt={`Uploaded ${index + 1}`} />
                      <button
                        type="button"
                        className="vendor-image-remove"
                        onClick={() => handleRemoveImage(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {statusMessage && (
              <p className="vendor-status-message">{statusMessage}</p>
            )}

            {submitError && (
              <p style={{ color: "red", marginBottom: "1rem" }}>{submitError}</p>
            )}

            <button type="submit" className="vendor-save-button" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>

            <button
              type="button"
              className="vendor-submit-button"
              onClick={handleSubmitForReview}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit for review"}
            </button>

            <p className="vendor-current-status">
              Current status: <strong>{currentVendor.status}</strong>
            </p>

            {/* BASIC STATS */}
            <div className="vendor-stats">
              <h3>Message statistics</h3>
              <p>Total messages: {totalMessages}</p>
              <p>Replied: {repliedMessages}</p>
              <p>Unreplied: {totalMessages - repliedMessages}</p>
            </div>

            {/* MESSAGES LIST */}
            {vendorMessages.length > 0 && (
              <div className="vendor-messages-list">
                <h3>Messages from customers</h3>
                {vendorMessages.map((m) => (
                  <div key={m.id} className="vendor-message-item">
                    <p className="vendor-message-meta">
                      From: {m.customerEmail || "Unknown"} ·{" "}
                      {new Date(m.createdAt).toLocaleString()}
                    </p>
                    <p className="vendor-message-body">{m.content}</p>

                    {m.vendorReply && (
                      <p className="vendor-message-reply">
                        <strong>Your reply:</strong> {m.vendorReply}
                      </p>
                    )}

                    <textarea
                      className="vendor-message-textarea"
                      placeholder="Write a reply..."
                      value={replyDrafts[m.id] ?? ""}
                      onChange={(e) =>
                        handleChangeReply(m.id, e.target.value)
                      }
                      rows={2}
                    />

                    <button
                      type="button"
                      className="vendor-save-button"
                      onClick={() => handleSendReply(m.id)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send reply"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </form>

          {/* RIGHT: PREVIEW */}
          <aside className="vendor-preview-wrapper">
            <h2 className="vendor-section-title">Preview for customers</h2>

            <article className="vendor-preview-card">
              <h3 className="vendor-preview-title">
                {name || "Your Business"}
              </h3>

              {category && (
                <p className="vendor-preview-category">{category}</p>
              )}

              {location && (
                <p className="vendor-preview-location">{location}</p>
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
                {email && <p className="vendor-preview-item">📧 {email}</p>}
                {phone && <p className="vendor-preview-item">📞 {phone}</p>}
              </div>
            </article>
          </aside>
        </section>
        )}
      </main>
    </div>
  );
};

export default VendorDashboardPage;
