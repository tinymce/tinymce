/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const isCodeSampleSelection = (editor: Editor): boolean => {
  const node = editor.selection.getStart();
  return editor.dom.is(node, 'pre[class*="language-"]');
};

const register = (editor: Editor): void => {

  const onAction = () => editor.execCommand('codesample');

  editor.ui.registry.addToggleButton('codesample', {
    icon: 'code-sample',
    tooltip: 'Insert/edit code sample',
    onAction,
    onSetup: (api) => {
      const nodeChangeHandler = () => {
        api.setActive(isCodeSampleSelection(editor));
      };
      editor.on('NodeChange', nodeChangeHandler);
      return () => editor.off('NodeChange', nodeChangeHandler);
    }
  });

  editor.ui.registry.addMenuItem('codesample', {
    text: 'Code sample...',
    icon: 'code-sample',
    onAction
  });
};

export {
  register
};
