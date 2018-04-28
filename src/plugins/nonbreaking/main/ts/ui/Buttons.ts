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
  editor.addButton('nonbreaking', {
    title: 'Nonbreaking space',
    cmd: 'mceNonBreaking'
  });

  editor.addMenuItem('nonbreaking', {
    icon: 'nonbreaking',
    text: 'Nonbreaking space',
    cmd: 'mceNonBreaking',
    context: 'insert'
  });
};

export default {
  register
};