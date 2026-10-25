import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // "@/" means the src folder, so imports don't need long relative paths.
      // jsconfig.json has the same setting, so your editor understands it too.
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
