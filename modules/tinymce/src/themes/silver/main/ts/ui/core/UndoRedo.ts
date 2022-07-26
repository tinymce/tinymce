import Editor from 'tinymce/core/api/Editor';
import { Menu, Toolbar } from 'tinymce/core/api/ui/Ui';

import { onActionExecCommand, onSetupEvent } from './ControlUtils';

const onSetupUndoRedoState = (editor: Editor, type: 'hasUndo' | 'hasRedo') =>
  onSetupEvent(editor, 'Undo Redo AddUndo TypingUndo ClearUndos SwitchMode', (api: Menu.MenuItemInstanceApi | Toolbar.ToolbarButtonInstanceApi) => {
    api.setEnabled(!editor.mode.isReadOnly() && editor.undoManager[type]());
  });

const registerMenuItems = (editor: Editor): void => {
  editor.ui.registry.addMenuItem('undo', {
    text: 'Undo',
    icon: 'undo',
    shortcut: 'Meta+Z',
    onSetup: onSetupUndoRedoState(editor, 'hasUndo'),
    onAction: onActionExecCommand(editor, 'undo')
  });

  editor.ui.registry.addMenuItem('redo', {
    text: 'Redo',
    icon: 'redo',
    shortcut: 'Meta+Y',
    onSetup: onSetupUndoRedoState(editor, 'hasRedo'),
    onAction: onActionExecCommand(editor, 'redo')
  });
};

// Note: The undo/redo buttons are disabled by default here, as they'll be rendered
// on init generally and it won't have any undo levels at that stage.
const registerButtons = (editor: Editor): void => {
  editor.ui.registry.addButton('undo', {
    tooltip: 'Undo',
    icon: 'undo',
    enabled: false,
    onSetup: onSetupUndoRedoState(editor, 'hasUndo'),
    onAction: onActionExecCommand(editor, 'undo')
  });

  editor.ui.registry.addButton('redo', {
    tooltip: 'Redo',
    icon: 'redo',
    enabled: false,
    onSetup: onSetupUndoRedoState(editor, 'hasRedo'),
    onAction: onActionExecCommand(editor, 'redo')
  });
};

const register = (editor: Editor): void => {
  registerMenuItems(editor);
  registerButtons(editor);
};

export {
  register
};
