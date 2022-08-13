import { Arr } from '@ephox/katamari';
import { SugarElements } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import { dlIndentation } from '../core/DlIndentation';
import * as Range from '../core/RangeUtils';
import * as Selection from '../core/Selection';
import { isEditableList } from '../core/Util';
import { Indentation } from '../listmodel/Indentation';
import { listIndentation } from '../listmodel/ListsIndendation';

const selectionIndentation = (editor: Editor, indentation: Indentation): boolean => {
  const lists = SugarElements.fromDom(Arr.filter(Selection.getSelectedListRoots(editor),
    (elm: HTMLElement) => isEditableList(editor, elm)));
  const dlItems = SugarElements.fromDom(Arr.filter(Selection.getSelectedDlItems(editor),
    (elm: HTMLElement) => isEditableList(editor, elm)));
  let isHandled = false;

  if (lists.length || dlItems.length) {
    const bookmark = editor.selection.getBookmark();

    listIndentation(editor, lists, indentation);
    dlIndentation(editor, indentation, dlItems);

    editor.selection.moveToBookmark(bookmark);
    editor.selection.setRng(Range.normalizeRange(editor.selection.getRng()));
    editor.nodeChanged();
    isHandled = true;
  }

  return isHandled;
};

const indentListSelection = (editor: Editor): boolean => selectionIndentation(editor, Indentation.Indent);

const outdentListSelection = (editor: Editor): boolean => selectionIndentation(editor, Indentation.Outdent);

const flattenListSelection = (editor: Editor): boolean => selectionIndentation(editor, Indentation.Flatten);

export {
  indentListSelection,
  outdentListSelection,
  flattenListSelection
};
