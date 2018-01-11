/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const toggleActiveState = function (editor) {
  return function (e) {
    const ctrl = e.control;

    editor.on('VisualChars', function (e) {
      ctrl.active(e.state);
    });
  };
};

const register = function (editor) {
  editor.addButton('visualchars', {
    active: false,
    title: 'Show invisible characters',
    cmd: 'mceVisualChars',
    onPostRender: toggleActiveState(editor)
  });

  editor.addMenuItem('visualchars', {
    text: 'Show invisible characters',
    cmd: 'mceVisualChars',
    onPostRender: toggleActiveState(editor),
    selectable: true,
    context: 'view',
    prependToContext: true
  });
};

export {
  register
};