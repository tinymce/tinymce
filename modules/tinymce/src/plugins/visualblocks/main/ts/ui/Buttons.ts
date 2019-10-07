/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';

const toggleActiveState = (editor: Editor, enabledState: Cell<boolean>) => (api) => {
  api.setActive(enabledState.get());
  const editorEventCallback = (e) => api.setActive(e.state);
  editor.on('VisualBlocks', editorEventCallback);
  return () => editor.off('VisualBlocks', editorEventCallback);
};

const register = (editor: Editor, enabledState: Cell<boolean>) => {
  editor.ui.registry.addToggleButton('visualblocks', {
    icon: 'visualblocks',
    tooltip: 'Show blocks',
    onAction: () => editor.execCommand('mceVisualBlocks'),
    onSetup: toggleActiveState(editor, enabledState)
  });

  editor.ui.registry.addToggleMenuItem('visualblocks', {
    text: 'Show blocks',
    onAction: () => editor.execCommand('mceVisualBlocks'),
    onSetup: toggleActiveState(editor, enabledState)
  });
};

export default {
  register
};