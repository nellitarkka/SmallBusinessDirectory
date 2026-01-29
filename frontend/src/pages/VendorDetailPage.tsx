import Navbar from "../components/Navbar";
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFavorites } from "../data/FavoritesStore";
import { usePublicListings } from "../data/PublicListingsStore";
import { listingsAPI, API_ORIGIN } from "../services/api";
import type { Vendor } from "../data/vendors";
import { useMessages } from "../data/MessagesStore";
import { useAuth } from "../auth/AuthContext";
import "./VendorDetailPage.css";

const VendorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { listings } = usePublicListings();
  const { sendMessage, isLoading: isMessaging } = useMessages();
  const { user } = useAuth();

  const [loadedVendor, setLoadedVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [messageStatus, setMessageStatus] = useState<string | null>(null);

  // Try to find the vendor from already-loaded public listings
  const vendorFromCache = useMemo(() => {
    if (!id) return undefined;
    return listings.find((v) => String(v.id) === String(id));
  }, [listings, id]);

  // If not found in cache, fetch from backend directly
  useEffect(() => {
    let ignore = false;
    const fetchOne = async () => {
      if (vendorFromCache) {
        setLoadedVendor(vendorFromCache);
        return;
      }
      if (!id) return;
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await listingsAPI.getById(id);
        if (res.status === "success") {
          const listing = res.data.listing;
          // Align with public_listings_view mapping
          const img = listing.image_url || listing.imageUrl;
          const imageUrl = img ? (String(img).startsWith('/') ? `${API_ORIGIN}${img}` : img) : undefined;
          const mapped: Vendor = {
            id: listing.listing_id ?? listing.id,
            name: listing.business_name ?? listing.title ?? listing.name,
            category: listing.categories?.[0] ?? listing.category ?? listing.category_name,
            location: listing.city ?? listing.vendor_city,
            description: listing.description,
            email: listing.contact_email ?? listing.vendor_email,
            phone: listing.contact_phone,
            openingHours: listing.opening_hours,
            imageUrl,
            vendorUserId: listing.vendor_user_id,
            status: "approved",
          };
          if (!ignore) setLoadedVendor(mapped);
        } else if (!ignore) {
          setLoadError("Failed to load vendor");
        }
      } catch (e: any) {
        if (!ignore) setLoadError(e?.message || "Failed to load vendor");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };
    fetchOne();
    return () => {
      ignore = true;
    };
  }, [id, vendorFromCache]);

  const vendor = loadedVendor ?? vendorFromCache ?? undefined;

  const formattedLocation = useMemo(() => {
    if (!vendor?.location) return "";
    const parts = vendor.location
      .split(/[,|]/)
      .map((part) => part.trim())
      .filter(Boolean);
    const uniqueParts = Array.from(new Set(parts));
    return uniqueParts.join(" • ");
  }, [vendor?.location]);

  if (isLoading) {
    return (
      <div className="vendor-detail-root">
        <Navbar />
        <main className="vendor-detail-main">
          <p className="vendor-detail-error">Loading vendor…</p>
        </main>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="vendor-detail-root">
        <Navbar />
        <main className="vendor-detail-main">
          <p className="vendor-detail-error">
            {loadError || "This vendor could not be found or is not available."}
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

  const handleSendMessage = async () => {
    if (!user) {
      setMessageStatus("Please log in to send a message.");
      return;
    }
    if (!vendor.vendorUserId) {
      setMessageStatus("This vendor cannot receive messages yet.");
      return;
    }
    if (!messageBody.trim()) {
      setMessageStatus("Please enter a message.");
      return;
    }

    try {
      setMessageStatus("Sending…");
      await sendMessage(
        Number(vendor.vendorUserId),
        messageBody.trim(),
        Number(vendor.id),
        messageSubject.trim() || undefined
      );
      setMessageBody("");
      setMessageSubject("");
      setMessageStatus("Message sent.");
    } catch (err: any) {
      setMessageStatus(err?.message || "Failed to send message.");
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
          {vendor.imageUrl && (
            <div style={{ width: '100%', marginBottom: '1rem' }}>
              <img 
                src={vendor.imageUrl} 
                alt={vendor.name} 
                style={{ 
                  width: '100%', 
                  height: 'auto',
                  maxHeight: '400px', 
                  objectFit: 'cover', 
                  borderRadius: '8px',
                  display: 'block'
                }} 
              />
            </div>
          )}
          <header className="vendor-detail-header">
            <div>
              <h1>{vendor.name}</h1>
              <div className="vendor-detail-tags">
                {vendor.category && (
                  <span className="vendor-detail-tag">{vendor.category}</span>
                )}
                {formattedLocation && (
                  <span className="vendor-detail-tag vendor-detail-tag--location">
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      viewBox="0 0 24 24"
                      className="vendor-detail-icon"
                    >
                      <path
                        d="M12 2.75a6.25 6.25 0 0 0-6.25 6.25c0 4.01 3.58 7.54 5.73 9.38a2 2 0 0 0 2.54 0c2.15-1.84 5.73-5.37 5.73-9.38A6.25 6.25 0 0 0 12 2.75Zm0 8.5a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5Z"
                        fill="currentColor"
                      />
                    </svg>
                    {formattedLocation}
                  </span>
                )}
                {vendor.openingHours && (
                  <span className="vendor-detail-tag vendor-detail-tag--muted">
                    {vendor.openingHours}
                  </span>
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

            <div className="vendor-detail-message-box">
              <h3>Send a message</h3>
              <input
                type="text"
                className="vendor-detail-input"
                placeholder="Subject (optional)"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
              />
              <textarea
                className="vendor-detail-textarea"
                placeholder="Write your message to the vendor"
                rows={4}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
              />
              <button
                className="vendor-detail-btn vendor-detail-btn--primary"
                onClick={handleSendMessage}
                disabled={isMessaging}
              >
                {isMessaging ? "Sending…" : "Send Message"}
              </button>
              {messageStatus && (
                <p className="vendor-detail-status">{messageStatus}</p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default VendorDetailPage;
