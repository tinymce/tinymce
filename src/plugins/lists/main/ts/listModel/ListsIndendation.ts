/**
 * ListsIndentation.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr, Option } from '@ephox/katamari';
import { Element, InsertAll, Remove } from '@ephox/sugar';
import { composeList } from './ComposeList';
import { Entry, isIndented, isSelected } from './Entry';
import { IndentValue, indentEntry } from './Indentation';
import { normalizeEntries } from './NormalizeEntries';
import { ItemTuple, parseLists } from './ParseLists';

export type Composer = (entries: Entry[]) => Element[];

const indentedComposer: Composer = (entries: Entry[]): Element[] => {
  normalizeEntries(entries);
  return composeList(entries).toArray();
};

const composeEntries = (entries: Entry[], outdentedComposer: Composer): Element[] => {
  return Arr.bind(Arr.groupBy(entries, isIndented), (entries) => {
    const groupIsIndented = Arr.head(entries).map(isIndented).getOr(false);
    return groupIsIndented ? indentedComposer(entries) : outdentedComposer(entries);
  });
};

const indentSelectedEntries = (entries: Entry[], indentation: IndentValue): void => {
  Arr.each(Arr.filter(entries, isSelected), (entry) => indentEntry(indentation, entry));
};

const listsIndentation = (lists: Element[], indentation: IndentValue, itemSelectionRange: Option<ItemTuple>, outdentedComposer: Composer) => {
  Arr.each(parseLists(lists, itemSelectionRange), (entrySet) => {
    indentSelectedEntries(entrySet.entries, indentation);
    const composed = composeEntries(entrySet.entries, outdentedComposer);
    InsertAll.before(entrySet.sourceList, composed);
    Remove.remove(entrySet.sourceList);
  });
};

export { listsIndentation };
