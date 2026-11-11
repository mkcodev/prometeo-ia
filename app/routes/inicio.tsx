import { Link } from "react-router";
import { MapaBloques } from "~/components/MapaBloques";
import { PLAN_URL } from "~/config";
import { bloques, contarRevisados } from "~/contenido";
import { t } from "~/i18n";

export default function Inicio() {
  const revisados = contarRevisados();
  const primero = bloques[0];

  return (
    <div className="mapa:grid mapa:h-[calc(100dvh-3.5rem)] mapa:grid-cols-[minmax(22rem,28rem)_1fr]">
      <section className="flex flex-col px-5 pb-12 pt-10 mapa:overflow-y-auto mapa:border-r mapa:border-borde mapa:px-10 mapa:pt-14">
        <h1 className="titular text-[clamp(2.4rem,9vw,3.4rem)] mapa:text-[clamp(2.6rem,3.6vw,3.5rem)]">
          {t("app.lema")}
        </h1>
        <p className="lectura mt-7 max-w-[36ch] text-[1.15rem]">
          {t("inicio.entrada", { bloques: bloques.length })}
        </p>

        <div className="mt-9 flex flex-col items-start gap-4">
          <div>
            <Link
              to="/diagnostico"
              viewTransition
              className="inline-flex min-h-12 items-center rounded-md bg-brasa px-5 font-semibold text-sobre-brasa hover:brightness-110"
            >
              {t("inicio.diagnostico")}
            </Link>
            <p className="mt-2 text-sm text-ceniza">{t("inicio.diagnosticoNota")}</p>
          </div>
          {primero ? (
            <Link to={`/bloque/${primero.id}`} viewTransition className="enlace font-medium">
              {t("inicio.empezar")}
            </Link>
          ) : null}
        </div>

        <div className="mt-auto space-y-2 pt-14 text-sm text-ceniza">
          <p>
            {t("inicio.privacidad")}{" "}
            <Link to="/acerca" viewTransition className="enlace text-texto">
              {t("inicio.privacidadEnlace")}
            </Link>
          </p>
          <p>
            {revisados === 0
              ? t("inicio.construccionNinguno")
              : t("inicio.construccionParcial", { revisados, total: bloques.length })}{" "}
            <a href={PLAN_URL} className="enlace text-texto">
              {t("inicio.planEnlace")}
            </a>
          </p>
        </div>
      </section>

      <section aria-labelledby="titulo-mapa" className="px-5 pb-10 mapa:p-0">
        <h2 id="titulo-mapa" className="titular mb-6 text-center text-2xl mapa:sr-only">
          {t("mapa.titulo")}
        </h2>
        <MapaBloques />
      </section>
    </div>
  );
}
