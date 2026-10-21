import { defineConfig } from "vite-plus";

// Nimbus owns these files and compares their hashes to update them, so they stay as it writes
// them. Pages are written by the shiru editor, which has its own Markdown style.
const nimbusOwned = [
  "nimbus.json",
  "src/components/ui/**",
  "src/components/react/**",
  "src/lib/**",
  "src/styles/**",
  "src/content/**",
];

export default defineConfig({
  fmt: { ignorePatterns: nimbusOwned },
  lint: {
    ignorePatterns: nimbusOwned,
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
});
