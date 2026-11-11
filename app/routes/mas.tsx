import { Link } from "react-router";
import { REPO_URL } from "~/config";
import { t, type Clave } from "~/i18n";

export function meta() {
  return [{ title: `${t("mas.titulo")} · ${t("app.nombre")}` }];
}

const SECCIONES: { a: string; clave: Clave }[] = [
  { a: "/proyectos", clave: "seccion.proyectos" },
  { a: "/retos", clave: "seccion.retos" },
  { a: "/diagnostico", clave: "seccion.diagnostico" },
  { a: "/plan", clave: "seccion.plan" },
  { a: "/glosario", clave: "seccion.glosario" },
  { a: "/ajustes", clave: "seccion.ajustes" },
  { a: "/acerca", clave: "mas.acerca" },
];

export default function Mas() {
  return (
    <div className="mx-auto max-w-xl px-5 py-10 mapa:py-16">
      <h1 className="titular text-[clamp(2rem,7vw,3rem)]">{t("mas.titulo")}</h1>
      <ul className="mt-8 divide-y divide-borde border-y border-borde">
        {SECCIONES.map((seccion) => (
          <li key={seccion.a}>
            <Link to={seccion.a} viewTransition className="flex min-h-14 items-center text-lg font-medium hover:underline">
              {t(seccion.clave)}
            </Link>
          </li>
        ))}
        <li>
          <a href={REPO_URL} className="flex min-h-14 items-center text-lg font-medium hover:underline">
            {t("mas.repo")}
          </a>
        </li>
      </ul>
    </div>
  );
}
