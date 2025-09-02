import chalk from 'chalk';
import log from 'fancy-log';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

import Settings from '../Configuration.js';

import type { Svg } from './Core.js';
import { loadModule } from './ModuleLoader.js';

const difference = (source: string[], toExclude: string[]): string[] =>
  source.filter((value) => !toExclude.find((val) => val === value));

const produceDiff = (iconNames: string[], defaultIconNames: string[]): string => {
  const additional = difference(defaultIconNames, iconNames);
  const omitted = difference(iconNames, defaultIconNames);
  let diff = '';

  if (additional.length) {
    const additionalDiff = additional.reduce((acc, str) => acc + '\n  + ' + str, '');
    diff += chalk.green(`${additional.length} additional icon${(additional.length > 1 ? 's' : '') + additionalDiff}\n`);
  }

  if (omitted.length) {
    const omittedDiff = omitted.reduce((acc, str) => acc + '\n  - ' + str, '');
    diff += chalk.red(`${omitted.length} omitted icon${(omitted.length > 1 ? 's' : '') + omittedDiff}`);
  }

  return diff;
};

const verifySet = async (svgs: Svg[], diffIgnore: string[]): Promise<void> => {
  // Load package.json
  const pkgPath = new URL(Settings.defaultIconPackage + '/package.json', import.meta.url);
  const pkg = JSON.parse(readFileSync(fileURLToPath(pkgPath), 'utf8'));

  // Load the default icons module
  const defaultIconsModule = await loadModule(Settings.defaultIconPackage);
  const defaultIcons = defaultIconsModule.getAll();

  const defaultIconNames = difference(Object.keys(defaultIcons), diffIgnore);
  const iconNames = difference(svgs.map((svg) => svg.name), diffIgnore);

  const diff = produceDiff(defaultIconNames, iconNames);
  if (diff.length) {
    log(`'${chalk.cyan(Settings.pluginName)}' Displaying diff against '${pkg.name}', version: ${pkg.version} \n${diff}`);
  }
};

export { verifySet };
