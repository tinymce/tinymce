import chalk from 'chalk';
import log from 'fancy-log';
import { readFileSync } from 'fs';
import { createRequire } from 'module';
import vm from 'node:vm';

import Settings from '../Configuration';

import type { Svg } from './Core';

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

const nodeRequire = createRequire(__filename);

const esmRequire = (filePath: string): any => {
  // Real hacky way to parse and execute a ESM module since vm.Module is under an experimental flag
  const code = readFileSync(nodeRequire.resolve(filePath)).toString().replace(/^export /g, '');
  const context = vm.createContext({});

  vm.runInContext(code, context);

  return context;
};

const verifySet = (svgs: Svg[], diffIgnore: string[]): void => {
  const pkgPath = nodeRequire.resolve(Settings.defaultIconPackage + '/package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  const defaultIcons = esmRequire(Settings.defaultIconPackage).getAll() as Record<string, string>;

  const defaultIconNames = difference(Object.keys(defaultIcons), diffIgnore);
  const iconNames = difference(svgs.map((svg) => svg.name), diffIgnore);

  const diff = produceDiff(defaultIconNames, iconNames);
  if (diff.length) {
    log(`'${chalk.cyan(Settings.pluginName)}' Displaying diff against '${pkg.name}', version: ${pkg.version} \n${diff}`);
  }
};

export { verifySet };
