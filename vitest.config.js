import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    environmentOptions: {
      modules: true,
      scriptPath: "src/index.js",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "test/",
        ".vscode/",
        ".idea/",
        "vitest.config.js",
        "eslint.config.mjs",
        ".wrangler",
        "*.ts",
        "coverage",
      ],
      clean: false, // Disable source map remapping
    },
    globals: true,
    setupFiles: ["./test/setup.js"],
  },
});
