import { Console } from "console";

export type MultiPlexConsole = {
  [name: string]: (...args: Array<any>) => void;
};

export default function makeConsole(
  stdout: NodeJS.WritableStream,
  stderr: NodeJS.WritableStream
): MultiPlexConsole {
  const devtoolsConsole: any = global.console;
  const nodeConsole: any = new Console(stdout, stderr);
  const multiPlexConsole: MultiPlexConsole = {};
  [
    "assert",
    "dir",
    "error",
    "info",
    "log",
    "time",
    "timeEnd",
    "trace",
    "warn",
  ].forEach((name) => {
    multiPlexConsole[name] = function () {
      devtoolsConsole[name].apply(devtoolsConsole, arguments);
      nodeConsole[name].apply(nodeConsole, arguments);
    };
    Object.defineProperty(multiPlexConsole[name], "name", { value: name });
  });

  return multiPlexConsole;
}
