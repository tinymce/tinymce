/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';

const makeSetupHandler = (editor: Editor, fullscreenState: Cell<object>) => (api) => {
  api.setActive(fullscreenState.get() !== null);
  const editorEventCallback = (e) => api.setActive(e.state);
  editor.on('FullscreenStateChanged', editorEventCallback);
  return () => editor.off('FullscreenStateChanged', editorEventCallback);
};

const register = (editor: Editor, fullscreenState: Cell<object>) => {
  editor.ui.registry.addToggleMenuItem('fullscreen', {
    text: 'Fullscreen',
    shortcut: 'Meta+Shift+F',
    onAction: () => editor.execCommand('mceFullScreen'),
    onSetup: makeSetupHandler(editor, fullscreenState)
  });

  editor.ui.registry.addToggleButton('fullscreen', {
    tooltip: 'Fullscreen',
    icon: 'fullscreen',
    onAction: () => editor.execCommand('mceFullScreen'),
    onSetup: makeSetupHandler(editor, fullscreenState)
  });
};

export default {
  register
};