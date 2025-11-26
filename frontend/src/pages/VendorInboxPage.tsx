import { useState } from "react";
import Navbar from "../components/Navbar";
import { useMessages } from "../data/MessagesStore";
import { useAuth } from "../auth/AuthContext";
import { useVendors } from "../data/VendorStore";
import "./VendorInboxPage.css";

const VendorInboxPage: React.FC = () => {
  const { user } = useAuth();
  const { vendors } = useVendors();
  const { messages, addReply } = useMessages();
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  // only vendors should see this page
  if (!user || user.role !== "vendor") return null;

  // find the vendor record that belongs to this logged-in vendor (by email)
  const currentVendor = vendors.find((v) => v.email === user.email);

  if (!currentVendor) {
    return (
      <div className="vendor-inbox-root">
        <Navbar />
        <main className="vendor-inbox-main">
          <h1>My Inbox</h1>
          <p className="vendor-inbox-empty">
            We couldn&apos;t find a vendor profile linked to this account yet.
          </p>
        </main>
      </div>
    );
  }

  // Filter only messages sent to THIS vendor (by vendorId)
  const vendorMessages = messages.filter(
    (m) => m.vendorId === currentVendor.id
  );

  const handleChangeReply = (messageId: string, text: string) => {
    setReplyDrafts((prev) => ({ ...prev, [messageId]: text }));
  };

  const handleReply = (messageId: string) => {
    const text = replyDrafts[messageId]?.trim();
    if (!text) {
      alert("Please type a reply.");
      return;
    }

    addReply(messageId, text);
    setReplyDrafts((prev) => ({ ...prev, [messageId]: "" }));
    alert("Reply saved (demo only).");
  };

  return (
    <div className="vendor-inbox-root">
      <Navbar />

      <main className="vendor-inbox-main">
        <h1>My Inbox</h1>

        {vendorMessages.length === 0 ? (
          <p className="vendor-inbox-empty">
            You have no messages yet.
          </p>
        ) : (
          <div className="vendor-inbox-list">
            {vendorMessages.map((msg) => (
              <div key={msg.id} className="vendor-inbox-item">
                <h3>
                  From: {msg.customerEmail || "Unknown customer"}
                </h3>
                <p className="vendor-inbox-meta">
                  Sent: {new Date(msg.createdAt).toLocaleString()}
                </p>

                <p className="vendor-inbox-content">{msg.content}</p>

                {msg.vendorReply && (
                  <p className="vendor-inbox-reply">
                    <strong>Your reply:</strong> {msg.vendorReply}
                  </p>
                )}

                <textarea
                  className="vendor-inbox-textarea"
                  placeholder="Write a reply..."
                  value={replyDrafts[msg.id] ?? ""}
                  onChange={(e) =>
                    handleChangeReply(msg.id, e.target.value)
                  }
                  rows={3}
                />

                <button
                  className="vendor-inbox-btn"
                  onClick={() => handleReply(msg.id)}
                >
                  Send Reply
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default VendorInboxPage;
