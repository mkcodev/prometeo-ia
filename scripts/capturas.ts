/**
 * Capturas de la app para revisión visual. Necesita `npm run preview` en marcha.
 *
 *   node scripts/capturas.ts [carpeta-de-salida]
 */
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "@playwright/test";

const BASE = "http://127.0.0.1:4173";
const salida = resolve(process.argv[2] ?? "capturas");
mkdirSync(salida, { recursive: true });

const PANTALLAS = [
  { nombre: "escritorio", ancho: 1440, alto: 900 },
  { nombre: "movil", ancho: 390, alto: 844 },
];
const RUTAS = [
  { nombre: "inicio", ruta: "/" },
  { nombre: "bloque", ruta: "/bloque/fundamentos" },
  { nombre: "pendiente", ruta: "/hoy" },
];
const TEMAS = ["oscuro", "claro"] as const;

const navegador = await chromium.launch();
for (const pantalla of PANTALLAS) {
  for (const tema of TEMAS) {
    const contexto = await navegador.newContext({
      viewport: { width: pantalla.ancho, height: pantalla.alto },
      deviceScaleFactor: 2,
      locale: "es-ES",
    });
    await contexto.addInitScript((elegido) => {
      localStorage.setItem("prometeo:v1:ajustes", JSON.stringify({ tema: elegido }));
    }, tema);
    const pagina = await contexto.newPage();
    for (const { nombre, ruta } of RUTAS) {
      await pagina.goto(BASE + ruta);
      await pagina.waitForLoadState("networkidle");
      await pagina.evaluate(() => document.fonts.ready);
      await pagina.waitForTimeout(1600);
      const archivo = join(salida, `${nombre}-${pantalla.nombre}-${tema}.png`);
      await pagina.screenshot({ path: archivo });
      console.log(archivo);
      // En móvil el mapa queda bajo el primer pantallazo: segunda captura desplazada hasta él.
      if (pantalla.nombre === "movil" && nombre === "inicio") {
        await pagina.locator("#titulo-mapa").scrollIntoViewIfNeeded();
        await pagina.evaluate(() => window.scrollBy(0, 420));
        await pagina.waitForTimeout(300);
        const archivoMapa = join(salida, `inicio-mapa-${pantalla.nombre}-${tema}.png`);
        await pagina.screenshot({ path: archivoMapa });
        console.log(archivoMapa);
      }
    }
    await contexto.close();
  }
}
await navegador.close();
