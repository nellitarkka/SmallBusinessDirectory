// src/data/FavoritesStore.tsx
import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
  } from "react";
  import { favoriteAPI } from "../services/api";
  import type { Vendor } from "./vendors";
  
  type VendorId = Vendor["id"];
  
  interface FavoritesStore {
    favoriteVendorIds: VendorId[];
    isLoading: boolean;
    error: string | null;
    toggleFavorite: (id: VendorId) => Promise<void>;
    isFavorite: (id: VendorId) => boolean;
    clearFavorites: () => void;
    fetchFavorites: () => Promise<void>;
  }
  
  const FavoritesContext = createContext<FavoritesStore | undefined>(undefined);
  
  export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
    const [favoriteVendorIds, setFavoriteVendorIds] = useState<VendorId[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    // Fetch favorites from backend
    const fetchFavorites = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const favorites = await favoriteAPI.getAll();
        // Extract listing IDs from favorite objects
        const ids = favorites.map((fav: any) => fav.listingId || fav.id) as VendorId[];
        setFavoriteVendorIds(ids);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch favorites";
        setError(errorMessage);
        console.error("Error fetching favorites:", err);
      } finally {
        setIsLoading(false);
      }
    };

    // Load favorites on mount
    useEffect(() => {
      const token = localStorage.getItem("authToken");
      if (token) {
        fetchFavorites();
      }
    }, []);
  
    const toggleFavorite = async (id: VendorId) => {
      setError(null);
      const isFav = favoriteVendorIds.includes(id);
      
      try {
        if (isFav) {
          await favoriteAPI.remove(id as number);
          setFavoriteVendorIds((prev) => prev.filter((vId) => vId !== id));
        } else {
          await favoriteAPI.add(id as number);
          setFavoriteVendorIds((prev) => [...prev, id]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to toggle favorite";
        setError(errorMessage);
        console.error("Error toggling favorite:", err);
        throw err;
      }
    };
  
    const isFavorite = (id: VendorId) => favoriteVendorIds.includes(id);
  
    const clearFavorites = () => setFavoriteVendorIds([]);
  
    return (
      <FavoritesContext.Provider
        value={{ favoriteVendorIds, isLoading, error, toggleFavorite, isFavorite, clearFavorites, fetchFavorites }}
      >
        {children}
      </FavoritesContext.Provider>
    );
  };
  
  export const useFavorites = (): FavoritesStore => {
    const ctx = useContext(FavoritesContext);
    if (!ctx) {
      throw new Error("useFavorites must be used within a FavoritesProvider");
    }
    return ctx;
  };
  