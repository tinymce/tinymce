import Editor from 'tinymce/core/api/Editor';
import { Menu } from 'tinymce/core/api/ui/Ui';

import { onActionExecCommand, onSetupEvent } from './ControlUtils';

const onSetupVisualAidState = (editor: Editor) =>
  onSetupEvent(editor, 'VisualAid', (api: Menu.ToggleMenuItemInstanceApi) => {
    api.setActive(editor.hasVisual);
  });

const registerMenuItems = (editor: Editor): void => {
  editor.ui.registry.addToggleMenuItem('visualaid', {
    text: 'Visual aids',
    onSetup: onSetupVisualAidState(editor),
    onAction: onActionExecCommand(editor, 'mceToggleVisualAid')
  });
};

const registerToolbarButton = (editor: Editor): void => {
  editor.ui.registry.addButton('visualaid', {
    tooltip: 'Visual aids',
    text: 'Visual aids',
    onAction: onActionExecCommand(editor, 'mceToggleVisualAid')
  });
};

const register = (editor: Editor): void => {
  registerToolbarButton(editor);
  registerMenuItems(editor);
};

export {
  register
};
