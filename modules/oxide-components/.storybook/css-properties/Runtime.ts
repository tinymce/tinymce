import darkOn from '@tinymce/oxide/build/custom-properties/dark/skin.css?inline';
import darkManifestJson from '@tinymce/oxide/build/custom-properties/dark.json?raw';
import defaultOn from '@tinymce/oxide/build/custom-properties/default/skin.css?inline';
import defaultManifestJson from '@tinymce/oxide/build/custom-properties/default.json?raw';
import darkOff from '@tinymce/oxide/build/skins/ui/dark/skin.css?inline';
import defaultOff from '@tinymce/oxide/build/skins/ui/default/skin.css?inline';
import { STORY_RENDERED } from 'storybook/internal/core-events';
import { addons } from 'storybook/preview-api';

import { setSkinCss } from '../SkinStylesheet';

import {
  type CssPropertiesParameter, EVENTS, GLOBALS, type Manifest, type Overrides, overridesToCss, PARAMETER_KEY, type Report, type ResolvedValue, type SkinName
} from './Shared';

const OVERRIDES_STYLE_ID = 'tox-storybook-css-overrides';
const PROBE_ATTRIBUTE = 'data-tox-css-probe';
const REPORT_DELAY = 200;

const stylesheets: Record<SkinName, { on: string; off: string }> = {
  default: { on: defaultOn, off: defaultOff },
  dark: { on: darkOn, off: darkOff }
};

const manifests: Record<SkinName, Manifest> = {
  default: JSON.parse(defaultManifestJson) as Manifest,
  dark: JSON.parse(darkManifestJson) as Manifest
};

let storyId = '';
let declaredGroups: string[] = [];
let skin: SkinName = 'default';
let customProperties = true;
let overrides: Overrides = {};
// Per story, the groups it has rendered so far, so a menu that closes stays listed.
const seenGroups: Record<string, Set<string>> = {};
let reportTimer: number | undefined;
let manifestSkin: SkinName | null = null;
let channel: ReturnType<typeof addons.getChannel> | null = null;

const renderOverrides = (): void => {
  let style = document.getElementById(OVERRIDES_STYLE_ID);
  if (style === null) {
    style = document.createElement('style');
    style.id = OVERRIDES_STYLE_ID;
    document.head.appendChild(style);
  }
  // With the flag off nothing is declared, so overriding would only half-work. Show the plain LESS skin.
  const css = customProperties ? overridesToCss(manifests[skin], overrides, true) : '';
  if (style.textContent !== css) {
    style.textContent = css;
  }
};

const firstMatch = (selector: string): Element | null => {
  try {
    return document.querySelector(selector);
  } catch {
    return null; // e.g. selectors the browser doesn't support
  }
};

// Resolves each property with a hidden probe element placed inside an element the property
// is declared on: `background-color` resolves colors, `margin-left` resolves lengths.
const resolve = (manifest: Manifest, groupIds: string[]): Record<string, ResolvedValue> => {
  const probes = manifest.groups
    .filter((group) => groupIds.includes(group.id))
    .flatMap((group) => group.properties)
    .flatMap((name) => {
      const element = manifest.properties[name].declarations.map((d) => firstMatch(d.selector)).find((e) => e !== null);
      if (element === undefined || element === null) {
        return [];
      }
      const probe = document.createElement('span');
      probe.setAttribute(PROBE_ATTRIBUTE, '');
      probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;background-color:var(${name});margin-left:var(${name});`;
      element.appendChild(probe);
      return [{ name, element, probe }];
    });

  // All probes are added before anything is read, so styles are only recalculated once.
  const resolved: Record<string, ResolvedValue> = {};
  probes.forEach(({ name, element, probe }) => {
    const raw = window.getComputedStyle(element).getPropertyValue(name).trim();
    const computed = window.getComputedStyle(probe);
    if (CSS.supports('color', raw)) {
      resolved[name] = { value: computed.backgroundColor, kind: 'color' };
    } else if (CSS.supports('margin-left', raw)) {
      resolved[name] = { value: computed.marginLeft, kind: 'length' };
    } else {
      resolved[name] = { value: raw, kind: 'other' };
    }
    probe.remove();
  });
  return resolved;
};

const isProbe = (node: Node): boolean => node instanceof window.Element && node.hasAttribute(PROBE_ATTRIBUTE);

// Adding and removing probes must not trigger another report.
const observer = new MutationObserver((records) => {
  if (records.some((r) => r.type === 'attributes' || ![ ...r.addedNodes, ...r.removedNodes ].every(isProbe))) {
    scheduleReport();
  }
});

const sendReport = (): void => {
  reportTimer = undefined;
  const manifest = manifests[skin];
  const present = manifest.groups.filter((group) => group.selectors.some((s) => firstMatch(s) !== null)).map((g) => g.id);
  const seen = seenGroups[storyId] ??= new Set();
  present.forEach((id) => seen.add(id));

  const listed = new Set([ ...declaredGroups, ...seen ]);
  const report: Report = {
    groups: manifest.groups.map((g) => g.id).filter((id) => id !== 'global' && listed.has(id)),
    resolved: resolve(manifest, present)
  };
  channel?.emit(EVENTS.REPORT, report);
};

const scheduleReport = (): void => {
  reportTimer ??= window.setTimeout(sendReport, REPORT_DELAY);
};

const sendManifest = (): void => {
  manifestSkin = skin;
  channel?.emit(EVENTS.MANIFEST, manifests[skin]);
};

// On the first render rather than on import, once Storybook has set up the channel.
const connect = (): void => {
  if (channel !== null) {
    return;
  }
  channel = addons.getChannel();
  channel.on(EVENTS.SET_OVERRIDES, (next: Overrides) => {
    overrides = next;
    renderOverrides();
    scheduleReport();
  });
  channel.on(EVENTS.REQUEST_REPORT, () => {
    sendManifest();
    scheduleReport();
  });
  channel.on(STORY_RENDERED, scheduleReport);
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: [ 'class' ] });
};

export interface StoryContextSlice {
  id: string;
  globals: Record<string, unknown>;
  parameters: Record<string, unknown>;
}

export const applyStoryContext = ({ id, globals, parameters }: StoryContextSlice): void => {
  storyId = id;
  declaredGroups = (parameters[PARAMETER_KEY] as CssPropertiesParameter | undefined)?.groups ?? [];
  skin = globals[GLOBALS.skin] === 'dark' ? 'dark' : 'default';
  customProperties = globals[GLOBALS.customProperties] !== 'off';

  setSkinCss(stylesheets[skin][customProperties ? 'on' : 'off']);
  renderOverrides();
  connect();
  if (manifestSkin !== skin) {
    sendManifest();
  }
  scheduleReport();
};
