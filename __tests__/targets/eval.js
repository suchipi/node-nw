import runCLI from "../../testHelpers/runCLI";

describe("eval", () => {
  ["--eval", "-e"].forEach((flag) => {
    describe(flag, () => {
      it("evals the line", async () => {
        const run = runCLI([flag, "console.log('hi');"]);
        await run.outputContains("hi");
        run.kill();
        expect(run.result.stdout).toBe("hi\n");
      });

      it("can access `document`", async () => {
        const run = runCLI([flag, "console.log(document)"]);
        await run.outputContains("HTMLDocument");
        run.kill();
        expect(run.result.stdout).toBe(
          "HTMLDocument { location: [Getter/Setter] }\n"
        );
      });

      it("passes argv through", async () => {
        const script = "console.log(JSON.stringify(process.argv))";
        const run = runCLI([flag, script, "foo", "bar"]);
        await run.outputContains(/foo/);
        run.kill();
        const argv = JSON.parse(run.result.stdout);
        expect(argv[0]).toMatch(/nw$|nw\.exe$|nwjs\.app/);
        expect(argv[1]).toBe(flag);
        expect(argv[2]).toBe(script);
        expect(argv[3]).toBe("foo");
        expect(argv[4]).toBe("bar");
      });
    });
  });
});
