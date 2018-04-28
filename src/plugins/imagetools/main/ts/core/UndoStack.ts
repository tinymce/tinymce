/**
 * UndoStack.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

export default function () {
  const data = [];
  let index = -1;

  function add(state) {
    let removed;

    removed = data.splice(++index);
    data.push(state);

    return {
      state,
      removed
    };
  }

  function undo() {
    if (canUndo()) {
      return data[--index];
    }
  }

  function redo() {
    if (canRedo()) {
      return data[++index];
    }
  }

  function canUndo() {
    return index > 0;
  }

  function canRedo() {
    return index !== -1 && index < data.length - 1;
  }

  return {
    data,
    add,
    undo,
    redo,
    canUndo,
    canRedo
  };
}