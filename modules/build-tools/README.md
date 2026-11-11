# Build tools

Rollup tooling consumed by the TinyMCE Gruntfiles.

- `dts`: a rollup plugin wrapping `rollup-plugin-dts` that bundles the `.d.ts` output into a single, cleaned and validated declaration file.
- `onwarn`: a strict rollup warning handler that fails the build on unresolved imports, circular dependencies, missing exports and `this` at the top level.
- `rollup`: a grunt multi-task (loaded via `load-grunt-tasks`) that bundles a single entry point with rollup.

This package does not declare a dependency on `typescript`: `dts` uses the TypeScript 6 JavaScript API, which must be resolvable as `typescript` from the consuming project.
