import { SugarElements } from '@ephox/sugar';

import Editor from '../../api/Editor';
import { Indentation } from '../listmodel/Indentation';
import { listIndentation } from '../listmodel/ListsIndendation';
import { dlIndentation } from '../lists/DlIndentation';
import * as Range from '../lists/RangeUtils';
import * as Selection from '../lists/Selection';
import * as Util from '../lists/Util';

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
  !Util.selectionIsWithinNonEditableList(editor) && selectionIndentation(editor, indentation);

const indentListSelection = (editor: Editor): boolean => handleIndentation(editor, Indentation.Indent);

const outdentListSelection = (editor: Editor): boolean => handleIndentation(editor, Indentation.Outdent);

const flattenListSelection = (editor: Editor): boolean => handleIndentation(editor, Indentation.Flatten);

export {
  flattenListSelection,
  indentListSelection,
  outdentListSelection
};
