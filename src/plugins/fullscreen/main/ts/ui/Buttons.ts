/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const makeSetupHandler = (editor) => (api) => {
  api.setActive(false);
  const editorEventCallback = (e) => api.setActive(e.state);
  editor.on('FullscreenStateChanged', editorEventCallback);
  return () => editor.off('FullscreenStateChanged', editorEventCallback);
};

const register = function (editor) {
  editor.ui.registry.addToggleMenuItem('fullscreen', {
    text: 'Fullscreen',
    shortcut: 'Ctrl+Shift+F',
    selectable: true,
    onAction: () => editor.execCommand('mceFullScreen'),
    onSetup: makeSetupHandler(editor)
  });

  editor.ui.registry.addToggleButton('fullscreen', {
    tooltip: 'Fullscreen',
    icon: 'fullscreen',
    onAction: () => editor.execCommand('mceFullScreen'),
    onSetup: makeSetupHandler(editor)
  });
};

export default {
  register
};