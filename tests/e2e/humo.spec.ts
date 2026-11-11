import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const RUTAS = ["/", "/bloque/fundamentos", "/bloque/carrera", "/hoy", "/mas", "/acerca", "/ruta-que-no-existe"];

/** Recoge errores de consola y excepciones: cualquiera hace fallar la prueba. */
function vigilarConsola(page: Page): string[] {
  const errores: string[] = [];
  page.on("console", (mensaje) => {
    if (mensaje.type() === "error" || mensaje.type() === "warning") {
      errores.push(`${mensaje.type()}: ${mensaje.text()}`);
    }
  });
  page.on("pageerror", (error) => errores.push(`excepción: ${error.message}`));
  return errores;
}

for (const ruta of RUTAS) {
  test(`${ruta} carga sin errores, accesible y sin desbordar`, async ({ page }) => {
    const errores = vigilarConsola(page);
    await page.goto(ruta);
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1")).toBeVisible();
    expect(errores, "errores o avisos en consola (incluye fallos de hidratación)").toEqual([]);

    const desborde = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(desborde, "scroll horizontal").toBeLessThanOrEqual(0);

    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(axe.violations.map((v) => `${v.id}: ${v.nodes.length} nodos`)).toEqual([]);
  });
}

test("el mapa enlaza a los 10 bloques", async ({ page }) => {
  await page.goto("/");
  const enlaces = page.locator(".mapa-lista a");
  await expect(enlaces).toHaveCount(10);
  await enlaces.first().click();
  await expect(page).toHaveURL(/\/bloque\/fundamentos$/);
  await expect(page.locator("h1")).toHaveText("Fundamentos de LLMs y APIs");
});

test("en una visita nueva solo el primer bloque lleva la brasa", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('.mapa-marcador[data-estado="inicio"]')).toHaveCount(1);
  const carrera = page.locator('.mapa-nodo:has(a[href="/bloque/carrera"]) .mapa-marcador');
  await expect(carrera).toHaveAttribute("data-estado", "disponible");
});

test("en móvil el raíl se recorre con el scroll, hacia abajo y hacia arriba", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) >= 1024, "en escritorio el mapa es un grafo, sin raíl");
  await page.goto("/");
  const lista = page.locator(".mapa-lista");
  const vistos = page.locator('.mapa-nodo[data-visto="true"]');
  await expect(lista).toHaveAttribute("data-vivo", "true");
  await expect(vistos).toHaveCount(0);

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(vistos).toHaveCount(10);
  await expect(page.locator(".mapa-nodo").last().locator(".mapa-texto")).toHaveCSS("opacity", "1");

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(vistos).toHaveCount(0);
});

test("con movimiento reducido el mapa móvil se ve entero, sin efecto", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) >= 1024, "en escritorio el mapa es un grafo, sin raíl");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator(".mapa-lista")).not.toHaveAttribute("data-vivo", "true");
  await expect(page.locator(".mapa-nodo").last().locator(".mapa-texto")).toHaveCSS("opacity", "1");
});

test("el tema claro se recuerda al recargar y pasa contraste", async ({ page }) => {
  const errores = vigilarConsola(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Cambiar a tema claro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "claro");

  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "claro");
  await expect(page.getByRole("button", { name: "Cambiar a tema oscuro" })).toBeVisible();
  expect(errores).toEqual([]);

  const axe = await new AxeBuilder({ page }).withTags(["wcag2aa"]).analyze();
  expect(axe.violations.map((v) => `${v.id}: ${v.nodes.length} nodos`)).toEqual([]);
});

test("el primer tabulador lleva al enlace para saltar al contenido", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Saltar al contenido" })).toBeFocused();
});

test("las aristas del mapa se dibujan, salvo con movimiento reducido", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) < 1024, "en móvil el mapa es una lista, sin aristas");
  const animacion = () =>
    page.locator(".arista").first().evaluate((arista) => getComputedStyle(arista).animationName);

  await page.goto("/");
  expect(await animacion()).toBe("dibujar-arista");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  expect(await animacion()).toBe("none");
});

test("una ruta sin prerender se resuelve con el fallback", async ({ page }) => {
  await page.goto("/bloque/no-existe");
  await expect(page.locator("h1")).toHaveText("Ese bloque no existe");
});
