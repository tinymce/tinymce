import { DOMParser } from '@xmldom/xmldom';

import Settings from '../Configuration.js';
import type { Svg } from './Core.js';

export const verifyClasses = (svgs: Svg[]): void => {
  const parser = new DOMParser();
  const missing: string[] = [];

  svgs.forEach(svg => {
    const doc = parser.parseFromString(svg.data, 'text/xml');
    const svgElement = doc.documentElement;

    if (!svgElement.hasAttribute('class')) {
      missing.push(svg.name);
    }
  });

  const numMissing = missing.length;
  if (numMissing > 0) {
    // We don't need to log this since it's just a warning
    // console.log(`'${Settings.pluginName}' Found ${numMissing} missing ID${(numMissing > 1 ? 's' : '')}. Is this intentional?\n` + missing.join('\n'));
  }
};