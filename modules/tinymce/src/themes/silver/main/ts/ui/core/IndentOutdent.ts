/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { Toolbar } from 'tinymce/core/api/ui/Ui';

import { onActionExecCommand, onSetupEvent } from './ControlUtils';

const onSetupOutdentState = (editor: Editor) =>
  onSetupEvent(editor, 'NodeChange', (api: Toolbar.ToolbarButtonInstanceApi) => {
    api.setDisabled(!editor.queryCommandState('outdent'));
  });

const registerButtons = (editor: Editor) => {
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

const register = (editor: Editor) => {
  registerButtons(editor);
};

export {
  register
};
