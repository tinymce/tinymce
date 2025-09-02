import { DOMParser } from '@xmldom/xmldom';
import chalk from 'chalk';
import log from 'fancy-log';

import Settings from '../Configuration.js';

import type { Svg } from './Core.js';

const requiresClass = (svg: Svg): boolean =>
  !!Settings.requiredClasses[svg.name];

const hasClass = (svg: Svg, target: string): boolean => {
  const domParser = new DOMParser();
  const domSvg = domParser.parseFromString(svg.data, 'image/svg+xml');
  return domSvg.getElementsByClassName(target).length > 0;
};

const verifyClasses = (svgs: Svg[]): void => {
  const missing: string[] = [];

  svgs.filter(requiresClass).forEach((svg) => {
    if (!hasClass(svg, Settings.requiredClasses[svg.name])) {
      missing.push(`  '${svg.name}' does not have a class equal to '${Settings.requiredClasses[svg.name]}'`);
    }
  });

  const numMissing = missing.length;
  if (numMissing > 0) {
    log(`'${chalk.cyan(Settings.pluginName)}' Found ${numMissing} missing ID${(numMissing > 1 ? 's' : '')}. Is this intentional?\n` + missing.join('\n'));
  }
};

export { verifyClasses };
