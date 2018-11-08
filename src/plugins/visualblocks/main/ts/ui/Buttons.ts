/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Cell } from '@ephox/katamari';
import { Editor } from 'tinymce/core/api/Editor';

const toggleActiveState = (editor: Editor, enabledState: Cell<boolean>) => (api) => {
  api.setActive(enabledState.get());
  const editorEventCallback = (e) => api.setActive(e.state);
  editor.on('VisualBlocks', editorEventCallback);
  return () => editor.off('VisualBlocks', editorEventCallback);
};

const register = (editor: Editor, enabledState: Cell<boolean>) => {
  editor.ui.registry.addToggleButton('visualblocks', {
    icon: 'paragraph',
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