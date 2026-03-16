import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    options: {
      typeCheck: true,
      typeAware: true,
    },
    ignorePatterns: ["**/*.gen.ts", "**/posthog.astro"],
    categories: {
      correctness: "error",
      suspicious: "warn",
    },
    rules: {
      // ─── Correctness (overrides) ───────────────────────────
      "no-alert": "error",
      "no-eval": "error",

      // ─── Suspicious ────────────────────────────────────────
      "no-shadow": "warn",
      "no-self-compare": "warn",

      // ─── Safety / Restriction ──────────────────────────────
      "no-var": "error",
      "no-sequences": "error",
      "no-console": "warn",

      // ─── TypeScript safety ─────────────────────────────────
      "typescript/no-explicit-any": "warn",
      "typescript/no-non-null-assertion": "warn",
      "typescript/ban-ts-comment": "warn",
      "typescript/no-import-type-side-effects": "error",
      "typescript/no-require-imports": "error",
      "typescript/no-unsafe-type-assertion": "warn",

      // ─── Promise / async safety ────────────────────────────
      "promise/always-return": "warn",
      "promise/no-multiple-resolved": "warn",
      "promise/catch-or-return": "warn",

      // ─── React ─────────────────────────────────────────────
      "react/exhaustive-deps": "warn",
      "react/jsx-key": "error",
      "react/jsx-no-duplicate-props": "error",
      "react/no-children-prop": "error",
      "react/no-danger-with-children": "error",
      "react/rules-of-hooks": "error",
      "react/jsx-no-target-blank": "warn",
      "react/jsx-no-undef": "error",
      "react/no-direct-mutation-state": "error",

      // ─── React perf (warn, not block) ──────────────────────
      "react-perf/jsx-no-new-object-as-prop": "warn",
      "react-perf/jsx-no-new-array-as-prop": "warn",
      "react-perf/jsx-no-jsx-as-prop": "warn",
      "react/jsx-no-constructed-context-values": "warn",

      // ─── Import hygiene ────────────────────────────────────
      "import/no-self-import": "error",
      "import/no-cycle": "warn",
      "import/default": "error",
      "import/namespace": "error",

      // ─── Unicorn (modern JS) ───────────────────────────────
      "unicorn/no-thenable": "error",
      "unicorn/no-instanceof-builtins": "warn",
      "unicorn/prefer-node-protocol": "warn",

      // ─── Performance ───────────────────────────────────────
      "no-await-in-loop": "warn",
      "oxc/no-accumulating-spread": "warn",

      // ─── Pedantic (selective) ──────────────────────────────
      eqeqeq: "error",
      "no-fallthrough": "error",
      "unicorn/no-useless-promise-resolve-reject": "warn",
      "array-callback-return": "warn",
      "no-constructor-return": "warn",
      "unicorn/prefer-array-some": "warn",
      "unicorn/prefer-array-flat-map": "warn",

      // ─── Style (auto-fixable, low friction) ────────────────
      "prefer-const": "warn",
      "no-useless-computed-key": "warn",
      "prefer-object-spread": "warn",
      "no-lonely-if": "warn",
      "unicorn/prefer-string-starts-ends-with": "warn",
      "oxc/approx-constant": "warn",

      // ─── Explicitly off ────────────────────────────────────
      "no-plusplus": "off",
    },
  },
  fmt: {
    ignorePatterns: ["**/*.gen.ts"],
  },
});
