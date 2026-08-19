// Each side implements the handlers named here; the other side's map is what
// it is allowed to send.

export type ServerIpcHandlers = {
  "stdin-raw-mode"(value: boolean): void;
  "set-exit-code"(code: number | null): void;
};

export type ClientIpcHandlers = {
  "open-devtools"(): void;
};
