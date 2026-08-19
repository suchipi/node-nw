import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["__tests__/**/*.js"],
    fileParallelism: false,
  },
});
