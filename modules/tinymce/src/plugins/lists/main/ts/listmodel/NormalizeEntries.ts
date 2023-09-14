import { Arr, Obj, Optional } from '@ephox/katamari';

import { Entry, EntryList, isEntryList } from './Entry';

const cloneListProperties = (target: Entry, source: Entry): void => {
  if (isEntryList(target) && isEntryList(source)) {
    target.listType = source.listType;
    target.listAttributes = { ...source.listAttributes };
  }
};

const cleanListProperties = (entry: EntryList): void => {
  // Remove the start attribute if generating a new list
  entry.listAttributes = Obj.filter(entry.listAttributes, (_value, key) => key !== 'start');
};

// Closest entry above/below in the same list
const closestSiblingEntry = (entries: Entry[], start: number): Optional<Entry> => {
  const depth = entries[start].depth;
  // Ignore dirty items as they've been moved and won't have the right list data yet
  const matches = (entry: Entry) => entry.depth === depth && !entry.dirty;
  const until = (entry: Entry) => entry.depth < depth;

  // Check in reverse to see if there's an entry as the same depth before the current entry
  // but if not, then try to walk forwards as well
  return Arr.findUntil(Arr.reverse(entries.slice(0, start)), matches, until)
    .orThunk(() => Arr.findUntil(entries.slice(start + 1), matches, until));
};

const normalizeEntries = (entries: Entry[]): Entry[] => {
  Arr.each(entries, (entry, i) => {
    closestSiblingEntry(entries, i).fold(
      () => {
        if (entry.dirty && isEntryList(entry)) {
          cleanListProperties(entry);
        }
      },
      (matchingEntry) => cloneListProperties(entry, matchingEntry)
    );
  });
  return entries;
};

export {
  normalizeEntries
};
