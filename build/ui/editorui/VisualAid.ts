/**
 * VisualAid.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const toggleVisualAidState = function (editor) {
  return function () {
    const self = this;

    editor.on('VisualAid', function (e) {
      self.active(e.hasVisual);
    });

    self.active(editor.hasVisual);
  };
};

const registerMenuItems = function (editor) {
  editor.addMenuItem('visualaid', {
    text: 'Visual aids',
    selectable: true,
    onPostRender: toggleVisualAidState(editor),
    cmd: 'mceToggleVisualAid'
  });
};

const register = function (editor) {
  registerMenuItems(editor);
};

export default {
  register
};