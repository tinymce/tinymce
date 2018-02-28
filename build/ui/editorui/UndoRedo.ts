/**
 * UndoRedo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const toggleUndoRedoState = function (editor, type) {
  return function () {
    const self = this;

    const checkState = function () {
      const typeFn = type === 'redo' ? 'hasRedo' : 'hasUndo';
      return editor.undoManager ? editor.undoManager[typeFn]() : false;
    };

    self.disabled(!checkState());
    editor.on('Undo Redo AddUndo TypingUndo ClearUndos SwitchMode', function () {
      self.disabled(editor.readonly || !checkState());
    });
  };
};

const registerMenuItems = function (editor) {
  editor.addMenuItem('undo', {
    text: 'Undo',
    icon: 'undo',
    shortcut: 'Meta+Z',
    onPostRender: toggleUndoRedoState(editor, 'undo'),
    cmd: 'undo'
  });

  editor.addMenuItem('redo', {
    text: 'Redo',
    icon: 'redo',
    shortcut: 'Meta+Y',
    onPostRender: toggleUndoRedoState(editor, 'redo'),
    cmd: 'redo'
  });
};

const registerButtons = function (editor) {
  editor.addButton('undo', {
    tooltip: 'Undo',
    onPostRender: toggleUndoRedoState(editor, 'undo'),
    cmd: 'undo'
  });

  editor.addButton('redo', {
    tooltip: 'Redo',
    onPostRender: toggleUndoRedoState(editor, 'redo'),
    cmd: 'redo'
  });
};

const register = function (editor) {
  registerMenuItems(editor);
  registerButtons(editor);
};

export default {
  register
};