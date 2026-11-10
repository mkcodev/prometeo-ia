import { describe, expect, it } from "vitest";
import { calcularMapa, type NodoEntrada } from "../../scripts/contenido/mapa.ts";

const nodo = (id: string, orden: number, requiere: string[] = [], extra: Partial<NodoEntrada> = {}): NodoEntrada => ({
  id,
  orden,
  requiere,
  opcional: false,
  enParalelo: false,
  ...extra,
});

describe("calcularMapa", () => {
  it("coloca cada nodo una capa por encima de su requisito más alto", () => {
    const mapa = calcularMapa([nodo("a", 1), nodo("b", 2, ["a"]), nodo("c", 3, ["a"]), nodo("d", 4, ["b", "c"])]);
    const capa = Object.fromEntries(mapa.nodos.map((n) => [n.id, n.capa]));
    expect(capa).toEqual({ a: 0, b: 1, c: 1, d: 2 });
    expect(mapa.capas).toBe(3);
  });

  it("dibuja de abajo arriba: la base tiene la y más alta", () => {
    const mapa = calcularMapa([nodo("a", 1), nodo("b", 2, ["a"]), nodo("c", 3, ["b"])]);
    const y = Object.fromEntries(mapa.nodos.map((n) => [n.id, n.y]));
    expect(y.a).toBeGreaterThan(y.b ?? 0);
    expect(y.b).toBeGreaterThan(y.c ?? 0);
  });

  it("aparta a la derecha los nodos opcionales o en paralelo", () => {
    const mapa = calcularMapa([nodo("a", 1), nodo("extra", 2, [], { enParalelo: true })]);
    const [a, extra] = mapa.nodos;
    expect(extra?.lateral).toBe(true);
    expect(extra?.x).toBeGreaterThan(a?.x ?? 0);
  });

  it("no solapa nodos dentro de una misma capa", () => {
    const mapa = calcularMapa([nodo("a", 1), nodo("b", 2, ["a"]), nodo("c", 3, ["a"]), nodo("d", 4, ["a"])]);
    const xs = mapa.nodos.filter((n) => n.capa === 1).map((n) => n.x);
    expect(new Set(xs).size).toBe(xs.length);
  });

  it("es determinista aunque cambie el orden de entrada", () => {
    const nodos = [nodo("a", 1), nodo("b", 2, ["a"]), nodo("c", 3, ["a"]), nodo("d", 4, ["b", "c"])];
    expect(calcularMapa(nodos.slice().reverse())).toEqual(calcularMapa(nodos));
  });

  it("genera una arista por cada requisito", () => {
    const mapa = calcularMapa([nodo("a", 1), nodo("b", 2, ["a"]), nodo("c", 3, ["a", "b"])]);
    expect(mapa.aristas).toEqual([
      { desde: "a", hasta: "b" },
      { desde: "a", hasta: "c" },
      { desde: "b", hasta: "c" },
    ]);
  });

  it("escribe el nombre a la izquierda si todas las aristas inclinadas salen a la derecha", () => {
    // b y c cuelgan de a; d depende de ambos. b queda a la izquierda y sus vecinos, a su derecha.
    const mapa = calcularMapa([nodo("a", 1), nodo("b", 2, ["a"]), nodo("c", 3, ["a"]), nodo("d", 4, ["b", "c"])]);
    const lado = Object.fromEntries(mapa.nodos.map((n) => [n.id, n.etiqueta]));
    expect(lado.b).toBe("izquierda");
    expect(lado.c).toBe("derecha");
    // a tiene aristas a ambos lados: se queda a la derecha.
    expect(lado.a).toBe("derecha");
  });

  it("rechaza dependencias circulares", () => {
    expect(() => calcularMapa([nodo("a", 1, ["b"]), nodo("b", 2, ["a"])])).toThrow(/circular/);
  });
});
