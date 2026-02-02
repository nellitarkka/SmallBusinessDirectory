import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { listingsAPI } from "../services/api";
import type { Vendor } from "./vendors";

interface VendorStore {
  vendors: Vendor[];
  isLoading: boolean;
  error: string | null;
  fetchVendors: (filters?: { city?: string; category?: string; search?: string }) => Promise<void>;
  getVendorById: (id: number | string) => Promise<Vendor | null>;
  updateVendor: (updated: Vendor) => Promise<void>;
  // keep local-only moderation if you still use it somewhere
  updateVendorStatus: (id: number | string, status: Vendor["status"], rejectionReason?: string) => void;
}

const VendorContext = createContext<VendorStore | undefined>(undefined);

export const VendorProvider = ({ children }: { children: ReactNode }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapListingToVendor = (listing: any): Vendor => ({
    id: listing.listing_id ?? listing.id,
    name: listing.business_name ?? listing.title ?? listing.name ?? "Unnamed Vendor",

    category: listing.category_name ?? listing.category ?? listing.categories?.[0],
    location: listing.city ?? listing.vendor_city,
    description: listing.description,

    email: listing.contact_email ?? listing.email ?? listing.vendor_email,
    phone: listing.contact_phone ?? listing.phone,

    address: listing.address,
    state: listing.state,
    zip_code: listing.zip_code,
    website: listing.website,
    category_id: listing.category_id,

    imageUrl: listing.image_url ?? listing.imageUrl,
    vendorUserId: listing.vendor_user_id,

    // IMPORTANT: unify statuses with vendors.ts
    status: "active",
    openingHours: listing.opening_hours ?? listing.openingHours,
    rejectionReason: listing.rejection_reason ?? listing.rejectionReason,
    flaggedReason: listing.flagged_reason ?? listing.flaggedReason,
  });

  const fetchVendors = async (filters?: { city?: string; category?: string; search?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listingsAPI.getAll(filters);
      if (response.status === "success") {
        const mapped = response.data.listings.map(mapListingToVendor);
        setVendors(mapped);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to fetch vendors");
      console.error("Error fetching vendors:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getVendorById = async (id: number | string): Promise<Vendor | null> => {
    try {
      const response = await listingsAPI.getById(id);
      if (response.status === "success") {
        return mapListingToVendor(response.data.listing);
      }
      return null;
    } catch (err) {
      console.error("Error fetching vendor:", err);
      return null;
    }
  };

  const updateVendor = async (updated: Vendor) => {
    try {
      const listingUpdates: any = {};

      if (updated.name) listingUpdates.business_name = updated.name;
      if (updated.description) listingUpdates.description = updated.description;
      if (updated.location) listingUpdates.city = updated.location;
      if (updated.phone) listingUpdates.contact_phone = updated.phone;
      if (updated.email) listingUpdates.contact_email = updated.email;

      if (updated.address) listingUpdates.address = updated.address;
      if (updated.state) listingUpdates.state = updated.state;
      if (updated.zip_code) listingUpdates.zip_code = updated.zip_code;
      if (updated.website) listingUpdates.website = updated.website;
      if (updated.category_id) listingUpdates.category_id = updated.category_id;

      const response = await listingsAPI.update(updated.id, listingUpdates);
      if (response.status === "success") {
        await fetchVendors();
      }
    } catch (err) {
      console.error("Error updating vendor:", err);
    }
  };

  const updateVendorStatus = (id: number | string, status: Vendor["status"], rejectionReason?: string) => {
    setVendors((prev) =>
      prev.map((v) =>
        String(v.id) === String(id)
          ? { ...v, status, rejectionReason: status === "rejected" ? rejectionReason : undefined }
          : v
      )
    );
  };

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
  if (!ctx) throw new Error("useVendors must be used within a VendorProvider");
  return ctx;
};
