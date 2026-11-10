import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { esquemaBloque, type Bloque } from "./esquema.ts";
import { calcularMapa, type Mapa } from "./mapa.ts";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export const IDIOMA_BASE = "es";

export function carpetaContenido(idioma = IDIOMA_BASE): string {
  return join(RAIZ, "content", idioma);
}

export interface Contenido {
  bloques: Bloque[];
  mapa: Mapa;
  /** Archivos leídos, para que Vite recargue cuando cambian. */
  archivos: string[];
}

export class ErrorDeContenido extends Error {
  problemas: string[];

  constructor(problemas: string[]) {
    super(`Contenido inválido:\n${problemas.map((p) => `  - ${p}`).join("\n")}`);
    this.name = "ErrorDeContenido";
    this.problemas = problemas;
  }
}

/**
 * Lee y valida todo el contenido. Lanza `ErrorDeContenido` con la lista
 * completa de problemas: quien contribuye los ve todos de una vez.
 */
export function cargarContenido(idioma = IDIOMA_BASE): Contenido {
  const problemas: string[] = [];
  const archivos: string[] = [];
  const bloques: Bloque[] = [];

  const carpetaBloques = join(carpetaContenido(idioma), "bloques");
  const carpetas = existsSync(carpetaBloques)
    ? readdirSync(carpetaBloques, { withFileTypes: true })
        .filter((entrada) => entrada.isDirectory())
        .map((entrada) => entrada.name)
        .sort()
    : [];

  for (const carpeta of carpetas) {
    const archivo = join(carpetaBloques, carpeta, "bloque.yaml");
    const ruta = relative(RAIZ, archivo).replaceAll("\\", "/");
    if (!existsSync(archivo)) {
      problemas.push(`${ruta}: falta el archivo`);
      continue;
    }
    archivos.push(archivo);

    let datos: unknown;
    try {
      datos = parse(readFileSync(archivo, "utf8"));
    } catch (error) {
      problemas.push(`${ruta}: YAML ilegible (${(error as Error).message})`);
      continue;
    }

    const resultado = esquemaBloque.safeParse(datos);
    if (!resultado.success) {
      for (const incidencia of resultado.error.issues) {
        problemas.push(`${ruta}: ${incidencia.path.join(".") || "(raíz)"}: ${incidencia.message}`);
      }
      continue;
    }

    const bloque = resultado.data;
    const esperado = `${String(bloque.orden).padStart(2, "0")}-${bloque.id}`;
    if (carpeta !== esperado) {
      problemas.push(`${ruta}: la carpeta debería llamarse "${esperado}" (orden + id)`);
    }
    bloques.push(bloque);
  }

  bloques.sort((a, b) => a.orden - b.orden);

  const ids = new Set<string>();
  for (const bloque of bloques) {
    if (ids.has(bloque.id)) problemas.push(`bloque "${bloque.id}": id repetido`);
    ids.add(bloque.id);
  }
  bloques.forEach((bloque, indice) => {
    if (bloque.orden !== indice + 1) {
      problemas.push(`bloque "${bloque.id}": el orden debería ser ${indice + 1}, no ${bloque.orden}`);
    }
    for (const requerido of bloque.requiere) {
      if (!ids.has(requerido)) {
        problemas.push(`bloque "${bloque.id}": requiere "${requerido}", que no existe`);
      } else if (requerido === bloque.id) {
        problemas.push(`bloque "${bloque.id}": se requiere a sí mismo`);
      }
    }
  });

  if (problemas.length > 0) throw new ErrorDeContenido(problemas);

  let mapa: Mapa;
  try {
    mapa = calcularMapa(bloques);
  } catch (error) {
    throw new ErrorDeContenido([(error as Error).message]);
  }

  return { bloques, mapa, archivos };
}
