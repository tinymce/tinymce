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
  editor.addButton('anchor', {
    icon: 'anchor',
    tooltip: 'Anchor',
    cmd: 'mceAnchor',
    stateSelector: 'a:not([href])'
  });

  editor.addMenuItem('anchor', {
    icon: 'anchor',
    text: 'Anchor',
    context: 'insert',
    cmd: 'mceAnchor'
  });
};

export default {
  register
};