import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { messagesAPI } from "../services/api";

export interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  listing_id?: number;
  subject?: string;
  content: string;
  read: boolean;
  created_at: string;
  sender_name?: string;
  sender_email?: string;
  recipient_name?: string;
  recipient_email?: string;
  listing_name?: string;
}

interface MessagesStore {
  messages: Message[];
  sentMessages: Message[];
  unreadCount: number;
  isLoading: boolean;
  sendMessage: (recipientId: number, content: string, listingId?: number, subject?: string) => Promise<void>;
  fetchInbox: () => Promise<void>;
  fetchSent: () => Promise<void>;
  getConversation: (otherUserId: number) => Promise<Message[]>;
  markAsRead: (messageId: number) => Promise<void>;
  deleteMessage: (messageId: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
}

const MessagesContext = createContext<MessagesStore | undefined>(undefined);

export const MessagesProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (recipientId: number, content: string, listingId?: number, subject?: string) => {
    try {
      setIsLoading(true);
      const response = await messagesAPI.send(recipientId, content, listingId, subject);
      if (response.status === 'success') {
        await fetchSent(); // Refresh sent messages
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInbox = async () => {
    try {
      setIsLoading(true);
      const response = await messagesAPI.getInbox();
      if (response.status === 'success') {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch inbox:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSent = async () => {
    try {
      setIsLoading(true);
      const response = await messagesAPI.getSent();
      if (response.status === 'success') {
        setSentMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch sent messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getConversation = async (otherUserId: number): Promise<Message[]> => {
    try {
      const response = await messagesAPI.getConversation(otherUserId);
      if (response.status === 'success') {
        return response.data.messages;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
      return [];
    }
  };

  const markAsRead = async (messageId: number) => {
    try {
      const response = await messagesAPI.markAsRead(messageId);
      if (response.status === 'success') {
        // Update local state
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId ? { ...msg, read: true } : msg
          )
        );
        await fetchUnreadCount();
      }
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const deleteMessage = async (messageId: number) => {
    try {
      const response = await messagesAPI.delete(messageId);
      if (response.status === 'success') {
        // Remove from local state
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        setSentMessages(prev => prev.filter(msg => msg.id !== messageId));
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await messagesAPI.getUnreadCount();
      if (response.status === 'success') {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Fetch inbox and unread count on mount (if user is logged in)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchInbox();
      fetchUnreadCount();
    }
  }, []);

  return (
    <MessagesContext.Provider
      value={{
        messages,
        sentMessages,
        unreadCount,
        isLoading,
        sendMessage,
        fetchInbox,
        fetchSent,
        getConversation,
        markAsRead,
        deleteMessage,
        fetchUnreadCount,
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