/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const register = function (editor) {
  editor.ui.registry.addButton('fullpage', {
    // TODO: This should be title or text, with no icon?
    tooltip: 'Metadata and document properties',
    icon: 'new-document',
    onAction: () => {
      editor.execCommand('mceFullPageProperties');
    }
  });

  editor.ui.registry.addMenuItem('fullpage', {
    text: 'Metadata and document properties',
    icon: 'new-document',
    onAction: () => {
      editor.execCommand('mceFullPageProperties');
    }
  });
};

export default {
  register
};