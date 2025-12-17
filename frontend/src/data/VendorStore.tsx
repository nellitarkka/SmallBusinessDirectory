import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { listingsAPI } from "../services/api";

export type VendorStatus = "draft" | "submitted" | "approved" | "rejected";

// Map backend listing to frontend Vendor type
export interface Vendor {
  id: number;
  name: string;
  category?: string;
  location?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  state?: string;
  zip_code?: string;
  website?: string;
  category_id?: number;
  status?: VendorStatus;
  openingHours?: string;
  rejectionReason?: string;
  flaggedReason?: string;
}

interface VendorStore {
  vendors: Vendor[];
  isLoading: boolean;
  error: string | null;
  fetchVendors: (filters?: { city?: string; category?: string; search?: string }) => Promise<void>;
  getVendorById: (id: number) => Promise<Vendor | null>;
  updateVendor: (updated: Vendor) => Promise<void>;
  updateVendorStatus: (id: number, status: VendorStatus, rejectionReason?: string) => void;
}

const VendorContext = createContext<VendorStore | undefined>(undefined);

export const VendorProvider = ({ children }: { children: ReactNode }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map backend listing to frontend vendor format
  const mapListingToVendor = (listing: any): Vendor => ({
    id: listing.id,
    name: listing.business_name,
    category: listing.category_name,
    location: listing.city,
    description: listing.description,
    email: listing.email,
    phone: listing.phone,
    address: listing.address,
    state: listing.state,
    zip_code: listing.zip_code,
    website: listing.website,
    category_id: listing.category_id,
    vendorUserId: listing.vendor_user_id,
    status: "approved", // Default status since backend doesn't have this yet
  });

  const fetchVendors = async (filters?: { city?: string; category?: string; search?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listingsAPI.getAll(filters);
      if (response.status === 'success') {
        const mappedVendors = response.data.listings.map(mapListingToVendor);
        setVendors(mappedVendors);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vendors');
      console.error('Error fetching vendors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getVendorById = async (id: number): Promise<Vendor | null> => {
    try {
      const response = await listingsAPI.getById(id);
      if (response.status === 'success') {
        return mapListingToVendor(response.data.listing);
      }
      return null;
    } catch (err) {
      console.error('Error fetching vendor:', err);
      return null;
    }
  };

  const updateVendor = async (updated: Vendor) => {
    try {
      const listingUpdates: any = {};
      if (updated.name) listingUpdates.business_name = updated.name;
      if (updated.description) listingUpdates.description = updated.description;
      if (updated.location) listingUpdates.city = updated.location;
      if (updated.phone) listingUpdates.phone = updated.phone;
      if (updated.email) listingUpdates.email = updated.email;
      if (updated.address) listingUpdates.address = updated.address;
      if (updated.state) listingUpdates.state = updated.state;
      if (updated.zip_code) listingUpdates.zip_code = updated.zip_code;
      if (updated.website) listingUpdates.website = updated.website;
      if (updated.category_id) listingUpdates.category_id = updated.category_id;

      const response = await listingsAPI.update(updated.id, listingUpdates);
      if (response.status === 'success') {
        await fetchVendors(); // Refresh the list
      }
    } catch (err) {
      console.error('Error updating vendor:', err);
    }
  };

  const updateVendorStatus = (id: number, status: VendorStatus, rejectionReason?: string) => {
    // Local update only (backend doesn't have status yet)
    setVendors((prev) =>
      prev.map((v) =>
        v.id === id
          ? { ...v, status, rejectionReason: status === "rejected" ? rejectionReason : undefined }
          : v
      )
    );
  };

  // Fetch vendors on mount
  useEffect(() => {
    fetchVendors();
  }, []);

  return (
    <VendorContext.Provider
      value={{
        vendors,
        isLoading,
        error,
        fetchVendors,
        getVendorById,
        updateVendor,
        updateVendorStatus,
      }}
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