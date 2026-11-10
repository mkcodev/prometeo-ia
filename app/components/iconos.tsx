import type { ReactNode } from "react";

/** Iconos de trazo propios, 20 px. Siempre decorativos: el texto lo pone quien los usa. */
function Icono({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function IconoHoy() {
  return (
    <Icono>
      <path d="M10 2.5c.6 2.6 4.5 4.6 4.5 8.6a4.5 4.5 0 0 1-9 0c0-1.700.8-2.900 1.800-3.900.3 1.200.9 1.900 1.700 2.300C8.600 7.200 9 4.600 10 2.500Z" />
    </Icono>
  );
}

export function IconoMapa() {
  return (
    <Icono>
      <circle cx="10" cy="16" r="1.75" />
      <circle cx="5" cy="9" r="1.75" />
      <circle cx="15" cy="9" r="1.75" />
      <circle cx="10" cy="3.5" r="1.75" />
      <path d="M9 14.500 6 10.500M11 14.500l3-4M6.300 7.800 8.800 4.800M13.700 7.800 11.200 4.800" />
    </Icono>
  );
}

export function IconoRepaso() {
  return (
    <Icono>
      <rect x="3" y="6" width="11" height="9.5" rx="1.5" />
      <path d="M6 6V4.500h9.500a1.500 1.500 0 0 1 1.500 1.500V13h-3" />
    </Icono>
  );
}

export function IconoApuntes() {
  return (
    <Icono>
      <path d="M5 2.500h7l3.500 3.500V17.500H5Z" />
      <path d="M7.500 9.500h5M7.500 12.500h5M12 2.500V6h3.500" />
    </Icono>
  );
}

export function IconoMas() {
  return (
    <Icono>
      <path d="M3.500 6h13M3.500 10h13M3.500 14h13" />
    </Icono>
  );
}

export function IconoTema() {
  return (
    <Icono>
      <circle cx="10" cy="10" r="6.5" />
      <path d="M10 3.500a6.500 6.500 0 0 1 0 13Z" fill="currentColor" stroke="none" />
    </Icono>
  );
}
