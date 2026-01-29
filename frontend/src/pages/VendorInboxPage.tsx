import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useMessages } from "../data/MessagesStore";
import { useAuth } from "../auth/AuthContext";
import "./VendorInboxPage.css";

const VendorInboxPage: React.FC = () => {
  const { user } = useAuth();
  const { messages, sentMessages, fetchInbox, fetchSent, sendMessage, isLoading, markAsRead } = useMessages();
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchInbox();
    fetchSent();
  }, []);

  // only vendors should see this page
  if (!user || user.role !== "vendor") return null;

  // Backend returns these already scoped to the current vendor
  const vendorMessages = messages;
  const mySent = sentMessages;

  const handleChangeReply = (messageId: string, text: string) => {
    setReplyDrafts((prev) => ({ ...prev, [messageId]: text }));
  };

  const handleReply = async (messageId: string, recipientUserId: number, listingId?: number, subject?: string) => {
    const text = replyDrafts[messageId]?.trim();
    if (!text) {
      alert("Please type a reply.");
      return;
    }
    try {
      await sendMessage(recipientUserId, text, listingId, subject ? `Re: ${subject}` : undefined);
      setReplyDrafts((prev) => ({ ...prev, [messageId]: "" }));
      await fetchInbox();
      await markAsRead(Number(messageId));
    } catch (err) {
      console.error("Failed to send reply", err);
      alert("Failed to send reply.");
    }
  };

  return (
    <div className="vendor-inbox-root">
      <Navbar />

      <main className="vendor-inbox-main">
        <h1>My Inbox</h1>

        {isLoading ? (
          <p className="vendor-inbox-empty">Loading messages…</p>
        ) : vendorMessages.length === 0 && mySent.length === 0 ? (
          <p className="vendor-inbox-empty">You have no messages yet.</p>
        ) : (
          <div className="vendor-inbox-list">
            {vendorMessages.map((msg) => (
              <div key={msg.id} className="vendor-inbox-item">
                <h3>
                  From: {msg.sender_name || msg.sender_email || "Unknown sender"}
                </h3>
                <p className="vendor-inbox-meta">
                  Sent: {new Date(msg.created_at).toLocaleString()}
                </p>

                {msg.subject && (
                  <p className="vendor-inbox-meta">Subject: {msg.subject}</p>
                )}

                <p className="vendor-inbox-content">{msg.content}</p>

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
                  onClick={() => handleReply(String(msg.id), msg.sender_id, msg.listing_id, msg.subject)}
                >
                  Send Reply
                </button>
              </div>
            ))}

            {mySent.map((msg) => (
              <div key={`sent-${msg.id}`} className="vendor-inbox-item">
                <h3>
                  To: {msg.recipient_name || msg.recipient_email || "Unknown recipient"}
                </h3>
                <p className="vendor-inbox-meta">
                  Sent: {new Date(msg.created_at).toLocaleString()}
                </p>
                {msg.subject && (
                  <p className="vendor-inbox-meta">Subject: {msg.subject}</p>
                )}
                <p className="vendor-inbox-content">{msg.content}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default VendorInboxPage;
