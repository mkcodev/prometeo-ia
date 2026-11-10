import type { Plugin } from "vite";
import { cargarContenido, carpetaContenido } from "./cargar.ts";

const ID_VIRTUAL = "virtual:contenido";
const ID_RESUELTO = `\0${ID_VIRTUAL}`;

/**
 * Expone el contenido validado como el módulo `virtual:contenido`.
 * Si el contenido no cumple el esquema, el build falla con la lista de problemas.
 */
export function contenido(): Plugin {
  return {
    name: "prometeo:contenido",
    resolveId(id) {
      return id === ID_VIRTUAL ? ID_RESUELTO : undefined;
    },
    load(id) {
      if (id !== ID_RESUELTO) return undefined;
      const { bloques, mapa, archivos } = cargarContenido();
      for (const archivo of archivos) this.addWatchFile(archivo);
      return [
        `export const bloques = ${JSON.stringify(bloques)};`,
        `export const mapa = ${JSON.stringify(mapa)};`,
      ].join("\n");
    },
    configureServer(servidor) {
      const carpeta = carpetaContenido().replaceAll("\\", "/");
      servidor.watcher.add(carpeta);
      const recargar = (archivo: string) => {
        if (!archivo.replaceAll("\\", "/").startsWith(carpeta)) return;
        const modulo = servidor.moduleGraph.getModuleById(ID_RESUELTO);
        if (modulo) servidor.moduleGraph.invalidateModule(modulo);
        servidor.ws.send({ type: "full-reload" });
      };
      servidor.watcher.on("add", recargar);
      servidor.watcher.on("change", recargar);
      servidor.watcher.on("unlink", recargar);
    },
  };
}
