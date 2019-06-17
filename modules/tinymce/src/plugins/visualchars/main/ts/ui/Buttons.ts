/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';

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