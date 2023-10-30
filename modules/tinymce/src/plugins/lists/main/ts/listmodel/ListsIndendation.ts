import { Arr, Fun, Optional, Optionals } from '@ephox/katamari';
import { InsertAll, Remove, SugarElement, SugarFragment } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import { fireListEvent } from '../api/Events';
import { ListAction } from '../core/ListAction';
import * as Selection from '../core/Selection';
import { createTextBlock } from '../core/TextBlock';
import { composeList } from './ComposeList';
import { Entry, isEntryComment, isIndented, isSelected } from './Entry';
import { Indentation, indentEntry } from './Indentation';
import { normalizeEntries } from './NormalizeEntries';
import { EntrySet, ItemSelection, parseLists } from './ParseLists';
import { hasFirstChildList } from './Util';

const outdentedComposer = (editor: Editor, entries: Entry[]): SugarElement<DocumentFragment>[] => {
  const normalizedEntries = normalizeEntries(entries);
  return Arr.map(normalizedEntries, (entry) => {
    const content = !isEntryComment(entry)
      ? SugarFragment.fromElements(entry.content)
      : SugarFragment.fromElements([ SugarElement.fromHtml(`<!--${entry.content}-->`) ]);
    return SugarElement.fromDom(createTextBlock(editor, content.dom));
  });
};

const indentedComposer = (editor: Editor, entries: Entry[]): SugarElement<HTMLElement>[] => {
  const normalizedEntries = normalizeEntries(entries);
  return composeList(editor.contentDocument, normalizedEntries).toArray();
};

const composeEntries = (editor: Editor, entries: Entry[]): SugarElement<Node>[] =>
  Arr.bind(Arr.groupBy(entries, isIndented), (entries): SugarElement<Node>[] => {
    const groupIsIndented = Arr.head(entries).exists(isIndented);
    return groupIsIndented ? indentedComposer(editor, entries) : outdentedComposer(editor, entries);
  });

const indentSelectedEntries = (entries: Entry[], indentation: Indentation): void => {
  Arr.each(Arr.filter(entries, isSelected), (entry) => indentEntry(indentation, entry));
};

const getItemSelection = (editor: Editor): Optional<ItemSelection> => {
  const selectedListItems = Arr.map(Selection.getSelectedListItems(editor), SugarElement.fromDom);

  return Optionals.lift2(
    Arr.find(selectedListItems, Fun.not(hasFirstChildList)),
    Arr.find(Arr.reverse(selectedListItems), Fun.not(hasFirstChildList)),
    (start, end) => ({ start, end }));
};

const listIndentation = (editor: Editor, lists: SugarElement<HTMLElement>[], indentation: Indentation): void => {
  const entrySets: EntrySet[] = parseLists(lists, getItemSelection(editor));

  Arr.each(entrySets, (entrySet) => {
    indentSelectedEntries(entrySet.entries, indentation);
    const composedLists = composeEntries(editor, entrySet.entries);
    Arr.each(composedLists, (composedList) => {
      fireListEvent(editor, indentation === Indentation.Indent ? ListAction.IndentList : ListAction.OutdentList, composedList.dom);
    });
    InsertAll.before(entrySet.sourceList, composedLists);
    Remove.remove(entrySet.sourceList);
  });
};

export { listIndentation };
