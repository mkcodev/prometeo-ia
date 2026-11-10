import { useSyncExternalStore } from "react";

export type Tema = "oscuro" | "claro";

const CLAVE_AJUSTES = "prometeo:v1:ajustes";
const EVENTO = "prometeo:tema";

/**
 * Se ejecuta en el <head>, antes del primer pintado, para que quien eligió
 * el tema claro no vea un destello oscuro. El HTML prerenderizado es siempre oscuro.
 */
export const SCRIPT_TEMA = `(function(){try{var a=JSON.parse(localStorage.getItem(${JSON.stringify(CLAVE_AJUSTES)})||"{}");if(a&&a.tema==="claro")document.documentElement.dataset.theme="claro"}catch(e){}})()`;

function leerAjustes(): Record<string, unknown> {
  try {
    const crudo: unknown = JSON.parse(localStorage.getItem(CLAVE_AJUSTES) ?? "{}");
    return crudo && typeof crudo === "object" && !Array.isArray(crudo)
      ? (crudo as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function aplicar(tema: Tema): void {
  document.documentElement.dataset.theme = tema;
}

function temaActual(): Tema {
  return document.documentElement.dataset.theme === "claro" ? "claro" : "oscuro";
}

export function cambiarTema(tema: Tema): void {
  aplicar(tema);
  try {
    localStorage.setItem(CLAVE_AJUSTES, JSON.stringify({ ...leerAjustes(), tema }));
  } catch {
    // Almacenamiento lleno o bloqueado: el tema se aplica igual, solo no se recuerda.
  }
  window.dispatchEvent(new Event(EVENTO));
}

function suscribir(avisar: () => void): () => void {
  const alCambiarEnOtraPestaña = (evento: StorageEvent) => {
    if (evento.key !== CLAVE_AJUSTES) return;
    aplicar(leerAjustes().tema === "claro" ? "claro" : "oscuro");
    avisar();
  };
  window.addEventListener(EVENTO, avisar);
  window.addEventListener("storage", alCambiarEnOtraPestaña);
  return () => {
    window.removeEventListener(EVENTO, avisar);
    window.removeEventListener("storage", alCambiarEnOtraPestaña);
  };
}

/** En el prerender y durante la hidratación devuelve "oscuro"; después, el tema real. */
export function useTema(): Tema {
  return useSyncExternalStore(suscribir, temaActual, () => "oscuro");
}
