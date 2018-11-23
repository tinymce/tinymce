/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Type } from '@ephox/katamari';
import * as CaretContainer from '../caret/CaretContainer';
import CaretPosition from '../caret/CaretPosition';
import { Selection } from '../api/dom/Selection';
import { Editor } from 'tinymce/core/api/Editor';

const hasSelectionModifyApi = function (editor: Editor) {
  return Type.isFunction((<any> editor.selection.getSel()).modify);
};

const moveRel = function (forward: boolean, selection: Selection, pos: CaretPosition) {
  const delta = forward ? 1 : -1;
  selection.setRng(CaretPosition(pos.container(), pos.offset() + delta).toRange());
  (<any> selection.getSel()).modify('move', forward ? 'forward' : 'backward', 'word');
  return true;
};

const moveByWord = function (forward: boolean, editor: Editor) {
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

export default {
  hasSelectionModifyApi,
  moveByWord
};