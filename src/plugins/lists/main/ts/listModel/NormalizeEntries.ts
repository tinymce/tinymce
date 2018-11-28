/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Entry } from './Entry';
import { Arr, Merger, Option } from '@ephox/katamari';

const assimilateEntry = (adherent: Entry, source: Entry) => {
  adherent.listType = source.listType;
  adherent.listAttributes = Merger.merge({}, source.listAttributes);
  adherent.itemAttributes = Merger.merge({}, source.itemAttributes);
};

const normalizeShallow = (outline: Array<Option<Entry>>, entry: Entry): Array<Option<Entry>> => {
  const matchingEntryDepth = entry.depth - 1;
  outline[matchingEntryDepth].each((matchingEntry) => assimilateEntry(entry, matchingEntry));

  const newOutline = outline.slice(0, matchingEntryDepth);
  newOutline.push(Option.some(entry));
  return newOutline;
};

const normalizeDeep = (outline: Array<Option<Entry>>, entry: Entry): Array<Option<Entry>> => {
  const newOutline = outline.slice(0);
  const diff = entry.depth - outline.length;
  for (let i = 1; i < diff; i++) {
    newOutline.push(Option.none());
  }
  newOutline.push(Option.some(entry));
  return newOutline;
};

const normalizeEntries = (entries: Entry[]): void => {
  Arr.foldl(entries, (outline: Array<Option<Entry>>, entry) => {
    return entry.depth > outline.length ? normalizeDeep(outline, entry) : normalizeShallow(outline, entry);
  }, []);
};

export {
  normalizeEntries
};