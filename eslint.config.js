import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

const TEXTO_EN_COMPONENTE = "Los textos de interfaz van en app/i18n/es.json y se leen con t().";

export default tseslint.config(
  { ignores: ["build/", ".react-router/", "node_modules/", "playwright-report/", "test-results/"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["app/**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      // Preparado para i18n: ningún texto visible escrito dentro de un componente.
      "no-restricted-syntax": [
        "error",
        { selector: "JSXText[value=/\\p{L}{2,}/u]", message: TEXTO_EN_COMPONENTE },
        {
          selector: "JSXAttribute[name.name=/^(aria-label|title|alt|placeholder)$/] > Literal",
          message: TEXTO_EN_COMPONENTE,
        },
      ],
    },
  },
  {
    files: ["scripts/**/*.ts", "tests/**/*.ts", "*.config.{ts,js}"],
    languageOptions: { globals: globals.node },
  },
);
