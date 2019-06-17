/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Option, Options } from '@ephox/katamari';
import { Element, Fragment, InsertAll, Remove } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Selection from '../core/Selection';
import { composeList } from './ComposeList';
import { Entry, isIndented, isSelected } from './Entry';
import { indentEntry, Indentation } from './Indentation';
import { normalizeEntries } from './NormalizeEntries';
import { EntrySet, ItemSelection, parseLists } from './ParseLists';
import { hasFirstChildList } from './Util';
import { createTextBlock } from '../core/TextBlock';
import { fireListEvent } from '../api/Events';
import { ListAction } from '../core/ListAction';

const outdentedComposer = (editor: Editor, entries: Entry[]): Element[] => {
  return Arr.map(entries, (entry) => {
    const content = Fragment.fromElements(entry.content);
    return Element.fromDom(createTextBlock(editor, content.dom()));
  });
};

const indentedComposer = (editor: Editor, entries: Entry[]): Element[] => {
  normalizeEntries(entries);
  return composeList(editor.contentDocument, entries).toArray();
};

const composeEntries = (editor, entries: Entry[]): Element[] => {
  return Arr.bind(Arr.groupBy(entries, isIndented), (entries) => {
    const groupIsIndented = Arr.head(entries).map(isIndented).getOr(false);
    return groupIsIndented ? indentedComposer(editor, entries) : outdentedComposer(editor, entries);
  });
};

const indentSelectedEntries = (entries: Entry[], indentation: Indentation): void => {
  Arr.each(Arr.filter(entries, isSelected), (entry) => indentEntry(indentation, entry));
};

const getItemSelection = (editor: Editor): Option<ItemSelection> => {
  const selectedListItems = Arr.map(Selection.getSelectedListItems(editor), Element.fromDom);

  return Options.liftN([
    Arr.find(selectedListItems, Fun.not(hasFirstChildList)),
    Arr.find(Arr.reverse(selectedListItems), Fun.not(hasFirstChildList))
  ], (start, end) => ({ start, end }));
};

const listsIndentation = (editor: Editor, lists: Element[], indentation: Indentation) => {
  const entrySets: EntrySet[] = parseLists(lists, getItemSelection(editor));

  Arr.each(entrySets, (entrySet) => {
    indentSelectedEntries(entrySet.entries, indentation);
    const composedLists = composeEntries(editor, entrySet.entries);
    Arr.each(composedLists, (composedList) => {
      fireListEvent(editor, indentation === Indentation.Indent ? ListAction.IndentList : ListAction.OutdentList, composedList.dom());
    });
    InsertAll.before(entrySet.sourceList, composedLists);
    Remove.remove(entrySet.sourceList);
  });
};

export { listsIndentation };