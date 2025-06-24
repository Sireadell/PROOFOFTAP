import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),                      // 👈 general alias
      "@/components": path.resolve(__dirname, "src/components"),
      
      "@/contexts": path.resolve(__dirname, "src/contexts"),
      "@/hooks": path.resolve(__dirname, "src/hooks"),
      "@/pages": path.resolve(__dirname, "src/pages"),
      "@/utils": path.resolve(__dirname, "src/utils"),
      "@/styles": path.resolve(__dirname, "src/styles"),
      "@/contracts": path.resolve(__dirname, "src/contracts"),   // ✅ include this too!
    },
  },
  server: {
    port: 3000,
  },
});
