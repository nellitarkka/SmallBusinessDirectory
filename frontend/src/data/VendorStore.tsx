// src/data/VendorStore.tsx
import {
    createContext,
    useContext,
    useState,
    type ReactNode,
  } from "react";
  import { initialVendors, type Vendor, type VendorStatus } from "./vendors";
  
  interface VendorStore {
    vendors: Vendor[];
    updateVendor: (updated: Vendor) => void;
    updateVendorStatus: (
      id: Vendor["id"],
      status: VendorStatus,
      rejectionReason?: string
    ) => void;
  }
  
  const VendorContext = createContext<VendorStore | undefined>(undefined);
  
  export const VendorProvider = ({ children }: { children: ReactNode }) => {
    const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  
    const updateVendor = (updated: Vendor) => {
      setVendors((prev) =>
        prev.map((v) => (v.id === updated.id ? updated : v))
      );
    };
  
    const updateVendorStatus = (
      id: Vendor["id"],
      status: VendorStatus,
      rejectionReason?: string
    ) => {
      setVendors((prev) =>
        prev.map((v) =>
          v.id === id
            ? { ...v, status, rejectionReason: status === "rejected" ? rejectionReason : undefined }
            : v
        )
      );
    };
  
    return (
      <VendorContext.Provider
        value={{ vendors, updateVendor, updateVendorStatus }}
      >
        {children}
      </VendorContext.Provider>
    );
  };
  
  export const useVendors = (): VendorStore => {
    const ctx = useContext(VendorContext);
    if (!ctx) {
      throw new Error("useVendors must be used within a VendorProvider");
    }
    return ctx;
  };
  