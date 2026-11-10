import { describe, expect, it } from "vitest";
import { cargarContenido } from "../../scripts/contenido/cargar.ts";
import { esquemaBloque } from "../../scripts/contenido/esquema.ts";

const bloqueValido = {
  id: "ejemplo",
  orden: 1,
  titulo: "Bloque de ejemplo",
  tituloCorto: "Ejemplo",
  resumen: "Un resumen lo bastante largo para pasar la validación.",
  puntuacion: { prioridad: 5, demanda: 5, dificultad: 5, retornoEmpleo: 5 },
  horas: { conceptos: 10, proyecto: 5 },
};

describe("esquema de bloque", () => {
  it("acepta un bloque completo y rellena los valores por defecto", () => {
    const bloque = esquemaBloque.parse(bloqueValido);
    expect(bloque.requiere).toEqual([]);
    expect(bloque.opcional).toBe(false);
    expect(bloque.enParalelo).toBe(false);
  });

  it("rechaza un bloque al que le falta un campo", () => {
    const { resumen: _resumen, ...sinResumen } = bloqueValido;
    expect(esquemaBloque.safeParse(sinResumen).success).toBe(false);
  });

  it("rechaza campos que no existen, para cazar erratas", () => {
    expect(esquemaBloque.safeParse({ ...bloqueValido, prerequisitos: [] }).success).toBe(false);
  });

  it("rechaza puntuaciones fuera de 1 a 10", () => {
    const fuera = { ...bloqueValido, puntuacion: { ...bloqueValido.puntuacion, prioridad: 11 } };
    expect(esquemaBloque.safeParse(fuera).success).toBe(false);
  });

  it("rechaza ids que no sirven como parte de una URL", () => {
    expect(esquemaBloque.safeParse({ ...bloqueValido, id: "Con Espacios" }).success).toBe(false);
  });
});

describe("contenido del repositorio", () => {
  const { bloques, mapa } = cargarContenido();

  it("carga los 10 bloques en orden", () => {
    expect(bloques.map((bloque) => bloque.orden)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("empieza por fundamentos, que no requiere nada", () => {
    expect(bloques[0]?.id).toBe("fundamentos");
    expect(bloques[0]?.requiere).toEqual([]);
  });

  it("coloca en el mapa todos los bloques, con fundamentos en la base", () => {
    expect(mapa.nodos).toHaveLength(bloques.length);
    expect(mapa.nodos.find((nodo) => nodo.id === "fundamentos")?.capa).toBe(0);
  });
});
