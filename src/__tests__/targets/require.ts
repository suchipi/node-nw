import { describe, it, expect } from "vitest";
import * as path from "path";
import runCLI from "../../__test_helpers__/runCLI";

describe("require", () => {
  Object.entries({
    "loaded.js": (scriptPath: string) => {
      it("requires the file", async () => {
        const run = runCLI([scriptPath]);
        await run.outputContains("loaded");
        run.kill(); // TODO: shouldn't have to kill
        expect(run.result.stdout).toEqual("loaded\n");
      });
    },
    "argv.js": (scriptPath: string) => {
      it("passes argv", async () => {
        const run = runCLI([scriptPath, "one", "two"]);
        await run.outputContains(/one/);
        run.kill(); // TODO: shouldn't have to kill
        const argv = JSON.parse(run.result.stdout);
        expect(argv).toEqual([
          expect.stringMatching(/nw$|nw\.exe$|nwjs\.app/),
          scriptPath,
          "one",
          "two",
        ]);
      });
    },
  }).forEach(([scriptFile, testsFn]) => {
    describe(scriptFile, () => {
      // Not using path.join because we want to preserve leading `./`
      const join = (...parts: Array<string>) => parts.join(path.sep);

      describe("with a relative path", () => {
        testsFn(join("src", "__test_helpers__", "fixtures", scriptFile));
      });

      describe("with a relative path starting with a dot", () => {
        testsFn(join(".", "src", "__test_helpers__", "fixtures", scriptFile));
      });

      describe("with an absolute path", () => {
        testsFn(
          path.resolve(
            __dirname,
            "..",
            "..",
            "__test_helpers__",
            "fixtures",
            scriptFile
          )
        );
      });
    });
  });
});
