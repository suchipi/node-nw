// Globals injected by NW.js/Chromium; only the parts we use are described here.

declare const nw: {
  App: {
    argv: Array<string>;
    quit(): void;
  };
  Window: {
    open(url: string, options?: { show?: boolean }): void;
  };
};

declare const chrome: {
  runtime: {
    id: string;
  };
  developerPrivate: {
    openDevTools(options: {
      renderViewId: number;
      renderProcessId: number;
      extensionId: string;
    }): void;
  };
};

declare const window: {
  chrome: typeof chrome;
};
