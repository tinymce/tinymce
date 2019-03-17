/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { Menu } from '@ephox/bridge';

const toggleVisualAidState = (api: Menu.ToggleMenuItemInstanceApi, editor: Editor) => {
  api.setActive(editor.hasVisual);

  const onVisualAid = (e) => {
    api.setActive(e.hasVisual);
  };
  editor.on('VisualAid', onVisualAid);
  return () => editor.off('VisualAid', onVisualAid);
};

const registerMenuItems = (editor: Editor) => {
  editor.ui.registry.addToggleMenuItem('visualaid', {
    text: 'Visual aids',
    onSetup: (api) => toggleVisualAidState(api, editor),
    onAction: () => {
      editor.execCommand('mceToggleVisualAid');
    }
  });
};

const registerToolbarButton = (editor: Editor) => {
  editor.ui.registry.addButton('visualaid', {
    tooltip: 'Visual aids',
    text: 'Visual aids',
    onAction: () => editor.execCommand('mceToggleVisualAid')
  });
};

const register = (editor: Editor) => {
  registerToolbarButton(editor);
  registerMenuItems(editor);
};

export default {
  register
};