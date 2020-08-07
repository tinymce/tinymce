/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { dlIndentation } from '../core/DlIndentation';
import * as Range from '../core/RangeUtils';
import * as Selection from '../core/Selection';
import { Indentation } from '../listModel/Indentation';
import { listIndentation } from '../listModel/ListsIndendation';

const selectionIndentation = (editor: Editor, indentation: Indentation): boolean => {
  const lists = Arr.map(Selection.getSelectedListRoots(editor), SugarElement.fromDom);
  const dlItems = Arr.map(Selection.getSelectedDlItems(editor), SugarElement.fromDom);
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
