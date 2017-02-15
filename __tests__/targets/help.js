import runCLI from "../../testHelpers/runCLI";
import helpText from "../../help";

describe("help", () => {
  ["--help", "-h"].forEach((flag) => {
    describe(flag, () => {
      it("prints some help info", async () => {
        const run = runCLI([flag]);
        await run.completion;
        expect(run.result.stdout).toEqual(helpText + "\n");
      });
    });
  });
});
