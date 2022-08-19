import { SugarElements } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import { dlIndentation } from '../core/DlIndentation';
import * as Range from '../core/RangeUtils';
import * as Selection from '../core/Selection';
import { selectionIsWithinNonEditableList } from '../core/Util';
import { Indentation } from '../listmodel/Indentation';
import { listIndentation } from '../listmodel/ListsIndendation';

const selectionIndentation = (editor: Editor, indentation: Indentation): boolean => {
  const lists = SugarElements.fromDom(Selection.getSelectedListRoots(editor));
  const dlItems = SugarElements.fromDom(Selection.getSelectedDlItems(editor));
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

const handleIndentation = (editor: Editor, indentation: Indentation): boolean =>
  !selectionIsWithinNonEditableList(editor) && selectionIndentation(editor, indentation);

const indentListSelection = (editor: Editor): boolean => handleIndentation(editor, Indentation.Indent);

const outdentListSelection = (editor: Editor): boolean => handleIndentation(editor, Indentation.Outdent);

const flattenListSelection = (editor: Editor): boolean => handleIndentation(editor, Indentation.Flatten);

export {
  indentListSelection,
  outdentListSelection,
  flattenListSelection
};
