// src/pages/AdminDashboardPage.tsx
import Navbar from "../components/Navbar";
import { listingsAPI } from "../services/api";
import "./AdminDashboardPage.css";
import type { Vendor } from "../data/vendors";
import { useEffect, useState } from "react";

const AdminDashboardPage: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    const fetchAdminListings = async () => {
      try {
        const res = await listingsAPI.getAllAdmin();
        if (res.status === "success") {
          const mapped: Vendor[] = res.data.listings.map((l: any) => ({
            id: l.listing_id ?? l.id,
            name: l.title ?? l.business_name ?? "",
            category: Array.isArray(l.categories) ? l.categories[0] : l.category,
            location: l.city,
            description: l.description,
            email: l.contact_email,
            phone: l.contact_phone,
            status: l.status,
            openingHours: l.opening_hours,
          }));
          setVendors(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch admin listings", err);
      }
    };
    fetchAdminListings();
  }, []);

  // simple status-based views
  const draftVendors = vendors.filter((v) => v.status === "draft");
  const submittedVendors = vendors.filter((v) => v.status === "submitted");
  const pendingVendors = [...draftVendors, ...submittedVendors]; // Show both for moderation
  const approvedVendors = vendors.filter((v) => v.status === "active");
  const rejectedVendors = vendors.filter((v) => v.status === "rejected");
  const reportedVendors = vendors.filter((v) => v.flaggedReason); // NEW

  // basic stats
  const totalVendors = vendors.length;
  const totalPending = pendingVendors.length;
  const totalApproved = approvedVendors.length;
  const totalRejected = rejectedVendors.length;

  // category overview (admin "manages" categories by seeing usage)
  const categoryCounts = Array.from(
    vendors.reduce((map, v) => {
      if (!v.category) return map;
      const key = v.category;
      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map<string, number>())
  );

  const handleApprove = async (id: number | string) => {
    try {
      await listingsAPI.updateStatusAdmin(id, 'active');
      // Refresh the list
      const res = await listingsAPI.getAllAdmin();
      if (res.status === "success") {
        const mapped: Vendor[] = res.data.listings.map((l: any) => ({
          id: l.listing_id ?? l.id,
          name: l.title ?? l.business_name ?? "",
          category: Array.isArray(l.categories) ? l.categories[0] : l.category,
          location: l.city,
          description: l.description,
          email: l.contact_email,
          phone: l.contact_phone,
          status: l.status,
          openingHours: l.opening_hours,
        }));
        setVendors(mapped);
      }
    } catch (err) {
      alert("Failed to approve listing: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const handleReject = async (vendor: Vendor) => {
    const reason = window.prompt(`Reason for rejecting "${vendor.name}"?`);
    if (!reason) return;
    try {
      await listingsAPI.updateStatusAdmin(vendor.id, 'rejected');
      // Refresh the list
      const res = await listingsAPI.getAllAdmin();
      if (res.status === "success") {
        const mapped: Vendor[] = res.data.listings.map((l: any) => ({
          id: l.listing_id ?? l.id,
          name: l.title ?? l.business_name ?? "",
          category: Array.isArray(l.categories) ? l.categories[0] : l.category,
          location: l.city,
          description: l.description,
          email: l.contact_email,
          phone: l.contact_phone,
          status: l.status,
          openingHours: l.opening_hours,
          rejectionReason: reason,
        }));
        setVendors(mapped);
      }
    } catch (err) {
      alert("Failed to reject listing: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  return (
    <div className="admin-page-root">
      <Navbar />

      <main className="admin-main">
        <header className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage vendor listings, categories, reports, and platform health.</p>
        </header>

        {/* BASIC STATS */}
        <section className="admin-section">
          <h2>Overview</h2>
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <span className="admin-stat-label">Total vendors</span>
              <span className="admin-stat-value">{totalVendors}</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-label">Pending Review</span>
              <span className="admin-stat-value">{totalPending}</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-label">Approved</span>
              <span className="admin-stat-value">{totalApproved}</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-label">Rejected</span>
              <span className="admin-stat-value">{totalRejected}</span>
            </div>
          </div>
        </section>

        {/* Moderation queue */}
        <section className="admin-section">
          <h2>Moderation queue (pending vendors)</h2>
          <div className="admin-vendor-table">
            <div className="admin-vendor-row admin-vendor-row--head">
              <span>Name</span>
              <span>Category</span>
              <span>Location</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {pendingVendors.length === 0 ? (
              <p style={{ padding: "0.75rem 0.25rem", fontSize: "0.9rem" }}>
                No vendors waiting for review.
              </p>
            ) : (
              pendingVendors.map((vendor) => (
                <div key={vendor.id} className="admin-vendor-row">
                  <span>{vendor.name}</span>
                  <span>{vendor.category || "-"}</span>
                  <span>{vendor.location || "-"}</span>
                  <span style={{ textTransform: 'capitalize' }}>{vendor.status}</span>
                  <span className="admin-actions">
                    <button
                      className="admin-btn admin-btn--approve"
                      onClick={() => handleApprove(vendor.id)}
                    >
                      Approve
                    </button>
                    <button
                      className="admin-btn admin-btn--danger"
                      onClick={() => handleReject(vendor)}
                    >
                      Reject
                    </button>
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Approved vendors overview */}
        <section className="admin-section" style={{ marginTop: "1.75rem" }}>
          <h2>Approved vendors</h2>
          <div className="admin-vendor-table">
            <div className="admin-vendor-row admin-vendor-row--head">
              <span>Name</span>
              <span>Category</span>
              <span>Location</span>
              <span>Status</span>
            </div>

            {approvedVendors.length === 0 ? (
              <p style={{ padding: "0.75rem 0.25rem", fontSize: "0.9rem" }}>
                No approved vendors yet.
              </p>
            ) : (
              approvedVendors.map((vendor) => (
                <div key={vendor.id} className="admin-vendor-row">
                  <span>{vendor.name}</span>
                  <span>{vendor.category || "-"}</span>
                  <span>{vendor.location || "-"}</span>
                  <span>Approved</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Rejected vendors overview */}
        <section className="admin-section" style={{ marginTop: "1.75rem" }}>
          <h2>Rejected vendors</h2>
          <div className="admin-vendor-table">
            <div className="admin-vendor-row admin-vendor-row--head">
              <span>Name</span>
              <span>Reason</span>
            </div>

            {rejectedVendors.length === 0 ? (
              <p style={{ padding: "0.75rem 0.25rem", fontSize: "0.9rem" }}>
                No rejected vendors.
              </p>
            ) : (
              rejectedVendors.map((vendor) => (
                <div key={vendor.id} className="admin-vendor-row">
                  <span>{vendor.name}</span>
                  <span>{vendor.rejectionReason || "-"}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* CATEGORY OVERVIEW */}
        <section className="admin-section" style={{ marginTop: "1.75rem" }}>
          <h2>Categories overview</h2>
          {categoryCounts.length === 0 ? (
            <p style={{ padding: "0.75rem 0.25rem", fontSize: "0.9rem" }}>
              No categories yet – vendors haven&apos;t set any categories.
            </p>
          ) : (
            <ul className="admin-category-list">
              {categoryCounts.map(([cat, count]) => (
                <li key={cat} className="admin-category-item">
                  <span>{cat}</span>
                  <span className="admin-category-count">{count} vendors</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* REPORTED / FLAGGED VENDORS */}
        <section className="admin-section" style={{ marginTop: "1.75rem" }}>
          <h2>Reported / flagged vendors</h2>
          <div className="admin-vendor-table">
            <div className="admin-vendor-row admin-vendor-row--head">
              <span>Name</span>
              <span>Reason</span>
            </div>

            {reportedVendors.length === 0 ? (
              <p style={{ padding: "0.75rem 0.25rem", fontSize: "0.9rem" }}>
                No reports received yet.
              </p>
            ) : (
              reportedVendors.map((vendor) => (
                <div key={vendor.id} className="admin-vendor-row">
                  <span>{vendor.name}</span>
                  <span>{vendor.flaggedReason}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
