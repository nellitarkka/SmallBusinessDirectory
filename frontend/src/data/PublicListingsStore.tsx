import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { listingAPI } from "../services/api";
import type { Vendor } from "./vendors";

interface PublicListingsContextType {
  listings: Vendor[];
  isLoading: boolean;
  error: string | null;
  fetchListings: () => Promise<void>;
}

const PublicListingsContext = createContext<PublicListingsContextType | undefined>(undefined);

export const PublicListingsProvider = ({ children }: { children: ReactNode }) => {
  const [listings, setListings] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listingAPI.getAll();
      
      // Handle the API response structure
      const listings = Array.isArray(response) ? response : response.listings || [];
      
      // Transform listings to vendor format
      const transformedListings = listings.map((listing: any) => ({
        id: listing.id || listing.listing_id,
        name: listing.title,
        category: Array.isArray(listing.categories) ? listing.categories[0] : listing.category,
        location: listing.city,
        description: listing.description,
        email: listing.contact_email,
        phone: listing.contact_phone,
        status: listing.status || "active", // Default to active if not provided
        openingHours: listing.opening_hours,
      } as Vendor));
      
      setListings(transformedListings);
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
