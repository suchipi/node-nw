# `node-nw`

`node-nw` is a binary that imitates Node.js's script and repl interface using [NW.js](https://nwjs.io/).

It's (almost) a drop-in replacement for the `node` binary that runs in NW.js's background window (giving you access to browser APIs, and the ability to open more windows). However, there are some caveats:

- It doesn't support all of the flags that the `node` binary does, but it supports enough to run code or a repl with
- Unlike node, it can't tell when you're done executing code based on if there's no listeners/timers running, so you need to call `process.exit()` manually when you're done.

## Usage

```
Usage: node-nw [options] [ -e script | script.js ] [arguments]

Options:
  -v, --version         print node-nw version
  -h, --help            show this help text
  -e, --eval script     evaluate script
  -i, --interactive     enter REPL
```

## License

MIT
