import { describe, it, expect } from "vitest";
import runCLI from "../../__test_helpers__/runCLI";
import helpText from "../../server/help";

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
