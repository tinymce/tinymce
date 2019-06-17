/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Entry } from './Entry';
import { Arr, Merger, Option } from '@ephox/katamari';

const cloneListProperties = (target: Entry, source: Entry): void => {
  target.listType = source.listType;
  target.listAttributes = Merger.merge({}, source.listAttributes);
};

// Closest entry above in the same list
const previousSiblingEntry = (entries: Entry[], start: number): Option<Entry> => {
  const depth = entries[start].depth;
  for (let i = start - 1; i >= 0; i--) {
    if (entries[i].depth === depth) {
      return Option.some(entries[i]);
    }
    if (entries[i].depth < depth) {
      break;
    }
  }
  return Option.none();
};

const normalizeEntries = (entries: Entry[]): void => {
  Arr.each(entries, (entry, i) => {
    previousSiblingEntry(entries, i).each((matchingEntry) => {
      cloneListProperties(entry, matchingEntry);
    });
  });
};

export {
  normalizeEntries
};