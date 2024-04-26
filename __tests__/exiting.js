import { describe, it, expect } from "vitest";
import runCLI from "../__test_helpers__/runCLI";

describe("exiting", () => {
  ["SIGINT", "SIGTERM", "SIGHUP"].forEach((signal) => {
    it(`exits when receiving ${signal}`, async () => {
      const run = runCLI(["-e", "console.log('hi');"]);
      await run.outputContains("hi");
      run.kill(signal);
      await run.completion;
      expect(run.result.error).toBe(false);
      expect(run.result.code).toBe(0);
    });
  });

  it("propagates exit code (process.exit)", async () => {
    const run = runCLI(["-e", "process.exit(4)"]);
    await run.completion;
    expect(run.result.code).toBe(4);
  });

  it("propagates exit code (process.exitCode)", async () => {
    const run = runCLI(["-e", "process.exitCode = 4; process.exit()"]);
    await run.completion;
    expect(run.result.code).toBe(4);
  });
});
