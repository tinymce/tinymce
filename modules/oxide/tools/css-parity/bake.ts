// TINYMCE-14907: renders every target at once — one headless Chromium page per
// compile (flag off/on) per media scenario — and reads back each target's computed
// values. Both pages of a scenario get the identical DOM, so any cross-talk between
// targets sharing a page affects off and on alike and can't fake a mismatch.
import type { Browser, Page } from 'playwright';

import { FORCE_ATTR, FORCED_PSEUDOS } from './css-rules';
import { buildTargets, readTargets } from './dom-bake';
import type { BakeRead, BakeTarget, SkippedRule } from './types';

interface Scenario {
  name: string;
  viewport: { width: number; height: number };
  forcedColors?: 'active';
}

// The first scenario evaluates every top-level rule. Each rule inside an @media is
// evaluated in the first scenario whose emulated media matches its condition.
const SCENARIOS: Scenario[] = [
  { name: 'desktop', viewport: { width: 1280, height: 800 }},
  { name: 'narrow viewport', viewport: { width: 400, height: 800 }},
  { name: 'forced colors', viewport: { width: 1280, height: 800 }, forcedColors: 'active' }
];

export interface BakedTarget {
  target: BakeTarget;
  scenario: string;
  off: BakeRead;
  on: BakeRead;
}

const openPage = async (browser: Browser, scenario: Scenario, cssText: string): Promise<Page> => {
  const page = await browser.newPage({ viewport: scenario.viewport });
  await page.emulateMedia({ forcedColors: scenario.forcedColors ?? 'none' });
  await page.setContent(`<!doctype html><html><head><style>${cssText}</style></head><body></body></html>`);
  return page;
};

// Applies :hover/:active/:focus/... through the Chrome DevTools Protocol
// (CSS.forcePseudoState — what DevTools' ":hov" panel uses) instead of a real pointer
// or element.focus(). Only one element can hold real focus or hover at a time, and a
// hover rule that moves the element out from under the pointer flickers; forced states
// hold on any number of elements at once, whatever the layout does. The session must
// stay attached while reading — detaching clears the forced states.
const forcePseudoStates = async (page: Page): Promise<void> => {
  const session = await page.context().newCDPSession(page);
  await session.send('DOM.enable');
  await session.send('CSS.enable');
  const { root } = await session.send('DOM.getDocument', { depth: 0 });

  const forcedByNode = new Map<number, string[]>();
  for (const pseudo of FORCED_PSEUDOS) {
    const { nodeIds } = await session.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: `[${FORCE_ATTR}~="${pseudo}"]` });
    for (const nodeId of nodeIds) {
      forcedByNode.set(nodeId, [ ...forcedByNode.get(nodeId) ?? [], pseudo ]);
    }
  }

  await Promise.all([ ...forcedByNode ].map(([ nodeId, forcedPseudoClasses ]) =>
    session.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses })));
};

// The custom properties build sets `color-scheme` on `.tox` (light-dark() needs it);
// the LESS build never does and paints dark skins with hardcoded colors instead. The
// scheme also decides how system colors (`highlight`, `canvas`, ... — used in
// forced-colors mode), scrollbars and native controls render, so without this every
// system color in a dark skin would differ. The LESS page gets whatever scheme the
// custom properties build resolves to, rather than the LESS skins declaring one.
// Read with forced colors off: in forced-colors mode Chromium reports every
// `color-scheme` as `light dark`, while system colors still follow the declared one.
const matchColorScheme = async (offPage: Page, onPage: Page, scenario: Scenario): Promise<void> => {
  await onPage.emulateMedia({ forcedColors: 'none' });
  const colorScheme = await onPage.evaluate(() => {
    const tox = document.createElement('div');
    tox.className = 'tox';
    document.body.appendChild(tox);
    const value = window.getComputedStyle(tox).colorScheme;
    tox.remove();
    return value;
  });
  await onPage.emulateMedia({ forcedColors: scenario.forcedColors ?? 'none' });
  await offPage.addStyleTag({ content: `.tox { color-scheme: ${colorScheme}; }` });
};

const bakePage = async (page: Page, targets: BakeTarget[]): Promise<BakeRead[]> => {
  await page.evaluate(buildTargets, { targets, forced: FORCED_PSEUDOS, forceAttr: FORCE_ATTR });
  await forcePseudoStates(page);
  return page.evaluate(readTargets, targets);
};

export const bakeSkin = async (browser: Browser, css: { off: string; on: string }, targets: BakeTarget[]): Promise<{ baked: BakedTarget[]; skipped: SkippedRule[] }> => {
  const baked: BakedTarget[] = [];
  let pendingMedia = targets.filter((target) => target.media !== null);
  const matchesAny = (target: BakeTarget, queries: string[]) => queries.includes(target.media ?? '');

  for (const [ index, scenario ] of SCENARIOS.entries()) {
    const [ offPage, onPage ] = await Promise.all([ openPage(browser, scenario, css.off), openPage(browser, scenario, css.on) ]);
    try {
      await matchColorScheme(offPage, onPage, scenario);
      const queries = [ ...new Set(pendingMedia.map((target) => target.media ?? '')) ];
      const matching = await offPage.evaluate((qs) => qs.filter((q) => window.matchMedia(q).matches), queries);
      const scenarioTargets = [
        ...index === 0 ? targets.filter((target) => target.media === null) : [],
        ...pendingMedia.filter((target) => matchesAny(target, matching))
      ];
      pendingMedia = pendingMedia.filter((target) => !matchesAny(target, matching));

      if (scenarioTargets.length > 0) {
        const [ offReads, onReads ] = await Promise.all([ bakePage(offPage, scenarioTargets), bakePage(onPage, scenarioTargets) ]);
        scenarioTargets.forEach((target, i) => baked.push({ target, scenario: scenario.name, off: offReads[i], on: onReads[i] }));
      }
    } finally {
      await Promise.all([ offPage.close(), onPage.close() ]);
    }
  }

  const skipped = pendingMedia.map((target) => ({ selector: target.selector, reason: `@media ${target.media} matches no emulated scenario` }));
  return { baked, skipped };
};
