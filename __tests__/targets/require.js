import path from "path";
import runCLI from "../../testHelpers/runCLI";

describe("require", () => {
  Object.entries({
    "loaded.js": (scriptPath) => {
      it("requires the file", async () => {
        const run = runCLI([scriptPath]);
        await run.outputContains("loaded");
        run.kill();
        expect(run.result.stdout).toEqual("loaded\n");
      });
    },
    "argv.js": (scriptPath) => {
      it("passes argv", async () => {
        const run = runCLI([scriptPath, "one", "two"]);
        await run.outputContains(/\[.*\]/);
        run.kill();
        const argv = JSON.parse(run.result.stdout);
        expect(argv).toEqual([
          expect.stringMatching(/nw(?:\.exe)?$/),
          scriptPath,
          "one",
          "two",
        ]);
      });
    }
  }).forEach(([scriptFile, testsFn]) => {
    describe(scriptFile, () => {
      let scriptPath;

      describe("with a relative path", () => {
        testsFn(path.join("testHelpers", "fixtures", scriptFile));
      });

      describe("with a relative path starting with a dot", () => {
        testsFn(path.join(".", "testHelpers", "fixtures", scriptFile));
      });

      describe("with an absolute path", () => {
        testsFn(path.resolve(__dirname, path.join("..", "..", "testHelpers", "fixtures", scriptFile)));
      });
    });
  });
});
