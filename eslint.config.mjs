import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier/flat";

/**
 * Fronteiras de import (docs/architecture.md §3.1).
 *
 * Elementos são pastas; categorias de arquivo marcam exceções pontuais.
 * Em `boundaries/dependencies` vale a ÚLTIMA política que casar, e
 * `default: "disallow"` bloqueia tudo o que não for permitido de forma explícita.
 * Imports dentro do mesmo elemento não são checados.
 */
const boundariesConfig = {
  plugins: { boundaries },
  files: ["src/**/*.{ts,tsx}"],
  settings: {
    "boundaries/elements": [
      { type: "app", pattern: "src/app" },
      { type: "feature", pattern: "src/features/*", capture: ["name"] },
      { type: "server", pattern: "src/server" },
      { type: "contracts", pattern: "src/contracts" },
      { type: "components", pattern: "src/components" },
      { type: "lib", pattern: "src/lib" },
    ],
    "boundaries/files": [
      // Server Actions de feature: único ponto de uma feature que alcança `server/`.
      { pattern: "src/features/*/actions.ts", category: "feature-action" },
      // Cliente Supabase com service role (regra 4 da arquitetura).
      { pattern: "src/lib/supabase/admin.ts", category: "service-role" },
    ],
  },
  rules: {
    "boundaries/dependencies": [
      2,
      {
        default: "disallow",
        policies: [
          // app: camada de composição, pode usar tudo.
          {
            from: { element: { type: "app" } },
            allow: {
              to: {
                element: {
                  types: [
                    "feature",
                    "server",
                    "contracts",
                    "components",
                    "lib",
                  ],
                },
              },
            },
          },
          // feature: UI e dados compartilhados. `server/` só via actions.ts.
          {
            from: { element: { type: "feature" } },
            allow: {
              to: { element: { types: ["components", "contracts", "lib"] } },
            },
          },
          {
            from: {
              element: { type: "feature" },
              file: { categories: "feature-action" },
            },
            allow: { to: { element: { type: "server" } } },
          },
          // Regra 2: features só se alcançam pelo index.ts da outra feature.
          {
            from: { element: { type: "feature" } },
            allow: {
              to: {
                element: {
                  type: "feature",
                  fileInternalPath: "index.{ts,tsx}",
                },
              },
            },
          },
          // Regra 1: server nunca depende de UI nem de feature.
          {
            from: { element: { type: "server" } },
            allow: { to: { element: { types: ["contracts", "lib"] } } },
          },
          // components: UI genérica, sem conhecer features nem server.
          {
            from: { element: { type: "components" } },
            allow: { to: { element: { types: ["contracts", "lib"] } } },
          },
          // lib: utilitários, dependem só de contracts.
          {
            from: { element: { type: "lib" } },
            allow: { to: { element: { type: "contracts" } } },
          },
          // Regra 3: `contracts/` não tem política `from`, logo não importa nada do projeto.

          // Regra 4: service role só para ingestão e cron (a última política vence).
          {
            disallow: { to: { file: { categories: "service-role" } } },
            message:
              "`lib/supabase/admin.ts` (service role) só pode ser importado por `server/nasa/ingest*` e `app/api/cron/*`.",
          },
          {
            from: {
              file: {
                path: ["src/server/nasa/ingest*", "src/app/api/cron/**"],
              },
            },
            allow: { to: { file: { categories: "service-role" } } },
          },
        ],
      },
    ],
  },
};

/** Regras estritas de acessibilidade; o plugin já é registrado pelo eslint-config-next. */
const a11yConfig = {
  files: ["**/*.{jsx,tsx}"],
  rules: { ...jsxA11y.flatConfigs.strict.rules },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  boundariesConfig,
  a11yConfig,
  // Deve vir por último: desliga regras de estilo que conflitam com o Prettier.
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
