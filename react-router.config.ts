import type { Config } from "@react-router/dev/config";
import { cargarContenido } from "./scripts/contenido/cargar.ts";

export default {
  // Sitio 100 % estático: sin servidor en runtime, un HTML por ruta conocida
  // y un fallback SPA para el resto (ver D-006 en docs/DECISIONES.md).
  ssr: false,
  async prerender({ getStaticPaths }) {
    const { bloques } = cargarContenido();
    return [...getStaticPaths(), ...bloques.map((bloque) => `/bloque/${bloque.id}`)];
  },
} satisfies Config;
