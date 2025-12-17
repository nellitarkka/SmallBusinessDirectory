import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { listingsAPI, API_ORIGIN } from "../services/api";
import type { Vendor } from "./VendorStore";

interface PublicListingsContextType {
  listings: Vendor[];
  isLoading: boolean;
  error: string | null;
  fetchListings: (filters?: { city?: string; category?: string; search?: string }) => Promise<void>;
}

const PublicListingsContext = createContext<PublicListingsContextType | undefined>(undefined);

export const PublicListingsProvider = ({ children }: { children: ReactNode }) => {
  const [listings, setListings] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = async (filters?: { city?: string; category?: string; search?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listingsAPI.getAll(filters);
      
      if (response.status === 'success') {
        // Align with public_listings_view fields from the backend
        const transformedListings = response.data.listings.map((listing: any) => {
          const img = listing.image_url || listing.imageUrl;
          const imageUrl = img ? (String(img).startsWith('/') ? `${API_ORIGIN}${img}` : img) : undefined;
          return ({
          id: listing.listing_id ?? listing.id, // listing_id is what the view returns
          name: listing.business_name ?? listing.title ?? listing.name,
          category: listing.categories?.[0] ?? listing.category ?? listing.category_name,
          location: listing.city ?? listing.vendor_city,
          description: listing.description,
          email: listing.contact_email ?? listing.vendor_email,
          phone: listing.contact_phone,
          openingHours: listing.opening_hours,
          imageUrl,
          vendorUserId: listing.vendor_user_id,
          status: "approved", // Frontend expects a status field
          } as Vendor);
        });

        setListings(transformedListings);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch listings";
      setError(errorMessage);
      console.error("Error fetching public listings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load listings on mount
  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <PublicListingsContext.Provider value={{ listings, isLoading, error, fetchListings }}>
      {children}
    </PublicListingsContext.Provider>
  );
};

export const usePublicListings = () => {
  const context = useContext(PublicListingsContext);
  if (!context) {
    throw new Error("usePublicListings must be used within PublicListingsProvider");
  }
  return context;
};