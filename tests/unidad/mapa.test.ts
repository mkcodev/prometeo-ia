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
  it("coloca cada nodo una capa después de su requisito más lejano", () => {
    const mapa = calcularMapa([nodo("a", 1), nodo("b", 2, ["a"]), nodo("c", 3, ["a"]), nodo("d", 4, ["b", "c"])]);
    const capa = Object.fromEntries(mapa.nodos.map((n) => [n.id, n.capa]));
    expect(capa).toEqual({ a: 0, b: 1, c: 1, d: 2 });
    expect(mapa.capas).toBe(3);
  });

  it("dibuja de arriba abajo: el origen tiene la y más baja", () => {
    const mapa = calcularMapa([nodo("a", 1), nodo("b", 2, ["a"]), nodo("c", 3, ["b"])]);
    const y = Object.fromEntries(mapa.nodos.map((n) => [n.id, n.y]));
    expect(y.a).toBeLessThan(y.b ?? 0);
    expect(y.b).toBeLessThan(y.c ?? 0);
  });

  it("orienta cada arista del requisito, arriba, al bloque que desbloquea, abajo", () => {
    const mapa = calcularMapa([nodo("a", 1), nodo("b", 2, ["a"]), nodo("c", 3, ["a", "b"])]);
    const y = new Map(mapa.nodos.map((n) => [n.id, n.y]));
    for (const arista of mapa.aristas) {
      expect(y.get(arista.desde)).toBeLessThan(y.get(arista.hasta) ?? 0);
    }
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

  it("hace crecer el texto hacia arriba si una arista baja por el lado del nombre", () => {
    // a tiene debajo a b (izquierda) y a c (derecha): su nombre va a la derecha y c lo tacharía.
    const mapa = calcularMapa([nodo("a", 1), nodo("b", 2, ["a"]), nodo("c", 3, ["a"]), nodo("d", 4, ["b", "c"])]);
    const crece = Object.fromEntries(mapa.nodos.map((n) => [n.id, n.crece]));
    expect(crece.a).toBe("arriba");
    // b lleva el nombre a la izquierda, donde no hay aristas; c y d no tienen nada que baje por su lado.
    expect(crece.b).toBe("abajo");
    expect(crece.c).toBe("abajo");
    expect(crece.d).toBe("abajo");
  });

  it("rechaza dependencias circulares", () => {
    expect(() => calcularMapa([nodo("a", 1, ["b"]), nodo("b", 2, ["a"])])).toThrow(/circular/);
  });
});
