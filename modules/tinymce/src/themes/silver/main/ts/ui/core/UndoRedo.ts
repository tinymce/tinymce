/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { Menu } from '@ephox/bridge';

const toggleUndoRedoState = (api: Menu.MenuItemInstanceApi, editor: Editor, type: 'hasUndo' | 'hasRedo') => {
  const checkState = () => {
    return editor.undoManager ? editor.undoManager[type]() : false;
  };

  const onUndoStateChange = () => {
    api.setDisabled(editor.mode.isReadOnly() || !checkState());
  };

  api.setDisabled(!checkState());

  editor.on('Undo Redo AddUndo TypingUndo ClearUndos SwitchMode', onUndoStateChange);
  return () => editor.off('Undo Redo AddUndo TypingUndo ClearUndos SwitchMode', onUndoStateChange);
};

const registerMenuItems = (editor: Editor) => {
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

const registerButtons = (editor: Editor) => {
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

const register = (editor: Editor) => {
  registerMenuItems(editor);
  registerButtons(editor);
};

export default {
  register
};