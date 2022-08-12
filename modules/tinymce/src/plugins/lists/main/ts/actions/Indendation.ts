import { Arr } from '@ephox/katamari';
import { SugarElement, ContentEditable, SugarElements } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import { dlIndentation } from '../core/DlIndentation';
import * as Range from '../core/RangeUtils';
import * as Selection from '../core/Selection';
import { Indentation } from '../listmodel/Indentation';
import { listIndentation } from '../listmodel/ListsIndendation';

const getEditableElements = (elements: HTMLElement[]): SugarElement<HTMLElement>[] =>
  Arr.filter(SugarElements.fromDom(elements), ContentEditable.get);

const selectionIndentation = (editor: Editor, indentation: Indentation): boolean => {
  const lists = getEditableElements(Selection.getSelectedListRoots(editor));
  const dlItems = getEditableElements(Selection.getSelectedDlItems(editor));
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
