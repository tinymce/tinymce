/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { Toolbar } from '@ephox/bridge';

const toggleOutdentState = (api: Toolbar.ToolbarButtonInstanceApi, editor: Editor) => {
  api.setDisabled(!editor.queryCommandState('outdent'));

  const onNodeChange = () => {
    api.setDisabled(!editor.queryCommandState('outdent'));
  };

  editor.on('NodeChange', onNodeChange);
  return () => editor.off('NodeChange', onNodeChange);
};

const registerButtons = (editor: Editor) => {
  editor.ui.registry.addButton('outdent', {
    tooltip: 'Decrease indent',
    icon: 'outdent',
    onSetup: (api) => toggleOutdentState(api, editor),
    onAction: () => editor.execCommand('outdent')
  });

  editor.ui.registry.addButton('indent', {
    tooltip: 'Increase indent',
    icon: 'indent',
    onAction: () => editor.execCommand('indent')
  });
};

const register = (editor: Editor) => {
  registerButtons(editor);
};

export {
  register
};
