/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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