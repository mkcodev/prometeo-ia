import { REPO_URL } from "~/config";
import { t } from "~/i18n";

export function meta() {
  return [{ title: `${t("acerca.titulo")} · ${t("app.nombre")}` }];
}

export default function Acerca() {
  return (
    <article className="mx-auto max-w-2xl px-5 py-10 mapa:py-16">
      <h1 className="titular text-[clamp(2rem,7vw,3rem)]">{t("acerca.titulo")}</h1>

      <section aria-labelledby="datos" className="mt-10">
        <h2 id="datos" className="text-xl font-bold">
          {t("acerca.datosTitulo")}
        </h2>
        <div className="lectura mt-4 max-w-[68ch] space-y-4 text-[1.125rem]">
          <p>{t("acerca.datos1")}</p>
          <p>{t("acerca.datos2")}</p>
          <p>{t("acerca.datos3")}</p>
        </div>
      </section>

      <section aria-labelledby="licencias" className="mt-12">
        <h2 id="licencias" className="text-xl font-bold">
          {t("acerca.licenciasTitulo")}
        </h2>
        <div className="lectura mt-4 max-w-[68ch] space-y-4 text-[1.125rem]">
          <p>{t("acerca.licencias")}</p>
          <p>
            <a href={REPO_URL} className="enlace">
              {t("acerca.repo")}
            </a>
          </p>
        </div>
      </section>
    </article>
  );
}
