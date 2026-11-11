import { useEffect, useRef, type CSSProperties } from "react";
import { Link } from "react-router";
import { bloquePorId, bloques, horasDe, mapa, type Bloque } from "~/contenido";
import { enumerar, t } from "~/i18n";

type Estado = "inicio" | "disponible" | "bloqueado";

/**
 * Estado de un bloque sin progreso guardado. Solo el primer bloque lleva la
 * brasa, como marca de "empieza aquí" (D-026); los demás que no requieren nada
 * quedan disponibles, en contorno. La entrega 1.3a lo sustituye por el estado
 * real del usuario.
 */
function estadoInicial(bloque: Bloque, primero: string | undefined): Estado {
  if (bloque.id === primero) return "inicio";
  return bloque.requiere.length === 0 ? "disponible" : "bloqueado";
}

function descripcionEstado(bloque: Bloque, estado: Estado): string {
  if (estado === "inicio") return t("mapa.estado.inicio");
  if (estado === "disponible") return t("mapa.estado.disponible");
  const requisitos = bloque.requiere.map((id) => bloquePorId(id)?.tituloCorto ?? id);
  return t("mapa.estado.bloqueado", { requisitos: enumerar(requisitos) });
}

const nodoDe = new Map(mapa.nodos.map((nodo) => [nodo.id, nodo]));

/** Altura de la pantalla, de 0 a 1, a la que va la punta del raíl mientras se recorre el mapa. */
const ALTURA_PUNTA = 0.72;
/** Píxeles de scroll, antes del fondo de la página, en los que la punta acelera hasta el final del raíl. */
const TRAMO_FINAL = 320;

/**
 * En móvil, recorre el raíl del mapa al ritmo del scroll (D-027): la punta baja
 * y sube con la página y cada bloque aparece cuando la punta llega a su nodo.
 *
 * Es una mejora progresiva. El HTML prerenderizado muestra el mapa entero; el
 * efecto solo se activa tras montar, en pantallas estrechas y si el usuario no
 * ha pedido movimiento reducido. Todo el aspecto vive en CSS: aquí solo se
 * escriben `--avance` y `data-visto`.
 */
function useRecorridoDelRail() {
  const refLista = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const lista = refLista.current;
    if (!lista) return;

    const estrecha = window.matchMedia("(width < 64rem)");
    const calma = window.matchMedia("(prefers-reduced-motion: reduce)");
    const nodos = Array.from(lista.querySelectorAll<HTMLElement>(".mapa-nodo"));
    let cuadro = 0;
    let activo = false;

    const medir = () => {
      cuadro = 0;
      if (!activo) return;
      const caja = lista.getBoundingClientRect();
      const pantalla = window.innerHeight;
      const normal = Math.min(caja.height, Math.max(0, pantalla * ALTURA_PUNTA - caja.top));
      // Los últimos nodos quedan por debajo de la altura de la punta cuando la página
      // se acaba: en el tramo final del scroll la punta acelera hasta llegar al final.
      const resto = document.documentElement.scrollHeight - pantalla - window.scrollY;
      const cierre = Math.min(1, Math.max(0, 1 - resto / TRAMO_FINAL));
      const avance = normal + (caja.height - normal) * cierre;
      lista.style.setProperty("--avance", `${Math.round(avance)}px`);
      for (const nodo of nodos) {
        const marcador = nodo.querySelector<HTMLElement>(".mapa-marcador");
        const centro = nodo.offsetTop + (marcador ? marcador.offsetTop + marcador.offsetHeight / 2 : 0);
        nodo.dataset.visto = String(centro <= avance);
      }
    };

    const pedirMedida = () => {
      if (cuadro === 0) cuadro = window.requestAnimationFrame(medir);
    };

    const ajustar = () => {
      const debe = estrecha.matches && !calma.matches;
      if (debe === activo) return;
      activo = debe;
      if (activo) {
        lista.dataset.vivo = "true";
        medir();
      } else {
        delete lista.dataset.vivo;
        lista.style.removeProperty("--avance");
        for (const nodo of nodos) delete nodo.dataset.visto;
      }
    };

    ajustar();
    window.addEventListener("scroll", pedirMedida, { passive: true });
    window.addEventListener("resize", pedirMedida);
    estrecha.addEventListener("change", ajustar);
    calma.addEventListener("change", ajustar);

    return () => {
      window.removeEventListener("scroll", pedirMedida);
      window.removeEventListener("resize", pedirMedida);
      estrecha.removeEventListener("change", ajustar);
      calma.removeEventListener("change", ajustar);
      if (cuadro !== 0) window.cancelAnimationFrame(cuadro);
      activo = false;
      delete lista.dataset.vivo;
      lista.style.removeProperty("--avance");
      for (const nodo of nodos) delete nodo.dataset.visto;
    };
  }, []);

  return refLista;
}

export function MapaBloques() {
  const primero = bloques[0]?.id;
  const refLista = useRecorridoDelRail();

  return (
    <div className="mapa-marco relative mapa:h-full mapa:min-h-[38rem]">
      {/* Las aristas son decorativas: la relación entre bloques se lee en cada nodo. */}
      <svg aria-hidden="true" className="mapa-aristas">
        {mapa.aristas.map((arista) => {
          const desde = nodoDe.get(arista.desde);
          const hasta = nodoDe.get(arista.hasta);
          if (!desde || !hasta) return null;
          return (
            <line
              key={`${arista.desde}-${arista.hasta}`}
              className="arista"
              pathLength={1}
              x1={`${desde.x}%`}
              y1={`${desde.y}%`}
              x2={`${hasta.x}%`}
              y2={`${hasta.y}%`}
              style={{ "--capa": desde.capa } as CSSProperties}
            />
          );
        })}
      </svg>

      <ol ref={refLista} className="mapa-lista">
        {bloques.map((bloque) => {
          const nodo = nodoDe.get(bloque.id);
          const estado = estadoInicial(bloque, primero);
          const lateral = bloque.opcional || bloque.enParalelo;
          return (
            <li
              key={bloque.id}
              className="mapa-nodo"
              data-etiqueta={nodo?.etiqueta ?? "derecha"}
              data-crece={nodo?.crece ?? "abajo"}
              style={{ "--x": `${nodo?.x ?? 50}%`, "--y": `${nodo?.y ?? 50}%` } as CSSProperties}
            >
              <Link to={`/bloque/${bloque.id}`} viewTransition className="mapa-enlace">
                <span aria-hidden="true" className="mapa-marcador" data-estado={estado} data-lateral={lateral} />
                <span className="mapa-texto min-w-0">
                  <span
                    className={`mapa-titulo block font-semibold leading-snug ${
                      estado === "bloqueado" ? "text-ceniza" : "text-texto"
                    }`}
                  >
                    <span className="mr-2 font-normal tabular-nums text-ceniza">{bloque.orden}</span>
                    <span className="mapa:hidden">{bloque.titulo}</span>
                    <span className="hidden mapa:inline">{bloque.tituloCorto}</span>
                  </span>
                  <span className="mapa-detalle mt-0.5 block text-sm text-ceniza">
                    {bloque.id === primero ? (
                      <span className="text-brasa">{t("mapa.empiezaAqui")}</span>
                    ) : bloque.opcional ? (
                      t("mapa.opcional")
                    ) : bloque.enParalelo ? (
                      t("mapa.enParalelo")
                    ) : (
                      t("mapa.horas", { horas: horasDe(bloque) })
                    )}
                  </span>
                  <span className="sr-only">{descripcionEstado(bloque, estado)}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
