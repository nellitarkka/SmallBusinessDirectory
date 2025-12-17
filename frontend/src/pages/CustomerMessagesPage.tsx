import { useEffect } from "react";
import Navbar from "../components/Navbar";
import { useMessages } from "../data/MessagesStore";
import { useAuth } from "../auth/AuthContext";
import "./CustomerDashboardPage.css"; // reuse same layout styles

const CustomerMessagesPage: React.FC = () => {
  const { messages, sentMessages, fetchInbox, fetchSent, isLoading } = useMessages();
  const { user } = useAuth();

  useEffect(() => {
    fetchInbox();
    fetchSent();
  }, []);

  if (!user) {
    return null; // or redirect to login later
  }

  // Backend already scopes these to the current user
  const inboxMessages = messages;
  const mySent = sentMessages;

  return (
    <div className="customer-page-root">
      <Navbar />

      <main className="customer-main">
        <header className="customer-header">
          <div>
            <h1>My Messages</h1>
            <p>Messages you have sent to vendors and their replies.</p>
          </div>
        </header>

        <section className="customer-vendors-section">
          {isLoading ? (
            <p className="customer-empty-state">Loading messages…</p>
          ) : mySent.length === 0 && inboxMessages.length === 0 ? (
            <p className="customer-empty-state">
              You haven&apos;t sent or received any messages yet.
            </p>
          ) : (
            <div className="customer-vendor-grid">
              {mySent.map((msg) => (
                <article key={`sent-${msg.id}`} className="customer-vendor-card">
                  <h2 className="customer-vendor-title">
                    To: {msg.recipient_name || msg.recipient_email || "Vendor"}
                  </h2>
                  <p className="customer-vendor-location">
                    Sent {new Date(msg.created_at).toLocaleString()}
                  </p>
                  {msg.subject && (
                    <p className="customer-vendor-category">{msg.subject}</p>
                  )}
                  <p className="customer-vendor-description">{msg.content}</p>
                </article>
              ))}

              {inboxMessages.map((msg) => (
                <article key={`in-${msg.id}`} className="customer-vendor-card">
                  <h2 className="customer-vendor-title">
                    From: {msg.sender_name || msg.sender_email || "Vendor"}
                  </h2>
                  <p className="customer-vendor-location">
                    Received {new Date(msg.created_at).toLocaleString()}
                  </p>
                  {msg.subject && (
                    <p className="customer-vendor-category">{msg.subject}</p>
                  )}
                  <p className="customer-vendor-description">{msg.content}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CustomerMessagesPage;
