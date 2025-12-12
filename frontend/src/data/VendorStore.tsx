// src/data/VendorStore.tsx
import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
  } from "react";
  import { listingAPI } from "../services/api";
  import { type Vendor, type VendorStatus } from "./vendors";
  
  interface VendorStore {
    vendors: Vendor[];
    isLoading: boolean;
    error: string | null;
    updateVendor: (updated: Vendor) => Promise<void>;
    updateVendorStatus: (
      id: Vendor["id"],
      status: VendorStatus,
      rejectionReason?: string
    ) => Promise<void>;
    createListing: (data: {
      name: string;
      description: string;
      location: string;
      email: string;
      phone: string;
      category?: string;
      openingHours?: string;
    }) => Promise<Vendor>;
    fetchVendors: () => Promise<void>;
  }
  
  const VendorContext = createContext<VendorStore | undefined>(undefined);
  
  export const VendorProvider = ({ children }: { children: ReactNode }) => {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    // Fetch vendors/listings from backend
    const fetchVendors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // For vendors, fetch their own listings
        const listings = await listingAPI.getMine();
        // Transform listings to vendor format
        const vendors = listings.map((listing: any) => ({
          id: listing.id,
          name: listing.title,
          category: listing.category,
          location: listing.city,
          description: listing.description,
          email: listing.contact_email,
          phone: listing.contact_phone,
          status: listing.status as VendorStatus,
          rejectionReason: listing.rejection_reason,
          openingHours: listing.opening_hours,
        }));
        setVendors(vendors);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch vendors";
        setError(errorMessage);
        console.error("Error fetching vendors:", err);
      } finally {
        setIsLoading(false);
      }
    };

    // Load vendors on mount
    useEffect(() => {
      const token = localStorage.getItem("authToken");
      if (token) {
        fetchVendors();
      }
    }, []);
  
    const updateVendor = async (updated: Vendor) => {
      setError(null);
      try {
        // Ensure we have a valid ID before updating
        if (!updated.id || updated.id === undefined) {
          throw new Error("Cannot update listing without an ID. Please create a listing first.");
        }

        await listingAPI.update(updated.id as number, {
          title: updated.name,
          description: updated.description,
          city: updated.location,
          contact_email: updated.email,
          contact_phone: updated.phone,
          opening_hours: updated.openingHours,
        });

        setVendors((prev) =>
          prev.map((v) => (v.id === updated.id ? updated : v))
        );
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update vendor";
        setError(errorMessage);
        console.error("Error updating vendor:", err);
        throw err;
      }
    };
  
    const updateVendorStatus = async (
      id: Vendor["id"],
      status: VendorStatus,
      rejectionReason?: string
    ) => {
      setError(null);
      try {
        // Ensure we have a valid ID before updating
        if (!id || id === undefined) {
          throw new Error("Cannot update listing status without an ID.");
        }

        await listingAPI.update(id as number, {
          status,
          rejection_reason: status === "rejected" ? rejectionReason : undefined,
        });

        setVendors((prev) =>
          prev.map((v) =>
            v.id === id
              ? { ...v, status, rejectionReason: status === "rejected" ? rejectionReason : undefined }
              : v
          )
        );
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update vendor status";
        setError(errorMessage);
        console.error("Error updating vendor status:", err);
        throw err;
      }
    };

    const createListing = async (data: {
      name: string;
      description: string;
      location: string;
      email: string;
      phone: string;
      category?: string;
      openingHours?: string;
    }): Promise<Vendor> => {
      setError(null);
      try {
        const newListing = await listingAPI.create({
          title: data.name,
          description: data.description,
          city: data.location,
          contact_email: data.email,
          contact_phone: data.phone,
          opening_hours: data.openingHours,
        });

        const newVendor: Vendor = {
          id: newListing.id,
          name: newListing.title,
          category: data.category,
          location: newListing.city,
          description: newListing.description,
          email: newListing.contact_email,
          phone: newListing.contact_phone,
          status: newListing.status as VendorStatus,
          openingHours: newListing.opening_hours,
        };

        setVendors((prev) => [newVendor, ...prev]);
        return newVendor;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create listing";
        setError(errorMessage);
        console.error("Error creating listing:", err);
        throw err;
      }
    };
  
    return (
      <VendorContext.Provider
        value={{ vendors, isLoading, error, updateVendor, updateVendorStatus, createListing, fetchVendors }}
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
  