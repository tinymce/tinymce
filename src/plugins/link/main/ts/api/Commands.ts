/**
 * Commands.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Actions from '../core/Actions';
import Settings from './Settings';

const register = function (editor) {
  editor.addCommand('mceLink', () => {
    if (Settings.useQuickLink(editor.settings)) {
      // Taken from ContextEditorEvents in silver. Find a better way.
      editor.fire('contexttoolbar-show', {
        toolbarKey: 'link-form'
      });
    } else {
      Actions.openDialog(editor)();
    }
  });
};

export default {
  register
};