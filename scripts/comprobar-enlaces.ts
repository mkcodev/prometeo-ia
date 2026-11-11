/**
 * Comprueba que cada URL externa del contenido, la documentación y la interfaz responde.
 *
 *   node scripts/comprobar-enlaces.ts
 *
 * Falla (código 1) ante un enlace roto. Los servidores que bloquean robots
 * (401, 403, 429) se listan como "sin comprobar": hay que abrirlos a mano.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGENES = ["README.md", "CONTRIBUTING.md", "docs", "content", "data", "app/i18n", "app/config.ts"];
const EXTENSIONES = new Set([".md", ".mdx", ".yaml", ".yml", ".json", ".ts"]);
const IGNORAR = [/^https?:\/\/(localhost|127\.0\.0\.1)/, /^https?:\/\/[^/]*example\.(com|org)/];
const CONCURRENCIA = 6;
const ESPERA_MS = 20_000;

function listarArchivos(ruta: string): string[] {
  const absoluta = join(RAIZ, ruta);
  if (!existsSync(absoluta)) return [];
  if (statSync(absoluta).isFile()) return [absoluta];
  return readdirSync(absoluta, { recursive: true, withFileTypes: true })
    .filter((entrada) => entrada.isFile() && EXTENSIONES.has(extname(entrada.name)))
    .map((entrada) => join(entrada.parentPath, entrada.name));
}

function extraerUrls(texto: string): string[] {
  const encontradas = texto.match(/https?:\/\/[^\s<>"'`)\]}]+/g) ?? [];
  return encontradas.map((url) => url.replace(/[.,;:!?*]+$/, ""));
}

type Resultado = { estado: "ok" } | { estado: "sin-comprobar" | "roto"; detalle: string };

async function comprobar(url: string, intento = 1): Promise<Resultado> {
  try {
    const respuesta = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(ESPERA_MS),
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; comprobador-de-enlaces)",
        accept: "text/html,*/*;q=0.8",
      },
    });
    await respuesta.body?.cancel();
    if (respuesta.ok) return { estado: "ok" };
    if ([401, 403, 429].includes(respuesta.status)) {
      return { estado: "sin-comprobar", detalle: `HTTP ${respuesta.status}` };
    }
    if (respuesta.status >= 500 && intento < 3) return comprobar(url, intento + 1);
    return { estado: "roto", detalle: `HTTP ${respuesta.status}` };
  } catch (error) {
    if (intento < 3) return comprobar(url, intento + 1);
    return { estado: "roto", detalle: (error as Error).message };
  }
}

const origenDe = new Map<string, Set<string>>();
for (const archivo of ORIGENES.flatMap(listarArchivos)) {
  const ruta = relative(RAIZ, archivo).replaceAll("\\", "/");
  for (const url of extraerUrls(readFileSync(archivo, "utf8"))) {
    if (IGNORAR.some((patron) => patron.test(url))) continue;
    if (!origenDe.has(url)) origenDe.set(url, new Set());
    origenDe.get(url)?.add(ruta);
  }
}

const urls = [...origenDe.keys()].sort();
const resultados = new Map<string, Resultado>();
let siguiente = 0;
await Promise.all(
  Array.from({ length: CONCURRENCIA }, async () => {
    while (siguiente < urls.length) {
      const url = urls[siguiente++];
      if (url) resultados.set(url, await comprobar(url));
    }
  }),
);

const informe = (estado: Resultado["estado"], titulo: string): number => {
  const lista = urls.filter((url) => resultados.get(url)?.estado === estado);
  if (lista.length === 0) return 0;
  console.log(`\n${titulo}`);
  for (const url of lista) {
    const resultado = resultados.get(url);
    const detalle = resultado && "detalle" in resultado ? resultado.detalle : "";
    console.log(`  ${url}\n    ${detalle} · en ${[...(origenDe.get(url) ?? [])].join(", ")}`);
  }
  return lista.length;
};

const sinComprobar = informe("sin-comprobar", "Sin comprobar (el servidor bloquea robots; ábrelos a mano):");
const rotos = informe("roto", "Enlaces rotos:");
console.log(
  `\n${urls.length} enlaces: ${urls.length - rotos - sinComprobar} correctos, ${sinComprobar} sin comprobar, ${rotos} rotos.`,
);
process.exit(rotos > 0 ? 1 : 0);
