/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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