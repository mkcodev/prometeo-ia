import { Link, useLocation } from "react-router";
import { SECCIONES_PENDIENTES, urlIssue, type SeccionPendiente } from "~/config";
import { t, type Clave } from "~/i18n";

function seccionDe(ruta: string): SeccionPendiente | undefined {
  const nombre = ruta.split("/").filter(Boolean)[0] ?? "";
  return nombre in SECCIONES_PENDIENTES ? (nombre as SeccionPendiente) : undefined;
}

export function meta({ location }: { location: { pathname: string } }) {
  const seccion = seccionDe(location.pathname);
  const titulo = seccion ? t(`seccion.${seccion}` as Clave) : t("app.nombre");
  return [{ title: `${titulo} · ${t("app.nombre")}` }];
}

export default function Pendiente() {
  const seccion = seccionDe(useLocation().pathname);
  if (!seccion) return null;

  return (
    <div className="mx-auto max-w-xl px-5 py-16 mapa:py-24">
      <h1 className="titular text-[clamp(2rem,7vw,3rem)]">{t(`seccion.${seccion}` as Clave)}</h1>
      <p className="lectura mt-6 text-[1.15rem]">{t("pendiente.mensaje")}</p>
      <ul className="mt-8 space-y-2">
        <li>
          <a href={urlIssue(SECCIONES_PENDIENTES[seccion])} className="enlace">
            {t("pendiente.issue")}
          </a>
        </li>
        <li>
          <Link to="/" viewTransition className="enlace">
            {t("pendiente.volver")}
          </Link>
        </li>
      </ul>
    </div>
  );
}
