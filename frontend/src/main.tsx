import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./auth/AuthContext";
import { VendorProvider } from "./data/VendorStore";
import { FavoritesProvider } from "./data/FavoritesStore";
import { MessagesProvider } from "./data/MessagesStore";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <VendorProvider>
          <FavoritesProvider>
            <MessagesProvider>
              <App />
            </MessagesProvider>
          </FavoritesProvider>
        </VendorProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
