// Keep this free of Storybook and DOM-heavy imports: it is bundled into both the Vite
// preview and the esbuild manager.
import type { Manifest } from '@tinymce/oxide/build/custom-properties/manifest.ts';

export type { Manifest, ManifestProperty } from '@tinymce/oxide/build/custom-properties/manifest.ts';

export const ADDON_ID = 'tox-css-properties';
export const PANEL_ID = `${ADDON_ID}/panel`;

export const EVENTS = {
  SET_OVERRIDES: `${ADDON_ID}/set-overrides`,
  REQUEST_REPORT: `${ADDON_ID}/request-report`,
  MANIFEST: `${ADDON_ID}/manifest`,
  REPORT: `${ADDON_ID}/report`
} as const;

export const GLOBALS = {
  skin: 'toxSkin',
  customProperties: 'toxCustomProperties'
} as const;

export const PARAMETER_KEY = 'cssProperties';

export interface CssPropertiesParameter {
  groups?: string[];
}

export type SkinName = 'default' | 'dark';

export type Overrides = Record<string, string>;

export interface ResolvedValue {
  value: string;
  kind: 'color' | 'length' | 'other';
}

export interface Report {
  groups: string[];
  resolved: Record<string, ResolvedValue>;
}

// Each property is redeclared on every selector the skin declares it on, so component-level
// declarations are overridden too.
export const overridesToCss = (manifest: Manifest, overrides: Overrides, important: boolean): string => {
  const blocks = new Map<string, { atRules: string[]; selector: string; lines: Set<string> }>();
  Object.entries(overrides).forEach(([ name, value ]) => {
    const css = value.trim();
    // Also rejects values that would end the declaration or rule they are written into, e.g. `red; }`.
    if (css === '' || !CSS.supports(name, css)) {
      return;
    }
    manifest.properties[name]?.declarations.forEach(({ atRules, selector }) => {
      const key = [ ...atRules, selector ].join(' | ');
      const block = blocks.get(key) ?? { atRules, selector, lines: new Set() };
      blocks.set(key, block);
      block.lines.add(`${name}: ${css}${important ? ' !important' : ''};`);
    });
  });

  return [ ...blocks.values() ].map(({ atRules, selector, lines }) => {
    const rule = `${selector} {\n${[ ...lines ].map((line) => `  ${line}`).join('\n')}\n}`;
    return atRules.reduceRight((inner, atRule) => `${atRule} {\n${inner}\n}`, rule);
  }).join('\n\n');
};
