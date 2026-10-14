// TINYMCE-14907: compiles each skin built with CSS custom properties twice (flag
// off/on), renders every selector of both compiles into headless Chromium, and
// compares the computed values. Usage, from editor/modules/oxide/:
//   bun run css-parity
// Exits 1 on any computed-value mismatch; unverified/skipped selectors only warn.
import { performance } from 'node:perf_hooks';
import { styleText } from 'node:util';
import { chromium, type Browser } from 'playwright';

import { bakeSkin, type BakedTarget } from './bake';
import { extractTargets } from './css-rules';
import { diffComputed } from './diff';
import { compileSkin } from './less-compile';
import type { DiffMismatch, SkippedRule } from './types';

// Only these skins are built with custom properties so far.
const SKINS = [ 'default', 'dark' ];

const useColor = Boolean(process.env.FORCE_COLOR) || (Boolean(process.stdout.isTTY) && !process.env.NO_COLOR);
const paint = (format: Parameters<typeof styleText>[0]) => (text: string): string => useColor ? styleText(format, text) : text;
const red = paint([ 'red', 'bold' ]);
const yellow = paint('yellow');
const green = paint('green');
const dim = paint('dim');
const bold = paint('bold');

interface SkinReport {
  skin: string;
  checked: number;
  components: number;
  mismatched: { baked: BakedTarget; mismatches: DiffMismatch[] }[];
  unverified: BakedTarget[];
  fellBack: BakedTarget[];
  skipped: SkippedRule[];
}

const plural = (count: number, word: string): string => `${count} ${word}${count === 1 ? '' : 's'}`;

const groupBy = <T>(items: T[], key: (item: T) => string): Map<string, T[]> => {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    groups.set(key(item), [ ...groups.get(key(item)) ?? [], item ]);
  }
  return new Map([ ...groups ].sort(([ a ], [ b ]) => a.localeCompare(b)));
};

const label = ({ target, scenario }: BakedTarget): string =>
  `${target.selector}${scenario === 'desktop' ? '' : dim(`  [${scenario}]`)}`;

const checkSkin = async (browser: Browser, skin: string): Promise<SkinReport> => {
  const css = await compileSkin(skin);
  const { targets, skipped: skippedRules } = extractTargets([ css.off, css.on ]);
  const { baked, skipped: skippedMedia } = await bakeSkin(browser, css, targets);

  const evaluated = baked.filter(({ on }) => on.status !== 'unsupported');
  return {
    skin,
    checked: evaluated.length,
    components: new Set(evaluated.map(({ target }) => target.component)).size,
    mismatched: evaluated
      .map((b) => ({ baked: b, mismatches: diffComputed(b.off.computed, b.on.computed) }))
      .filter(({ mismatches }) => mismatches.length > 0),
    unverified: evaluated.filter(({ on }) => on.status !== 'ok'),
    // Unverified selectors are already reported; their fallbacks would only repeat that.
    fellBack: evaluated.filter(({ on }) => on.status === 'ok' && on.fallbacks.length > 0),
    skipped: [
      ...baked.filter(({ on }) => on.status === 'unsupported').map(({ target }) => ({ selector: target.selector, reason: 'not supported by Chromium' })),
      ...skippedRules,
      ...skippedMedia
    ]
  };
};

const printSkin = (report: SkinReport): void => {
  const failed = report.mismatched.length > 0;
  const status = failed ? red(`❌ ${plural(report.mismatched.length, 'selector')} differ`) : green('✅ all computed values match');
  console.log(`\n${bold(`${report.skin} skin`)}  ${dim(`${plural(report.checked, 'selector')} in ${plural(report.components, 'component')}`)}  ${status}`);

  for (const [ component, entries ] of groupBy(report.mismatched, ({ baked }) => baked.target.component)) {
    console.log(`  ${red(`❌ ${component}`)}`);
    for (const { baked, mismatches } of entries) {
      console.log(`     ${label(baked)}`);
      for (const { prop, offValue, onValue } of mismatches) {
        console.log(`       ${bold(prop)}\n         ${dim('LESS:       ')} ${offValue}\n         ${dim('custom prop:')} ${red(onValue)}`);
      }
    }
  }

  if (report.unverified.length > 0) {
    console.log(`  ${yellow(`⚠️  ${plural(report.unverified.length, 'selector')} not verified`)} ${dim('— the synthesized DOM doesn\'t match the selector (or its pseudo-element can\'t be read), so these rules\' own values may not be what was compared:')}`);
    for (const baked of report.unverified) {
      console.log(`     ${yellow(baked.target.component)} ${label(baked)}${baked.on.status === 'unreadable' ? dim('  (pseudo-element not readable)') : ''}`);
    }
  }

  if (report.fellBack.length > 0) {
    const why = 'these custom properties are declared, but not on the synthesized element or its ancestors, so the var() fallback (the LESS value) was compared instead of the custom property:';
    console.log(`  ${yellow(`⚠️  ${plural(report.fellBack.length, 'selector')} compared against the fallback`)} ${dim(`— ${why}`)}`);
    for (const baked of report.fellBack) {
      console.log(`     ${yellow(baked.target.component)} ${label(baked)}  ${dim(baked.on.fallbacks.join(', '))}`);
    }
  }

  if (report.skipped.length > 0) {
    console.log(`  ${dim(`⏭️  ${plural(report.skipped.length, 'selector')} skipped:`)}`);
    for (const [ reason, rules ] of groupBy(report.skipped, (rule) => rule.reason)) {
      console.log(dim(`     ${reason}: ${rules.map(({ selector }) => selector).join(', ')}`));
    }
  }
};

const main = async (): Promise<void> => {
  const started = performance.now();
  console.log(bold('css-parity') + dim(` — LESS (flag off) vs CSS custom properties (flag on), computed in Chromium, skins: ${SKINS.join(', ')}`));

  const browser = await chromium.launch();
  const reports = await Promise.all(SKINS.map((skin) => checkSkin(browser, skin))).finally(() => browser.close());
  reports.forEach(printSkin);

  const seconds = ((performance.now() - started) / 1000).toFixed(1);
  const failedSkins = reports.filter((report) => report.mismatched.length > 0).map((report) => report.skin);
  const unverified = reports.reduce((sum, report) => sum + report.unverified.length, 0);
  const fellBack = reports.reduce((sum, report) => sum + report.fellBack.length, 0);
  const warning = [
    unverified > 0 ? yellow(`  ⚠️  ${unverified} unverified`) : '',
    fellBack > 0 ? yellow(`  ⚠️  ${fellBack} compared against the fallback`) : ''
  ].join('');

  console.log('');
  if (failedSkins.length > 0) {
    console.log(`${red(`❌ FAIL — computed values differ in: ${failedSkins.join(', ')}`)}${warning}  ${dim(`${seconds}s`)}`);
    process.exitCode = 1;
  } else {
    console.log(`${green(`✅ PASS — ${SKINS.join(' and ')} match`)}${warning}  ${dim(`${seconds}s`)}`);
  }
};

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
