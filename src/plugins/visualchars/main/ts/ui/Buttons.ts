/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const toggleActiveState = (editor) => (api) => {
  api.setActive(false);
  const editorEventCallback = (e) => api.setActive(e.state);
  editor.on('VisualChars', editorEventCallback);
  return () => editor.off('VisualChars', editorEventCallback);
};

const register = function (editor) {
  editor.ui.registry.addToggleButton('visualchars', {
    tooltip: 'Show invisible characters',
    icon: 'paragraph',
    onAction: () => editor.execCommand('mceVisualChars'),
    onSetup: toggleActiveState(editor)
  });

  editor.ui.registry.addToggleMenuItem('visualchars', {
    text: 'Show invisible characters',
    icon: 'paragraph',
    onAction: () => editor.execCommand('mceVisualChars'),
    onSetup: toggleActiveState(editor),
    selectable: true
  });
};

export {
  register
};