/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Dialog from './Dialog';
import Editor from 'tinymce/core/api/Editor';

const isCodeSampleSelection = (editor) => {
  const node = editor.selection.getStart();
  return editor.dom.is(node, 'pre.language-markup');
};

const register = function (editor: Editor) {
  editor.ui.registry.addToggleButton('codesample', {
    icon: 'code-sample',
    tooltip: 'Insert/edit code sample',
    onAction: () => Dialog.open(editor),
    onSetup: (api) => {
      const nodeChangeHandler = () => {
        api.setActive(isCodeSampleSelection(editor));
      };
      editor.on('NodeChange', nodeChangeHandler);
      return () => editor.off('NodeChange', nodeChangeHandler);
    },
  });

  editor.ui.registry.addMenuItem('codesample', {
    text: 'Code sample...',
    icon: 'code-sample',
    onAction: () => Dialog.open(editor)
  });
};

export default {
  register
};