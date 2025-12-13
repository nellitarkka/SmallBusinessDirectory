import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { Vendor } from "./vendors";

// Reuse vendor's id type
type VendorId = Vendor["id"];

export interface Message {
  id: string;
  vendorId: VendorId;
  vendorName: string;
  customerEmail?: string;
  content: string;
  createdAt: string;        
  vendorReply?: string;     
  repliedAt?: string;       
}

interface MessagesStore {
  messages: Message[];
  addMessage: (
    msg: Omit<Message, "id" | "createdAt" | "vendorReply" | "repliedAt">
  ) => void;
  addReply: (id: string, replyText: string) => void;
}

const MessagesContext = createContext<MessagesStore | undefined>(undefined);

export const MessagesProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage: MessagesStore["addMessage"] = (msg) => {
    const newMessage: Message = {
      ...msg,
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [newMessage, ...prev]);
  };

  const addReply: MessagesStore["addReply"] = (id, replyText) => {
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
  };

  return (
    <MessagesContext.Provider value={{ messages, addMessage, addReply }}>
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
