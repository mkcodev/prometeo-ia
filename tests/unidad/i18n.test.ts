import { describe, expect, it } from "vitest";
import { enumerar, t } from "../../app/i18n/index.ts";

describe("t", () => {
  it("devuelve el texto de una clave", () => {
    expect(t("app.nombre")).toBe("Prometeo");
  });

  it("sustituye los valores", () => {
    expect(t("mapa.horas", { horas: 30 })).toBe("30 h");
  });

  it("deja la marca si falta un valor, para que el fallo se vea", () => {
    expect(t("mapa.horas")).toBe("{horas} h");
  });
});

describe("enumerar", () => {
  it("une con la conjunción del idioma", () => {
    expect(enumerar(["RAG", "Agentes"])).toBe("RAG y Agentes");
  });
});
