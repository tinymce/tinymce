import Editor from 'tinymce/core/api/Editor';
import { Toolbar } from 'tinymce/core/api/ui/Ui';

import { onActionExecCommand, onSetupEvent } from './ControlUtils';

const onSetupOutdentState = (editor: Editor) =>
  onSetupEvent(editor, 'NodeChange', (api: Toolbar.ToolbarButtonInstanceApi) => {
    api.setEnabled(editor.queryCommandState('outdent'));
  });

const registerButtons = (editor: Editor): void => {
  editor.ui.registry.addButton('outdent', {
    tooltip: 'Decrease indent',
    icon: 'outdent',
    onSetup: onSetupOutdentState(editor),
    onAction: onActionExecCommand(editor, 'outdent')
  });

  editor.ui.registry.addButton('indent', {
    tooltip: 'Increase indent',
    icon: 'indent',
    onAction: onActionExecCommand(editor, 'indent')
  });
};

const register = (editor: Editor): void => {
  registerButtons(editor);
};

export {
  register
};
