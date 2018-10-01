/**
 * VisualAid.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const toggleVisualAidState = (api, editor) => {
  api.setActive(editor.hasVisual);

  const onVisualAid = (e) => {
    api.setActive(e.hasVisual);
  };
  editor.on('VisualAid', onVisualAid);
  return () => editor.off('VisualAid', onVisualAid);
};

const registerMenuItems = (editor) => {
  editor.ui.registry.addToggleMenuItem('visualaid', {
    text: 'Visual aids',
    onSetup: (api) => toggleVisualAidState(api, editor),
    onAction: () => {
      editor.execCommand('mceToggleVisualAid');
    }
  });
};

const registerToolbarButton = (editor) => {
  editor.ui.registry.addButton('visualaid', {
    tooltip: 'Visual aids',
    text: 'Visual aids',
    onAction: () => editor.execCommand('mceToggleVisualAid')
  });
};

const register = (editor) => {
  registerToolbarButton(editor);
  registerMenuItems(editor);
};

export default {
  register
};