import es from "./es.json";

/**
 * Textos de la interfaz. Ningún componente lleva texto escrito a mano:
 * todo pasa por `t()`, y las claves están tipadas contra el archivo de idioma.
 * Añadir un idioma es añadir un JSON con las mismas claves.
 */
export type Clave = keyof typeof es;

export const IDIOMA = "es";

const textos: Record<Clave, string> = es;
const numero = new Intl.NumberFormat("es-ES");

export function t(clave: Clave, valores?: Record<string, string | number>): string {
  const texto = textos[clave];
  if (!valores) return texto;
  return texto.replace(/\{(\w+)\}/g, (marca, nombre: string) => {
    const valor = valores[nombre];
    if (valor === undefined) return marca;
    return typeof valor === "number" ? numero.format(valor) : valor;
  });
}

const lista = new Intl.ListFormat("es-ES", { style: "long", type: "conjunction" });

export function enumerar(elementos: string[]): string {
  return lista.format(elementos);
}
