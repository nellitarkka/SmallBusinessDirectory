import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { messageAPI } from "../services/api";
import type { Vendor } from "./vendors";

// Reuse vendor's id type
type VendorId = Vendor["id"];

export interface Message {
  id: string | number;
  vendorId?: VendorId;
  vendorName?: string;
  senderUserId?: number;
  receiverUserId?: number;
  listingId?: number;
  customerEmail?: string;
  subject?: string;
  body: string;
  content?: string; // for backward compatibility
  createdAt: string;
  isRead?: boolean;
  vendorReply?: string;
  repliedAt?: string;
}

interface MessagesStore {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  addMessage: (
    msg: Omit<Message, "id" | "createdAt" | "vendorReply" | "repliedAt">
  ) => Promise<void>;
  addReply: (id: string | number, replyText: string) => Promise<void>;
  fetchMessages: () => Promise<void>;
  markAsRead: (id: string | number) => Promise<void>;
}

const MessagesContext = createContext<MessagesStore | undefined>(undefined);

export const MessagesProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch messages from backend
  const fetchMessages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await messageAPI.getAll();
      setMessages(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch messages";
      setError(errorMessage);
      console.error("Error fetching messages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load messages on mount
  useEffect(() => {
    // Check if user is authenticated before fetching
    const token = localStorage.getItem("authToken");
    if (token) {
      fetchMessages();
    }
  }, []);

  // Add new message
  const addMessage: MessagesStore["addMessage"] = async (msg) => {
    setError(null);
    try {
      const newMsg = await messageAPI.create({
        receiverUserId: msg.receiverUserId || 0,
        listingId: msg.listingId || 0,
        subject: msg.subject,
        body: msg.body || msg.content || "",
      });

      setMessages((prev) => [newMsg, ...prev]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send message";
      setError(errorMessage);
      console.error("Error sending message:", err);
      throw err;
    }
  };

  // Add reply (for backward compatibility - in real app, this would be a separate message)
  const addReply: MessagesStore["addReply"] = async (id, replyText) => {
    setError(null);
    try {
      const message = messages.find((m) => m.id === id);
      if (message) {
        await messageAPI.markAsRead(id as number);
        // Optionally create a reply message - depends on your app structure
        setMessages((prev) =>
          prev.map((m) =>
            m.id === id
              ? {
                  ...m,
                  vendorReply: replyText,
                  repliedAt: new Date().toISOString(),
                }
              : m
          )
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add reply";
      setError(errorMessage);
      console.error("Error adding reply:", err);
      throw err;
    }
  };

  // Mark message as read
  const markAsRead = async (id: string | number) => {
    setError(null);
    try {
      await messageAPI.markAsRead(id as number);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isRead: true } : m))
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to mark as read";
      setError(errorMessage);
      console.error("Error marking as read:", err);
    }
  };

  return (
    <MessagesContext.Provider
      value={{
        messages,
        isLoading,
        error,
        addMessage,
        addReply,
        fetchMessages,
        markAsRead,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessages = (): MessagesStore => {
  const ctx = useContext(MessagesContext);
  if (!ctx) {
    throw new Error("useMessages must be used within a MessagesProvider");
  }
  return ctx;
};
