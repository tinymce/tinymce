/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

export default () => {
  const data = [];
  let index = -1;

  const add = (state) => {
    const removed = data.splice(++index);
    data.push(state);

    return {
      state,
      removed
    };
  };

  const undo = () => {
    if (canUndo()) {
      return data[--index];
    }
  };

  const redo = () => {
    if (canRedo()) {
      return data[++index];
    }
  };

  const canUndo = () => {
    return index > 0;
  };

  const canRedo = () => {
    return index !== -1 && index < data.length - 1;
  };

  return {
    data,
    add,
    undo,
    redo,
    canUndo,
    canRedo
  };
};
