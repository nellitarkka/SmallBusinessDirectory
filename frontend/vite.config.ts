import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",               // REQUIRED for Azure Static Web Apps
  server: {
    allowedHosts: [
      "smallbusinessdirectory.francecentral.cloudapp.azure.com"
    ]
  },
  build: {
    outDir: "dist",        // REQUIRED so Azure serves compiled output
    emptyOutDir: true,
  },
});