# VolgaCTF Final nodejs checker

[VolgaCTF Final devenv](https://github.com/VolgaCTF/volgactf-final-devenv) is a platform to develop & test an A/D CTF service and its checker.

This repository provides a Dockerfile for a sample service checker written in Node.js.

## Usage

Clone the repository and write your own implementations of `PUSH` and `PULL` in `src/checker/main.js`.

For development purposes:
- mount `src` directory of this repository to `/dist/server` directory of the container;
- override command with `npm run dev`;
- optionally, set `LOG_LEVEL` environment variable to `debug` so as to make the output much more verbose.

## License
MIT @ [VolgaCTF](https://github.com/VolgaCTF)
