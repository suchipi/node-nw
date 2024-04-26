import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/__tests__/**/*.?(c|m)[jt]s?(x)"],
    testTimeout: 15000,
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    isolate: true,
  },
});
