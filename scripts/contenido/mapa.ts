/**
 * Layout determinista del mapa de habilidades.
 *
 * Capas por camino más largo: un nodo va una capa después de su requisito
 * más lejano. La capa 0 es el origen y el mapa se dibuja de arriba abajo, en
 * el mismo orden de lectura que la lista de móvil. Dentro
 * de una capa, los nodos del camino principal se centran y los laterales
 * (opcionales o en paralelo) se apartan a la derecha. Nadie coloca nodos a mano.
 */

export interface NodoEntrada {
  id: string;
  orden: number;
  requiere: string[];
  opcional: boolean;
  enParalelo: boolean;
}

export interface NodoMapa {
  id: string;
  capa: number;
  /** Posición horizontal, de 0 a 100. */
  x: number;
  /** Posición vertical, de 0 (arriba, donde está la capa 0) a 100 (abajo). */
  y: number;
  lateral: boolean;
  /**
   * Lado del nodo en el que se escribe su nombre. Va a la izquierda cuando
   * todas sus aristas inclinadas salen hacia la derecha, para que ninguna
   * línea cruce el texto.
   */
  etiqueta: "derecha" | "izquierda";
  /**
   * Hacia dónde crece el texto desde el marcador. Lo normal es "abajo": el
   * nombre a la altura del marcador y el detalle debajo. Pasa a "arriba" cuando
   * por el lado del texto sale una arista inclinada hacia abajo, que tacharía
   * el detalle.
   */
  crece: "abajo" | "arriba";
}

export interface AristaMapa {
  desde: string;
  hasta: string;
}

export interface Mapa {
  nodos: NodoMapa[];
  aristas: AristaMapa[];
  capas: number;
}

const CENTRO = 40;
const PASO = 30;
const CARRIL_LATERAL = 80;
const MARGEN_Y = 9;

export function calcularMapa(entrada: NodoEntrada[]): Mapa {
  const porId = new Map(entrada.map((nodo) => [nodo.id, nodo]));
  const capaDe = new Map<string, number>();
  const enCurso = new Set<string>();

  const capa = (id: string): number => {
    const conocida = capaDe.get(id);
    if (conocida !== undefined) return conocida;
    if (enCurso.has(id)) throw new Error(`Dependencia circular en el bloque "${id}"`);
    enCurso.add(id);
    const nodo = porId.get(id);
    if (!nodo) throw new Error(`El bloque "${id}" no existe`);
    const valor = nodo.requiere.length === 0 ? 0 : Math.max(...nodo.requiere.map(capa)) + 1;
    enCurso.delete(id);
    capaDe.set(id, valor);
    return valor;
  };

  for (const nodo of entrada) capa(nodo.id);

  const capas = Math.max(0, ...capaDe.values()) + 1;
  const x = new Map<string, number>();

  for (let indice = 0; indice < capas; indice++) {
    const enCapa = entrada
      .filter((nodo) => capaDe.get(nodo.id) === indice)
      .sort((a, b) => a.orden - b.orden);
    const principales = enCapa.filter((nodo) => !nodo.opcional && !nodo.enParalelo);
    const laterales = enCapa.filter((nodo) => nodo.opcional || nodo.enParalelo);

    // Ordenar por la posición media de los requisitos reduce los cruces.
    const baricentro = (nodo: NodoEntrada): number => {
      const posiciones = nodo.requiere
        .map((id) => x.get(id))
        .filter((valor): valor is number => valor !== undefined);
      if (posiciones.length === 0) return CENTRO;
      return posiciones.reduce((suma, valor) => suma + valor, 0) / posiciones.length;
    };
    principales.sort((a, b) => baricentro(a) - baricentro(b) || a.orden - b.orden);

    principales.forEach((nodo, posicion) => {
      const desplazamiento = posicion - (principales.length - 1) / 2;
      x.set(nodo.id, CENTRO + desplazamiento * PASO);
    });
    laterales.forEach((nodo, posicion) => {
      x.set(nodo.id, CARRIL_LATERAL + posicion * 10);
    });
  }

  const vecinos = new Map<string, string[]>(entrada.map((nodo) => [nodo.id, []]));
  for (const nodo of entrada) {
    for (const requisito of nodo.requiere) {
      vecinos.get(nodo.id)?.push(requisito);
      vecinos.get(requisito)?.push(nodo.id);
    }
  }
  const ladoEtiqueta = (id: string): NodoMapa["etiqueta"] => {
    const propia = x.get(id) ?? CENTRO;
    const otras = (vecinos.get(id) ?? []).map((vecino) => x.get(vecino) ?? CENTRO);
    const hayALaDerecha = otras.some((otra) => otra > propia);
    const hayALaIzquierda = otras.some((otra) => otra < propia);
    return hayALaDerecha && !hayALaIzquierda ? "izquierda" : "derecha";
  };
  const sentidoTexto = (id: string, lado: NodoMapa["etiqueta"]): NodoMapa["crece"] => {
    const propia = x.get(id) ?? CENTRO;
    const suCapa = capaDe.get(id) ?? 0;
    const delLado = (vecinos.get(id) ?? []).filter((vecino) => {
      const otra = x.get(vecino) ?? CENTRO;
      return lado === "derecha" ? otra > propia : otra < propia;
    });
    const bajan = delLado.some((vecino) => (capaDe.get(vecino) ?? 0) > suCapa);
    const suben = delLado.some((vecino) => (capaDe.get(vecino) ?? 0) < suCapa);
    return bajan && !suben ? "arriba" : "abajo";
  };

  const alto = 100 - MARGEN_Y * 2;
  const nodos: NodoMapa[] = entrada
    .slice()
    .sort((a, b) => a.orden - b.orden)
    .map((nodo) => {
      const suCapa = capaDe.get(nodo.id) ?? 0;
      const etiqueta = ladoEtiqueta(nodo.id);
      return {
        id: nodo.id,
        capa: suCapa,
        x: redondear(x.get(nodo.id) ?? CENTRO),
        y: redondear(capas === 1 ? 50 : MARGEN_Y + (suCapa / (capas - 1)) * alto),
        lateral: nodo.opcional || nodo.enParalelo,
        etiqueta,
        crece: sentidoTexto(nodo.id, etiqueta),
      };
    });

  const aristas: AristaMapa[] = entrada
    .slice()
    .sort((a, b) => a.orden - b.orden)
    .flatMap((nodo) => nodo.requiere.map((requisito) => ({ desde: requisito, hasta: nodo.id })));

  return { nodos, aristas, capas };
}

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}
