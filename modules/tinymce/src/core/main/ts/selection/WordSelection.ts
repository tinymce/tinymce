/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Type } from '@ephox/katamari';
import EditorSelection from '../api/dom/Selection';
import Editor from '../api/Editor';
import * as CaretContainer from '../caret/CaretContainer';
import CaretPosition from '../caret/CaretPosition';

const hasSelectionModifyApi = (editor: Editor) => {
  return Type.isFunction((editor.selection.getSel() as any).modify);
};

const moveRel = (forward: boolean, selection: EditorSelection, pos: CaretPosition) => {
  const delta = forward ? 1 : -1;
  selection.setRng(CaretPosition(pos.container(), pos.offset() + delta).toRange());
  (selection.getSel() as any).modify('move', forward ? 'forward' : 'backward', 'word');
  return true;
};

const moveByWord = (forward: boolean, editor: Editor) => {
  const rng = editor.selection.getRng();
  const pos = forward ? CaretPosition.fromRangeEnd(rng) : CaretPosition.fromRangeStart(rng);

  if (!hasSelectionModifyApi(editor)) {
    return false;
  } else if (forward && CaretContainer.isBeforeInline(pos)) {
    return moveRel(true, editor.selection, pos);
  } else if (!forward && CaretContainer.isAfterInline(pos)) {
    return moveRel(false, editor.selection, pos);
  } else {
    return false;
  }
};

export {
  hasSelectionModifyApi,
  moveByWord
};
