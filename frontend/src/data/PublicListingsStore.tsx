import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { listingsAPI } from "../services/api";
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
        // Transform backend listings to Vendor format
        const transformedListings = response.data.listings.map((listing: any) => ({
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
          status: "approved", // Default status
        } as Vendor));
        
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