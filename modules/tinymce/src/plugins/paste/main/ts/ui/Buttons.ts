/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { Menu, Toolbar } from 'tinymce/core/api/ui/Ui';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import { Clipboard } from '../api/Clipboard';

const makeSetupHandler = (editor: Editor, clipboard: Clipboard) => (api: Toolbar.ToolbarToggleButtonInstanceApi | Menu.ToggleMenuItemInstanceApi) => {
  api.setActive(clipboard.pasteFormat.get() === 'text');
  const pastePlainTextToggleHandler = (e: EditorEvent<{ state: boolean }>) => api.setActive(e.state);
  editor.on('PastePlainTextToggle', pastePlainTextToggleHandler);
  return () => editor.off('PastePlainTextToggle', pastePlainTextToggleHandler);
};

const register = (editor: Editor, clipboard: Clipboard): void => {
  const onAction = () => editor.execCommand('mceTogglePlainTextPaste');

  editor.ui.registry.addToggleButton('pastetext', {
    active: false,
    icon: 'paste-text',
    tooltip: 'Paste as text',
    onAction,
    onSetup: makeSetupHandler(editor, clipboard)
  });

  editor.ui.registry.addToggleMenuItem('pastetext', {
    text: 'Paste as text',
    icon: 'paste-text',
    onAction,
    onSetup: makeSetupHandler(editor, clipboard)
  });
};

export {
  register
};
