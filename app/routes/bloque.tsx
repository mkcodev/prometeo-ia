import { Link } from "react-router";
import type { Route } from "./+types/bloque";
import { bloquePorId, desbloqueadosPor, horasDe, type Bloque } from "~/contenido";
import { t, type Clave } from "~/i18n";

export const meta: Route.MetaFunction = ({ params }) => {
  const bloque = bloquePorId(params.bloqueId);
  if (!bloque) return [{ title: `${t("bloque.noExiste")} · ${t("app.nombre")}` }];
  return [
    { title: `${bloque.titulo} · ${t("app.nombre")}` },
    { name: "description", content: bloque.resumen },
    { property: "og:title", content: bloque.titulo },
    { property: "og:description", content: bloque.resumen },
  ];
};

const VALORACIONES: { clave: Clave; campo: keyof Bloque["puntuacion"] }[] = [
  { clave: "bloque.prioridad", campo: "prioridad" },
  { clave: "bloque.demanda", campo: "demanda" },
  { clave: "bloque.dificultad", campo: "dificultad" },
  { clave: "bloque.retornoEmpleo", campo: "retornoEmpleo" },
];

function Medidor({ valor }: { valor: number }) {
  return (
    <span aria-hidden="true" className="flex gap-[3px]">
      {Array.from({ length: 10 }, (_, indice) => (
        <span key={indice} className={`h-2.5 w-3 rounded-[1px] ${indice < valor ? "bg-texto" : "bg-borde"}`} />
      ))}
    </span>
  );
}

function ListaDeBloques({ lista, vacio }: { lista: Bloque[]; vacio: Clave }) {
  if (lista.length === 0) return <p className="text-ceniza">{t(vacio)}</p>;
  return (
    <ul className="space-y-1.5">
      {lista.map((otro) => (
        <li key={otro.id}>
          <Link to={`/bloque/${otro.id}`} viewTransition className="enlace">
            {otro.titulo}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function PaginaBloque({ params }: Route.ComponentProps) {
  const bloque = bloquePorId(params.bloqueId);

  if (!bloque) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16">
        <h1 className="titular text-3xl">{t("bloque.noExiste")}</h1>
        <p className="mt-6">
          <Link to="/" viewTransition className="enlace">
            {t("bloque.volver")}
          </Link>
        </p>
      </div>
    );
  }

  const requisitos = bloque.requiere.map(bloquePorId).filter((otro) => otro !== undefined);
  const etiqueta = bloque.opcional ? t("bloque.opcional") : bloque.enParalelo ? t("bloque.enParalelo") : null;

  return (
    <article className="mx-auto max-w-2xl px-5 pb-20 pt-8 mapa:pt-12">
      <p>
        <Link to="/" viewTransition className="enlace text-sm text-ceniza">
          {t("bloque.volver")}
        </Link>
      </p>

      <p className="mt-10 text-ceniza">
        {t("bloque.numero", { orden: bloque.orden })}
        {etiqueta ? `. ${etiqueta}.` : null}
      </p>
      <h1 className="titular mt-2 text-[clamp(2rem,7vw,3rem)]">{bloque.titulo}</h1>
      <p className="lectura mt-6 text-[1.2rem]">{bloque.resumen}</p>

      <p className="mt-8 border-l-2 border-brasa pl-4 text-ceniza">{t("bloque.pendiente")}</p>

      <section aria-labelledby="valoracion" className="mt-14">
        <h2 id="valoracion" className="text-lg font-bold">
          {t("bloque.valoracion")}
        </h2>
        <dl className="mt-4 divide-y divide-borde border-y border-borde">
          {VALORACIONES.map(({ clave, campo }) => {
            const valor = bloque.puntuacion[campo];
            return (
              <div key={campo} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-3">
                <dt>{t(clave)}</dt>
                <dd className="flex items-center gap-4">
                  {valor === null ? (
                    <span className="text-ceniza">{t("bloque.noAplica")}</span>
                  ) : (
                    <>
                      <Medidor valor={valor} />
                      <span className="w-[4.5rem] text-right tabular-nums">{t("bloque.deDiez", { valor })}</span>
                    </>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
        <p className="mt-3 text-sm text-ceniza">{t("bloque.valoracionNota")}</p>
      </section>

      <section aria-labelledby="dedicacion" className="mt-12">
        <h2 id="dedicacion" className="text-lg font-bold">
          {t("bloque.dedicacion")}
        </h2>
        <dl className="mt-4 grid grid-cols-3 gap-4">
          {(
            [
              ["bloque.horasConceptos", bloque.horas.conceptos],
              ["bloque.horasProyecto", bloque.horas.proyecto],
              ["bloque.horasTotal", horasDe(bloque)],
            ] as const
          ).map(([clave, horas]) => (
            <div key={clave}>
              <dt className="text-sm text-ceniza">{t(clave)}</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums">{t("mapa.horas", { horas })}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-12 grid gap-10 sm:grid-cols-2">
        <section aria-labelledby="requiere">
          <h2 id="requiere" className="mb-3 text-lg font-bold">
            {t("bloque.requiere")}
          </h2>
          <ListaDeBloques lista={requisitos} vacio="bloque.requiereNada" />
        </section>
        <section aria-labelledby="desbloquea">
          <h2 id="desbloquea" className="mb-3 text-lg font-bold">
            {t("bloque.desbloquea")}
          </h2>
          <ListaDeBloques lista={desbloqueadosPor(bloque.id)} vacio="bloque.desbloqueaNada" />
        </section>
      </div>
    </article>
  );
}
