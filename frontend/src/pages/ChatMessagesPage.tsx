import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { useMessages } from "../data/MessagesStore";
import { useAuth } from "../auth/AuthContext";
import "./ChatMessagesPage.css";

interface Conversation {
  userId: number;
  userName: string;
  userEmail: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  listingName?: string;
}

const ChatMessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { messages, sentMessages, sendMessage, getConversation, isLoading, fetchInbox, fetchSent } = useMessages();
  
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<Map<number, Conversation>>(new Map());
  const [conversationMessages, setConversationMessages] = useState<any[]>([]);
  const [inputSubject, setInputSubject] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages on mount - only once
  useEffect(() => {
    fetchInbox();
    fetchSent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages]);

  // Build conversation list from inbox and sent messages
  useEffect(() => {
    const convMap = new Map<number, Conversation>();

    // Process received messages
    messages.forEach((msg) => {
      const otherUserId = msg.sender_id;
      const key = otherUserId;

      if (!convMap.has(key)) {
        convMap.set(key, {
          userId: otherUserId,
          userName: msg.sender_name || "Unknown User",
          userEmail: msg.sender_email || "",
          lastMessage: msg.content.substring(0, 50),
          lastMessageTime: msg.created_at,
          unreadCount: msg.read ? 0 : 1,
          listingName: msg.listing_name,
        });
      } else {
        const conv = convMap.get(key)!;
        if (new Date(msg.created_at) > new Date(conv.lastMessageTime)) {
          conv.lastMessage = msg.content.substring(0, 50);
          conv.lastMessageTime = msg.created_at;
        }
        if (!msg.read) conv.unreadCount += 1;
      }
    });

    // Process sent messages
    sentMessages.forEach((msg) => {
      const otherUserId = msg.recipient_id;
      const key = otherUserId;

      if (!convMap.has(key)) {
        convMap.set(key, {
          userId: otherUserId,
          userName: msg.recipient_name || "Unknown User",
          userEmail: msg.recipient_email || "",
          lastMessage: msg.content.substring(0, 50),
          lastMessageTime: msg.created_at,
          unreadCount: 0,
          listingName: msg.listing_name,
        });
      } else {
        const conv = convMap.get(key)!;
        if (new Date(msg.created_at) > new Date(conv.lastMessageTime)) {
          conv.lastMessage = msg.content.substring(0, 50);
          conv.lastMessageTime = msg.created_at;
        }
      }
    });

    setConversations(convMap);
  }, [messages, sentMessages]);

  // Load conversation when selected
  useEffect(() => {
    if (selectedUserId) {
      loadConversation(selectedUserId);
    }
  }, [selectedUserId]);

  const loadConversation = async (otherUserId: number) => {
    const msgs = await getConversation(otherUserId);
    // Sort by date ascending (oldest first)
    msgs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    setConversationMessages(msgs);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedUserId) return;

    setIsSending(true);
    setSendError(null);
    try {
      await sendMessage(selectedUserId, inputMessage.trim(), undefined, inputSubject.trim() || undefined);
      setInputMessage("");
      setInputSubject("");
      // Reload the conversation
      await loadConversation(selectedUserId);
      // Refresh the lists
      await fetchInbox();
      await fetchSent();
    } catch (err) {
      console.error("Failed to send message:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to send message";
      setSendError(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  // Sort conversations by last message time (most recent first)
  const sortedConversations = Array.from(conversations.values()).sort(
    (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
  );

  const selectedConversation = selectedUserId ? conversations.get(selectedUserId) : null;

  return (
    <div className="chat-page-root">
      <Navbar />

      <main className="chat-main">
        <div className="chat-container">
          {/* Sidebar - Conversation List */}
          <aside className="chat-sidebar">
            <h2 className="chat-sidebar-title">Messages</h2>
            {isLoading && sortedConversations.length === 0 ? (
              <p className="chat-empty">Loading conversations...</p>
            ) : sortedConversations.length === 0 ? (
              <p className="chat-empty">No conversations yet</p>
            ) : (
              <ul className="chat-conversation-list">
                {sortedConversations.map((conv) => (
                  <li
                    key={conv.userId}
                    className={`chat-conversation-item ${
                      selectedUserId === conv.userId ? "active" : ""
                    } ${conv.unreadCount > 0 ? "unread" : ""}`}
                    onClick={() => setSelectedUserId(conv.userId)}
                  >
                    <div className="chat-conv-header">
                      <h3 className="chat-conv-name">{conv.userName}</h3>
                      <span className="chat-conv-time">
                        {new Date(conv.lastMessageTime).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="chat-conv-preview">{conv.lastMessage}...</p>
                    {conv.unreadCount > 0 && (
                      <span className="chat-unread-badge">{conv.unreadCount}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </aside>

          {/* Main Chat Area */}
          <section className="chat-main-area">
            {!selectedUserId ? (
              <div className="chat-no-selection">
                <p>Select a conversation to start messaging</p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="chat-header">
                  <div>
                    <h1 className="chat-header-name">{selectedConversation?.userName}</h1>
                    {selectedConversation?.listingName && (
                      <p className="chat-header-listing">{selectedConversation.listingName}</p>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="chat-messages">
                  {conversationMessages.length === 0 ? (
                    <p className="chat-no-messages">No messages yet. Start the conversation!</p>
                  ) : (
                    conversationMessages.map((msg) => {
                      const isOwn = Number(msg.sender_id) === Number(user?.id);
                      const msgDate = new Date(msg.created_at);
                      return (
                        <div
                          key={msg.id}
                          className={`chat-message ${isOwn ? "own" : "other"}`}
                        >
                          <div className="chat-message-bubble">
                            {msg.subject && <p className="chat-message-subject">{msg.subject}</p>}
                            <p className="chat-message-content">{msg.content}</p>
                          </div>
                          <span className="chat-message-time">
                            {msgDate.toLocaleDateString()} {msgDate.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="chat-input-area">
                  {sendError && (
                    <div style={{
                      padding: "0.75rem 1rem",
                      marginBottom: "1rem",
                      backgroundColor: "#f8d7da",
                      border: "1px solid #f5c6cb",
                      borderRadius: "4px",
                      color: "#721c24",
                      fontSize: "0.9rem"
                    }}>
                      {sendError}
                    </div>
                  )}
                  <div className="chat-input-wrapper">
                    <input
                      type="text"
                      className="chat-subject-input"
                      placeholder="Subject (optional)"
                      value={inputSubject}
                      onChange={(e) => setInputSubject(e.target.value)}
                      disabled={isSending}
                    />
                    <textarea
                      className="chat-input"
                      placeholder="Type a message..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={isSending}
                    />
                  </div>
                  <button
                    className="chat-send-btn"
                    onClick={handleSendMessage}
                    disabled={isSending || !inputMessage.trim()}
                  >
                    {isSending ? "Sending..." : "Send"}
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default ChatMessagesPage;
