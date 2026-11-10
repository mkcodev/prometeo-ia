import { Link } from "react-router";
import { t } from "~/i18n";

export function meta() {
  return [{ title: `${t("error.noEncontradaTitulo")} · ${t("app.nombre")}` }];
}

export default function NoEncontrada() {
  return (
    <div className="mx-auto max-w-xl px-5 py-16 mapa:py-24">
      <h1 className="titular text-[clamp(2rem,7vw,3rem)]">{t("error.noEncontradaTitulo")}</h1>
      <p className="lectura mt-6 text-[1.15rem]">{t("error.noEncontrada")}</p>
      <p className="mt-8">
        <Link to="/" viewTransition className="enlace">
          {t("error.volver")}
        </Link>
      </p>
    </div>
  );
}
