import * as generado from "virtual:contenido";
import type { Bloque, EstadoRevision } from "../../scripts/contenido/esquema.ts";
import type { Mapa, NodoMapa } from "../../scripts/contenido/mapa.ts";

export type { Bloque, EstadoRevision, Mapa, NodoMapa };

// Validado con Zod en el build (scripts/contenido/cargar.ts); aquí solo se tipa.
export const bloques = generado.bloques as Bloque[];
export const mapa = generado.mapa as Mapa;

const porId = new Map(bloques.map((bloque) => [bloque.id, bloque]));

export function bloquePorId(id: string): Bloque | undefined {
  return porId.get(id);
}

export function horasDe(bloque: Bloque): number {
  return bloque.horas.conceptos + bloque.horas.proyecto;
}

/** Bloques que tienen a este como requisito. Se deriva; nadie lo escribe a mano. */
export function desbloqueadosPor(id: string): Bloque[] {
  return bloques.filter((bloque) => bloque.requiere.includes(id));
}

/**
 * Estado de revisión de un bloque, derivado del de sus conceptos.
 * Todavía no hay conceptos escritos: todo está pendiente.
 */
export function estadoRevision(_bloque: Bloque): EstadoRevision {
  return "pendiente";
}

export function contarRevisados(): number {
  return bloques.filter((bloque) => estadoRevision(bloque) === "revisado").length;
}
