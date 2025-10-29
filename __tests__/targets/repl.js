import runCLI from "../../__test_helpers__/runCLI";
import stripAnsi from "strip-ansi";

describe("repl", () => {
  let pty;
  const runRepl = () => runCLI(["-i"], { pty });
  beforeEach(() => {
    pty = true;
  });

  it("starts a repl", async () => {
    const run = runRepl();
    await run.outputContains("> ");
    run.kill();
  });

  it("evaluates each written line and prints back `util.inspect`ed values", async () => {
    const run = runRepl();
    await run.outputContains("> ");
    run.write("document\n");
    await run.outputContains("HTMLDocument { location: [Getter/Setter] }");
    run.write("2 + 2\n");
    await run.outputContains("4");
    run.kill();
  });

  describe("with a TTY", () => {
    it("uses colors", async () => {
      const run = runRepl();
      await run.outputContains("> ");
      run.kill();
      expect(stripAnsi(run.result.stdout)).not.toEqual(run.result.stdout);
    });
  });

  describe("without a TTY", () => {
    beforeEach(() => {
      pty = false;
    });

    it("does not use colors", async () => {
      const run = runRepl();
      await run.outputContains("> ");
      run.kill();
      expect(stripAnsi(run.result.stdout)).toEqual(run.result.stdout);
    });
  });

  it("has a .devtools command to open a devtools window", async () => {
    const run = runRepl();
    await run.outputContains("> ");
    run.write(".devtools\n");
    run.clearOutputContainsBuffer();
    await run.outputContains("> ");
    run.kill();
    await run.completion;
    // No easy way to tell if it worked... test runs it, at least
    expect(run.result.code).toBe(0);
  });
});
