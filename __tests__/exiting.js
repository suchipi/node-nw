import runCLI from "../testHelpers/runCLI";

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
});
