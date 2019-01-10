/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Strings } from '@ephox/katamari';
import { CharMap } from './CharMap';

export interface CharItem {
  value: string;
  icon: string;
  text: string;
}

const charMatches = (charCode: number, name: string, pattern: string): boolean => {
  if (Strings.contains(String.fromCharCode(charCode), pattern)) {
    return true;
  } else {
    return Strings.contains(name.toLowerCase(), pattern.toLowerCase()) || Strings.contains(name.toLowerCase().replace(/\s+/g, ''), pattern.toLowerCase());
  }
};

const scan = (group: CharMap, pattern: string): CharItem[] => {
  const matches: [number, string][] = [];
  Arr.each(group.characters, (g) => {
    if (charMatches(g[0], g[1], pattern)) {
      matches.push(g);
    }
  });

  return Arr.map(matches, (m) => {
    return {
      text: m[1],
      value: String.fromCharCode(m[0]),
      icon: String.fromCharCode(m[0])
    };
  });
};

export default {
  scan
};
