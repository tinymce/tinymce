import { Arr, Strings } from '@ephox/katamari';

import { CharMap, Char } from './CharMap';

export interface CharItem {
  readonly value: string;
  readonly icon: string;
  readonly text: string;
}

const charMatches = (charCode: number, name: string, lowerCasePattern: string): boolean => {
  if (Strings.contains(Strings.fromCodePoint(charCode).toLowerCase(), lowerCasePattern)) {
    return true;
  } else {
    return Strings.contains(name.toLowerCase(), lowerCasePattern) || Strings.contains(name.toLowerCase().replace(/\s+/g, ''), lowerCasePattern);
  }
};

const scan = (group: CharMap, pattern: string): CharItem[] => {
  const matches: Char[] = [];
  const lowerCasePattern = pattern.toLowerCase();
  Arr.each(group.characters, (g) => {
    if (charMatches(g[0], g[1], lowerCasePattern)) {
      matches.push(g);
    }
  });

  return Arr.map(matches, (m) => ({
    text: m[1],
    value: Strings.fromCodePoint(m[0]),
    icon: Strings.fromCodePoint(m[0])
  }));
};

export {
  scan
};
