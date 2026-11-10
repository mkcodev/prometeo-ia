import type { CSSProperties } from "react";
import { Link } from "react-router";
import { bloquePorId, bloques, horasDe, mapa, type Bloque } from "~/contenido";
import { enumerar, t } from "~/i18n";

type Estado = "bloqueado" | "disponible";

/**
 * Estado de un bloque sin progreso guardado: disponible si no requiere nada.
 * La entrega 1.3a lo sustituye por el estado real del usuario.
 */
function estadoInicial(bloque: Bloque): Estado {
  return bloque.requiere.length === 0 ? "disponible" : "bloqueado";
}

function descripcionEstado(bloque: Bloque, estado: Estado): string {
  if (estado === "disponible") return t("mapa.estado.disponible");
  const requisitos = bloque.requiere.map((id) => bloquePorId(id)?.tituloCorto ?? id);
  return t("mapa.estado.bloqueado", { requisitos: enumerar(requisitos) });
}

const nodoDe = new Map(mapa.nodos.map((nodo) => [nodo.id, nodo]));

export function MapaBloques() {
  const primero = bloques[0]?.id;

  return (
    <div className="relative mapa:h-full mapa:min-h-[38rem]">
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

      <ol className="mapa-lista">
        {bloques.map((bloque) => {
          const nodo = nodoDe.get(bloque.id);
          const estado = estadoInicial(bloque);
          const lateral = bloque.opcional || bloque.enParalelo;
          return (
            <li
              key={bloque.id}
              className="mapa-nodo"
              data-etiqueta={nodo?.etiqueta ?? "derecha"}
              style={{ "--x": `${nodo?.x ?? 50}%`, "--y": `${nodo?.y ?? 50}%` } as CSSProperties}
            >
              <Link to={`/bloque/${bloque.id}`} viewTransition className="mapa-enlace">
                <span aria-hidden="true" className="mapa-marcador" data-estado={estado} data-lateral={lateral} />
                <span className="min-w-0">
                  <span
                    className={`mapa-titulo block font-semibold leading-snug ${
                      estado === "bloqueado" ? "text-ceniza" : "text-texto"
                    }`}
                  >
                    <span className="mr-2 font-normal tabular-nums text-ceniza">{bloque.orden}</span>
                    <span className="mapa:hidden">{bloque.titulo}</span>
                    <span className="hidden mapa:inline">{bloque.tituloCorto}</span>
                  </span>
                  <span className="mt-0.5 block text-sm text-ceniza">
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
