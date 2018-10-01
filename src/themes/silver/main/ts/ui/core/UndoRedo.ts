/**
 * UndoRedo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const toggleUndoRedoState = (api, editor, type) => {
  const checkState = () => {
    return editor.undoManager ? editor.undoManager[type]() : false;
  };

  const onUndoStateChange = () => {
    api.setDisabled(editor.readonly || !checkState());
  };

  api.setDisabled(!checkState());

  editor.on('Undo Redo AddUndo TypingUndo ClearUndos SwitchMode', onUndoStateChange);
  return () => editor.off('Undo Redo AddUndo TypingUndo ClearUndos SwitchMode', onUndoStateChange);
};

const registerMenuItems = (editor) => {
  editor.ui.registry.addMenuItem('undo', {
    text: 'Undo',
    icon: 'undo',
    shortcut: 'Meta+Z',
    onSetup: (api) => toggleUndoRedoState(api, editor, 'hasUndo'),
    onAction: () => editor.execCommand('undo')
  });

  editor.ui.registry.addMenuItem('redo', {
    text: 'Redo',
    icon: 'redo',
    shortcut: 'Meta+Y',
    onSetup: (api) => toggleUndoRedoState(api, editor, 'hasRedo'),
    onAction: () => editor.execCommand('redo')
  });
};

const registerButtons = (editor) => {
  editor.ui.registry.addButton('undo', {
    tooltip: 'Undo',
    icon: 'undo',
    onSetup: (api) => toggleUndoRedoState(api, editor, 'hasUndo'),
    onAction: () => editor.execCommand('undo')
  });

  editor.ui.registry.addButton('redo', {
    tooltip: 'Redo',
    icon: 'redo',
    onSetup: (api) => toggleUndoRedoState(api, editor, 'hasRedo'),
    onAction: () => editor.execCommand('redo')
  });
};

const register = (editor) => {
  registerMenuItems(editor);
  registerButtons(editor);
};

export default {
  register
};