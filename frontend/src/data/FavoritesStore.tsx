import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { favoritesAPI } from "../services/api";
import { useAuth } from "../auth/AuthContext";

type VendorId = number;

interface FavoritesStore {
  favoriteVendorIds: VendorId[];
  isLoading: boolean;
  toggleFavorite: (id: VendorId) => Promise<void>;
  isFavorite: (id: VendorId) => boolean;
  fetchFavorites: () => Promise<void>;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesStore | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favoriteVendorIds, setFavoriteVendorIds] = useState<VendorId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const response = await favoritesAPI.getAll();
      if (response.status === 'success') {
        const ids = response.data.favorites.map((fav: any) => fav.listing_id);
        setFavoriteVendorIds(ids);
      }
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (id: VendorId) => {
    try {
      if (favoriteVendorIds.includes(id)) {
        await favoritesAPI.remove(id);
        setFavoriteVendorIds((prev) => prev.filter((vId) => vId !== id));
      } else {
        await favoritesAPI.add(id);
        setFavoriteVendorIds((prev) => [...prev, id]);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const isFavorite = (id: VendorId) => favoriteVendorIds.includes(id);

  const clearFavorites = () => setFavoriteVendorIds([]);

  // Keep favorites in sync with auth state
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (user && token) {
      fetchFavorites();
    } else {
      setFavoriteVendorIds([]);
    }
  }, [user]);

  return (
    <FavoritesContext.Provider
      value={{ favoriteVendorIds, isLoading, toggleFavorite, isFavorite, fetchFavorites, clearFavorites }}
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