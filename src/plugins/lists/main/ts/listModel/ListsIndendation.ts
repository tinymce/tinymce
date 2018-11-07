/**
 * ListsIndentation.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr, Option, Options, Fun } from '@ephox/katamari';
import { Element, InsertAll, Remove, Fragment } from '@ephox/sugar';
import { composeList } from './ComposeList';
import { Entry, isIndented, isSelected } from './Entry';
import { IndentValue, indentEntry } from './Indentation';
import { normalizeEntries } from './NormalizeEntries';
import { ItemTuple, parseLists, EntrySet } from './ParseLists';
import { Editor } from 'tinymce/core/api/Editor';
import TextBlock from '../core/TextBlock';
import Selection from '../core/Selection';
import { hasFirstChildList } from './Util';

const outdentedComposer = (editor: Editor, entries: Entry[]): Element[] => {
  return Arr.map(entries, (entry) => {
    const content = Fragment.fromElements(entry.content);
    return Element.fromDom(TextBlock.createNewTextBlock(editor, content.dom()));
  });
};

const indentedComposer = (entries: Entry[]): Element[] => {
  normalizeEntries(entries);
  return composeList(entries).toArray();
};

const composeEntries = (editor, entries: Entry[]): Element[] => {
  return Arr.bind(Arr.groupBy(entries, isIndented), (entries) => {
    const groupIsIndented = Arr.head(entries).map(isIndented).getOr(false);
    return groupIsIndented ? indentedComposer(entries) : outdentedComposer(editor, entries);
  });
};

const indentSelectedEntries = (entries: Entry[], indentation: IndentValue): void => {
  Arr.each(Arr.filter(entries, isSelected), (entry) => indentEntry(indentation, entry));
};

const getItemSelection = (editor: Editor): Option<ItemTuple> => {
  const selectedListItems = Arr.map(Selection.getSelectedListItems(editor), Element.fromDom);

  return Options.liftN([
    Arr.find(selectedListItems, Fun.not(hasFirstChildList)),
    Arr.find(Arr.reverse(selectedListItems), Fun.not(hasFirstChildList))
  ], (start, end) => ({ start, end }));
};

const listsIndentation = (editor: Editor, lists: Element[], indentation: IndentValue) => {
  const parsedLists: EntrySet[] = parseLists(lists, getItemSelection(editor));

  Arr.each(parsedLists, (entrySet) => {
    indentSelectedEntries(entrySet.entries, indentation);
    InsertAll.before(entrySet.sourceList, composeEntries(editor, entrySet.entries));
    Remove.remove(entrySet.sourceList);
  });
};

export { listsIndentation };
