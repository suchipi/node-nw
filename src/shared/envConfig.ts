// The server determines these and passes them to the client as JSON on argv.

export type EnvConfig = {
  cwd: string;
  pid: number;
  supportsColor: boolean;
  stdinIsTTY: boolean;
  stdoutIsTTY: boolean;
};
