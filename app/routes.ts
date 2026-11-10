import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";
import { SECCIONES_PENDIENTES } from "./config";

export default [
  layout("routes/shell.tsx", [
    index("routes/inicio.tsx"),
    route("bloque/:bloqueId", "routes/bloque.tsx"),
    route("mas", "routes/mas.tsx"),
    route("acerca", "routes/acerca.tsx"),
    // Secciones aún sin construir: comparten una pantalla que dice cuándo llegan.
    ...Object.keys(SECCIONES_PENDIENTES).map((seccion) =>
      route(seccion, "routes/pendiente.tsx", { id: `pendiente-${seccion}` }),
    ),
    route("*", "routes/no-encontrada.tsx"),
  ]),
] satisfies RouteConfig;
