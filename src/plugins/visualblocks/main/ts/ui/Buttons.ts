/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const toggleActiveState = (editor, enabledState) => (api) => {
  api.setActive(false);
  const editorEventCallback = (e) => api.setActive(e.state);
  editor.on('VisualBlocks', editorEventCallback);
  return () => editor.off('VisualBlocks', editorEventCallback);
};

const register = function (editor, enabledState) {
  editor.ui.registry.addToggleButton('visualblocks', {
    icon: 'paragraph',
    tooltip: 'Show blocks',
    onAction: () => editor.execCommand('mceVisualBlocks'),
    onSetup: toggleActiveState(editor, enabledState)
  });

  editor.ui.registry.addToggleMenuItem('visualblocks', {
    text: 'Show blocks',
    icon: 'paragraph',
    onAction: () => editor.execCommand('mceVisualBlocks'),
    onSetup: toggleActiveState(editor, enabledState),
    selectable: true
  });
};

export default {
  register
};