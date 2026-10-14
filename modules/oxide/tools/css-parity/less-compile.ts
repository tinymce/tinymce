// TINYMCE-14907: compiles an oxide skin's LESS twice — once with
// @custom-properties-enabled left at its checked-in value (false, see
// editor/modules/oxide/src/less/theme/globals/feature-flags.less), once forced true —
// using less's `modifyVars`, which is appended after all imports so it wins over the
// file's own declaration without editing any checked-in source. Mirrors the exact
// less.render() options used by the real build (editor/modules/oxide/tasks/less-task.js).
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import less from 'less';
import LessPluginPresetEnv from 'less-plugin-preset-env';

const here = fileURLToPath(new URL('.', import.meta.url));
const oxideRoot = resolve(here, '../..');
const oxideLessSkinsDir = resolve(oxideRoot, 'src/less/skins');

const presetEnv = new LessPluginPresetEnv({
  browsers: [ 'last 2 Safari versions', 'last 2 iOS major versions', 'last 2 Chrome versions', 'Firefox ESR' ],
  grid: 'no-autoplace'
});

export interface CompiledSkin {
  off: string;
  on: string;
}

// @types/less's Options interface is missing `relativeUrls` (a real less.render() option —
// see less-task.js's own usage) — it only appears on the unrelated RootFileInfo interface.
interface RenderOptions extends Less.Options {
  relativeUrls?: boolean;
}

export const compileSkin = async (skin: string): Promise<CompiledSkin> => {
  const entry = resolve(oxideLessSkinsDir, 'ui', skin, 'skin.less');
  const data = readFileSync(entry, 'utf8');

  const baseOpts: RenderOptions = {
    relativeUrls: true,
    math: 'parens-division',
    plugins: [ presetEnv ],
    // less-task.js only ever declares `paths: ['./src/less/skins']` and gets away with
    // it because Grunt's cwd at compile time is editor/modules/oxide/, so imports like
    // `@import 'src/less/theme/theme';` resolve via LESS's own cwd-relative fallback.
    // This script's cwd is unrelated, so oxideRoot is added explicitly instead.
    paths: [ oxideLessSkinsDir, oxideRoot ],
    filename: entry
  };

  const [ off, on ] = await Promise.all([
    less.render(data, baseOpts),
    less.render(data, { ...baseOpts, modifyVars: { 'custom-properties-enabled': 'true' } })
  ]);

  return { off: off.css, on: on.css };
};
