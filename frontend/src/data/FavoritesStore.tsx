// src/data/FavoritesStore.tsx
import {
    createContext,
    useContext,
    useState,
    type ReactNode,
  } from "react";
  import type { Vendor } from "./vendors";
  
  type VendorId = Vendor["id"];
  
  interface FavoritesStore {
    favoriteVendorIds: VendorId[];
    toggleFavorite: (id: VendorId) => void;
    isFavorite: (id: VendorId) => boolean;
    clearFavorites: () => void;
  }
  
  const FavoritesContext = createContext<FavoritesStore | undefined>(undefined);
  
  export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
    const [favoriteVendorIds, setFavoriteVendorIds] = useState<VendorId[]>([]);
  
    const toggleFavorite = (id: VendorId) => {
      setFavoriteVendorIds((prev) =>
        prev.includes(id) ? prev.filter((vId) => vId !== id) : [...prev, id]
      );
    };
  
    const isFavorite = (id: VendorId) => favoriteVendorIds.includes(id);
  
    const clearFavorites = () => setFavoriteVendorIds([]);
  
    return (
      <FavoritesContext.Provider
        value={{ favoriteVendorIds, toggleFavorite, isFavorite, clearFavorites }}
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
  