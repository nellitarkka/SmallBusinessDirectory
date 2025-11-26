import Navbar from "../components/Navbar";
import { useMessages } from "../data/MessagesStore";
import { useAuth } from "../auth/AuthContext";
import "./CustomerDashboardPage.css"; // reuse same layout styles

const CustomerMessagesPage: React.FC = () => {
  const { messages } = useMessages();
  const { user } = useAuth();

  if (!user) {
    return null; // or redirect to login later
  }

  // Only show messages sent by THIS customer
  const myMessages = messages.filter(
    (m) => m.customerEmail === user.email
  );

  return (
    <div className="customer-page-root">
      <Navbar />

      <main className="customer-main">
        <header className="customer-header">
          <div>
            <h1>My Messages</h1>
            <p>These are the messages you have sent to vendors.</p>
          </div>
        </header>

        <section className="customer-vendors-section">
          {myMessages.length === 0 ? (
            <p className="customer-empty-state">
              You haven&apos;t sent any messages yet. Open a vendor from the
              customer dashboard and send them a message.
            </p>
          ) : (
            <div className="customer-vendor-grid">
              {myMessages.map((msg) => (
                <article key={msg.id} className="customer-vendor-card">
                  <h2 className="customer-vendor-title">{msg.vendorName}</h2>

                  <p className="customer-vendor-location">
                    Sent at {new Date(msg.createdAt).toLocaleString()}
                  </p>

                  <p className="customer-vendor-description">{msg.content}</p>

                  {/* SHOW VENDOR REPLY IF EXISTS */}
                  {msg.vendorReply && (
                    <div className="customer-message-replies">
                      <h3 className="customer-message-replies-title">Vendor reply</h3>
                      <div className="customer-message-reply">
                        <span className="customer-message-reply-meta">
                          {msg.repliedAt
                            ? new Date(msg.repliedAt).toLocaleString()
                            : "Just now"}
                        </span>
                        <span>{msg.vendorReply}</span>
                      </div>
                    </div>
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

export default CustomerMessagesPage;
