import { Arr, Fun, Optional, Optionals } from '@ephox/katamari';
import { InsertAll, Remove, SelectorFilter, SelectorFind, SugarElement, SugarFragment } from '@ephox/sugar';

import Editor from '../../api/Editor';
import * as Options from '../../api/Options';
import { fireListEvent } from '../events/Events';
import { ListAction } from '../lists/ListAction';
import * as Selection from '../lists/Selection';
import { createTextBlock } from '../lists/TextBlock';

import { composeList } from './ComposeList';
import { Entry, isEntryComment, isEntryList, isIndented, isSelected } from './Entry';
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
    const listItemAttrs = isEntryList(entry) ? entry.itemAttributes : {};
    return SugarElement.fromDom(createTextBlock(editor, content.dom, listItemAttrs));
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

const indentSelectedEntries = (editor: Editor, entries: Entry[], indentation: Indentation): void => {
  Arr.each(Arr.filter(entries, isSelected), (entry) => indentEntry(editor, indentation, entry));
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
    indentSelectedEntries(editor, entrySet.entries, indentation);
    const composedLists = composeEntries(editor, entrySet.entries);
    Arr.each(composedLists, (composedList) => {
      fireListEvent(editor, indentation === Indentation.Indent ? ListAction.IndentList : ListAction.OutdentList, composedList.dom);
    });
    InsertAll.before(entrySet.sourceList, composedLists);
    Remove.remove(entrySet.sourceList);
  });
};

const canIndent = (editor: Editor): boolean =>
  Options.getListMaxDepth(editor).forall((max) => {
    const blocks = editor.selection.getSelectedBlocks();
    return Arr.exists(blocks, (element) => {
      return SelectorFind.closest(SugarElement.fromDom(element), 'li').forall((sugarElement) => SelectorFilter.ancestors(sugarElement, 'ol,ul').length <= max);
    });
  });

export {
  canIndent,
  listIndentation
};
