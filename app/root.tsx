import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/literata/opsz.css";
import "@fontsource-variable/literata/opsz-italic.css";
import "./styles/app.css";

import type { ReactNode } from "react";
import { isRouteErrorResponse, Link, Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { Route } from "./+types/root";
import { IDIOMA, t } from "./i18n";
import { SCRIPT_TEMA } from "./tema";

export const meta: Route.MetaFunction = () => [
  { title: t("inicio.titulo") },
  { name: "description", content: t("app.descripcion") },
  { property: "og:title", content: t("inicio.titulo") },
  { property: "og:description", content: t("app.descripcion") },
  { property: "og:type", content: "website" },
];

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    // El tema real se fija antes del primer pintado (SCRIPT_TEMA), así que el
    // atributo puede diferir del HTML prerenderizado: es intencionado.
    <html lang={IDIOMA} data-theme="oscuro" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const noEncontrada = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main className="mx-auto max-w-xl px-5 py-24">
      <h1 className="titular text-3xl">
        {t(noEncontrada ? "error.noEncontradaTitulo" : "error.inesperadoTitulo")}
      </h1>
      <p className="lectura mt-4 text-lg">
        {t(noEncontrada ? "error.noEncontrada" : "error.inesperado")}
      </p>
      <p className="mt-8">
        <Link to="/" className="enlace">
          {t("error.volver")}
        </Link>
      </p>
      {import.meta.env.DEV && error instanceof Error ? (
        <pre className="mt-8 overflow-x-auto text-sm text-ceniza">{error.stack}</pre>
      ) : null}
    </main>
  );
}
