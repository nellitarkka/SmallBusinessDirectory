// src/pages/AdminDashboardPage.tsx
import Navbar from "../components/Navbar";
import { useVendors } from "../data/VendorStore";
import "./AdminDashboardPage.css";
import type { Vendor } from "../data/vendors";

const AdminDashboardPage: React.FC = () => {
  const { vendors, updateVendorStatus } = useVendors();

  // simple status-based views
  const submittedVendors = vendors.filter((v) => v.status === "submitted");
  const approvedVendors = vendors.filter((v) => v.status === "approved");
  const rejectedVendors = vendors.filter((v) => v.status === "rejected");
  const reportedVendors = vendors.filter((v) => v.flaggedReason); // NEW

  // basic stats
  const totalVendors = vendors.length;
  const totalSubmitted = submittedVendors.length;
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

  const handleApprove = (id: number | string) => {
    updateVendorStatus(id, "approved");
  };

  const handleReject = (vendor: Vendor) => {
    const reason = window.prompt(`Reason for rejecting "${vendor.name}"?`);
    if (!reason) return;
    updateVendorStatus(vendor.id, "rejected", reason);
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
              <span className="admin-stat-label">Submitted</span>
              <span className="admin-stat-value">{totalSubmitted}</span>
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
          <h2>Moderation queue (submitted vendors)</h2>
          <div className="admin-vendor-table">
            <div className="admin-vendor-row admin-vendor-row--head">
              <span>Name</span>
              <span>Category</span>
              <span>Location</span>
              <span>Actions</span>
            </div>

            {submittedVendors.length === 0 ? (
              <p style={{ padding: "0.75rem 0.25rem", fontSize: "0.9rem" }}>
                No vendors waiting for review.
              </p>
            ) : (
              submittedVendors.map((vendor) => (
                <div key={vendor.id} className="admin-vendor-row">
                  <span>{vendor.name}</span>
                  <span>{vendor.category || "-"}</span>
                  <span>{vendor.location || "-"}</span>
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
