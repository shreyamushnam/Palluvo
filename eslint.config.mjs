import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Explicit static rootDir prevents fast-glob from resolving unbounded directory patterns.
    // Tracking: GHSA-vfj7-8cjw-p6xm (braces transitive dependency in eslint-config-next -> @next/eslint-plugin-next -> fast-glob -> micromatch).
    // Zero production exposure (npm audit --omit=dev); do not run `npm audit fix --force` to avoid breaking downgrade to Next 14.
    settings: {
      next: {
        rootDir: ["./"],
      },
    },
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
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
