/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';

export interface CharItem {
  value: string;
  icon: string;
  text: string;
}

const scan = (group: { characters: [string, string][] }, pattern: string): CharItem[] => {
  const matches = [ ];
  Arr.each(group.characters, (g) => {
    // dual casting is arguably better than pretending the first array entry is a number. Is parseint worth the cost?
    if (String.fromCharCode(g[0] as unknown as number).indexOf(pattern) > -1 || g[1].indexOf(pattern) > -1) {
      matches.push(g);
    }
});

  return Arr.map(matches, (m) => {
    return {
      text: m[1] + ' (' + m[0] + ')',
      value: String.fromCharCode(m[0]),
      icon: String.fromCharCode(m[0])
    };
  });
};

export default {
  scan
};
