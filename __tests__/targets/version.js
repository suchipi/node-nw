import runCLI from "../../testHelpers/runCLI";
const version = require("../../package.json").version;

describe("version", () => {
  ["--version", "-v"].forEach((flag) => {
    describe(flag, () => {
      it("prints the current version number", async () => {
        const run = runCLI([flag]);
        await run.completion;
        expect(run.result.stdout).toBe("v" + version + "\n");
      });
    });
  });
});
