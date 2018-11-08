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

const toggleActiveState = (editor: Editor, enabledStated: Cell<boolean>) => (api) => {
  api.setActive(enabledStated.get());
  const editorEventCallback = (e) => api.setActive(e.state);
  editor.on('VisualChars', editorEventCallback);
  return () => editor.off('VisualChars', editorEventCallback);
};

const register = (editor: Editor, toggleState: Cell<boolean>) => {
  editor.ui.registry.addToggleButton('visualchars', {
    tooltip: 'Show invisible characters',
    icon: 'paragraph',
    onAction: () => editor.execCommand('mceVisualChars'),
    onSetup: toggleActiveState(editor, toggleState)
  });

  editor.ui.registry.addToggleMenuItem('visualchars', {
    text: 'Show invisible characters',
    onAction: () => editor.execCommand('mceVisualChars'),
    onSetup: toggleActiveState(editor, toggleState)
  });
};

export {
  register
};