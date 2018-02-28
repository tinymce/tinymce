/**
 * WordSelection.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Type } from '@ephox/katamari';
import * as CaretContainer from '../caret/CaretContainer';
import CaretPosition from '../caret/CaretPosition';
import { Selection } from '../api/dom/Selection';

const hasSelectionModifyApi = function (editor) {
  return Type.isFunction(editor.selection.getSel().modify);
};

const moveRel = function (forward, selection: Selection, pos) {
  const delta = forward ? 1 : -1;
  selection.setRng(CaretPosition(pos.container(), pos.offset() + delta).toRange());
  (<any> selection.getSel()).modify('move', forward ? 'forward' : 'backward', 'word');
  return true;
};

const moveByWord = function (forward, editor) {
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