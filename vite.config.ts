import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { contenido } from "./scripts/contenido/plugin-vite.ts";

export default defineConfig({
  plugins: [contenido(), tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
});
