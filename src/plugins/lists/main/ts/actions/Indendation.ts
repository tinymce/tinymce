/**
 * ListIndentation.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr, Fun, Option, Options } from '@ephox/katamari';
import { Compare, Element, Fragment, Replication, Traverse } from '@ephox/sugar';
import { Editor } from 'tinymce/core/api/Editor';
import { isList } from '../listModel/ListType';
import Range from '../core/Range';
import Selection from '../core/Selection';
import SplitList from '../core/SplitList';
import TextBlock from '../core/TextBlock';
import { listsIndentation, Composer } from '../listModel/ListsIndendation';
import { IndentValue } from '../listModel/Indentation';
import { Entry } from '../listModel/Entry';
import { ItemTuple } from '../listModel/ParseLists';

const getOutdentComposer = (editor: Editor): Composer => (entries: Entry[]): Element[] => {
  return Arr.map(entries, (entry) => {
    const content = Fragment.fromElements(entry.content);
    return Element.fromDom(TextBlock.createNewTextBlock(editor, content.dom()));
  });
};

const hasContent = (li: Element) => {
  return Traverse.firstChild(li).map(isList).getOr(false);
};

const getItemSelection = (editor: Editor): Option<ItemTuple> => {
  const selectedListItems = Arr.map(Selection.getSelectedListItems(editor), Element.fromDom);

  return Options.liftN([
    Arr.find(selectedListItems, Fun.not(hasContent)),
    Arr.find(Arr.reverse(selectedListItems), Fun.not(hasContent))
  ], (start, end) => ({ start, end }));
};

const outdentDlItem = (editor: Editor, item: Element): void => {
  if (Compare.is(item, 'DD')) {
    Replication.mutate(item, 'DT');
  } else if (Compare.is(item, 'DT')) {
    Traverse.parent(item).each((dl) => SplitList.splitList(editor, dl.dom(), item.dom()));
  }
};

const indentDlItem = (item: Element): void => {
  if (Compare.is(item, 'DT')) {
    Replication.mutate(item, 'DD');
  }
};

const dlIndentation = (editor: Editor, indentation: IndentValue, dlItems: Element[]) => {
  Arr.each(dlItems, indentation === IndentValue.Indent ? indentDlItem : Fun.curry(outdentDlItem, editor));
};

const selectionIndentation = (editor: Editor, indentation: IndentValue) => {
  const dlItems = Arr.map(Selection.getSelectedDlItems(editor), Element.fromDom);
  const lists = Arr.map(Selection.getSelectedListRoots(editor), Element.fromDom);

  if (dlItems.length || lists.length) {
    const bookmark = editor.selection.getBookmark();

    dlIndentation(editor, indentation, dlItems);

    listsIndentation(
      lists,
      indentation,
      getItemSelection(editor),
      getOutdentComposer(editor)
    );

    editor.selection.moveToBookmark(bookmark);
    editor.selection.setRng(Range.normalizeRange(editor.selection.getRng()));
    editor.nodeChanged();
  }
};

const indentListSelection = (editor: Editor) => {
  selectionIndentation(editor, IndentValue.Indent);
};

const outdentListSelection = (editor: Editor) => {
  selectionIndentation(editor, IndentValue.Outdent);
};

const flattenListSelection = (editor: Editor) => {
  selectionIndentation(editor, IndentValue.Flatten);
};

export {
  indentListSelection,
  outdentListSelection,
  flattenListSelection
};
