import type { ReactNode } from "react";
import { Link, NavLink, Outlet } from "react-router";
import { IconoApuntes, IconoHoy, IconoMapa, IconoMas, IconoRepaso, IconoTema } from "~/components/iconos";
import { t, type Clave } from "~/i18n";
import { cambiarTema, useTema } from "~/tema";

interface Destino {
  a: string;
  clave: Clave;
  icono?: ReactNode;
}

const CABECERA: Destino[] = [
  { a: "/hoy", clave: "nav.hoy" },
  { a: "/", clave: "nav.mapa" },
  { a: "/repaso", clave: "nav.repaso" },
  { a: "/proyectos", clave: "nav.proyectos" },
  { a: "/apuntes", clave: "nav.apuntes" },
];

const BARRA_INFERIOR: Destino[] = [
  { a: "/hoy", clave: "nav.hoy", icono: <IconoHoy /> },
  { a: "/", clave: "nav.mapa", icono: <IconoMapa /> },
  { a: "/repaso", clave: "nav.repaso", icono: <IconoRepaso /> },
  { a: "/apuntes", clave: "nav.apuntes", icono: <IconoApuntes /> },
  { a: "/mas", clave: "nav.mas", icono: <IconoMas /> },
];

function BotonTema() {
  const tema = useTema();
  const siguiente = tema === "oscuro" ? "claro" : "oscuro";
  return (
    <button
      type="button"
      onClick={() => cambiarTema(siguiente)}
      aria-label={t(siguiente === "claro" ? "tema.aClaro" : "tema.aOscuro")}
      className="grid size-11 cursor-pointer place-items-center rounded-md text-ceniza hover:text-texto"
    >
      <IconoTema />
    </button>
  );
}

export default function Shell() {
  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-brasa focus:px-4 focus:py-2 focus:font-semibold focus:text-sobre-brasa"
      >
        {t("app.saltar")}
      </a>

      <header className="sticky top-0 z-30 flex h-14 items-center gap-8 border-b border-borde bg-fondo px-5 mapa:px-10">
        <Link to="/" viewTransition className="flex items-center gap-2.5 text-[1.05rem] font-bold [font-stretch:118%]">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-brasa" />
          {t("app.nombre")}
        </Link>

        <nav aria-label={t("nav.principal")} className="hidden self-stretch md:block">
          <ul className="flex h-full">
            {CABECERA.map((destino) => (
              <li key={destino.a}>
                <NavLink
                  to={destino.a}
                  end
                  viewTransition
                  className={({ isActive }) =>
                    `flex h-full items-center border-b-2 px-3.5 text-[0.95rem] font-medium ${
                      isActive ? "border-brasa text-texto" : "border-transparent text-ceniza hover:text-texto"
                    }`
                  }
                >
                  {t(destino.clave)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto -mr-3">
          <BotonTema />
        </div>
      </header>

      <main id="contenido" tabIndex={-1} className="pb-20 outline-none md:pb-0">
        <Outlet />
      </main>

      <nav
        aria-label={t("nav.principal")}
        className="fixed inset-x-0 bottom-0 z-30 border-t border-borde bg-fondo pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="grid grid-cols-5">
          {BARRA_INFERIOR.map((destino) => (
            <li key={destino.a}>
              <NavLink
                to={destino.a}
                end
                viewTransition
                className={({ isActive }) =>
                  `flex h-16 flex-col items-center justify-center gap-1 border-t-2 text-xs font-medium ${
                    isActive ? "border-brasa text-texto" : "border-transparent text-ceniza"
                  }`
                }
              >
                {destino.icono}
                {t(destino.clave)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
