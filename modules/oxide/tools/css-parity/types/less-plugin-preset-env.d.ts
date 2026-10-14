// TINYMCE-14907: no @types package exists for less-plugin-preset-env. Typed just enough
// to satisfy less's `Options.plugins: Less.Plugin[]` — `install`'s params are `unknown`
// rather than imported `Less` types, so this shim doesn't depend on @types/less already
// being loaded elsewhere in the program (a function accepting `unknown` params is
// structurally assignable wherever a narrower-typed plugin `install` is expected).
// See editor/modules/oxide/tasks/less-task.js for the real usage this mirrors.
declare module 'less-plugin-preset-env' {
  interface PresetEnvOptions {
    browsers?: string[];
    grid?: string;
  }

  class LessPluginPresetEnv {
    constructor(options?: PresetEnvOptions);
    install: (less: unknown, pluginManager: unknown) => void;
    minVersion?: [ number, number, number ];
  }

  export = LessPluginPresetEnv;
}
