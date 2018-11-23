/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const postRender = function (editor) {
  return function (e) {
    const ctrl = e.control;

    editor.on('FullscreenStateChanged', function (e) {
      ctrl.active(e.state);
    });
  };
};

const register = function (editor) {
  editor.addMenuItem('fullscreen', {
    text: 'Fullscreen',
    shortcut: 'Ctrl+Shift+F',
    selectable: true,
    cmd: 'mceFullScreen',
    onPostRender: postRender(editor),
    context: 'view'
  });

  editor.addButton('fullscreen', {
    active: false,
    tooltip: 'Fullscreen',
    cmd: 'mceFullScreen',
    onPostRender: postRender(editor)
  });
};

export default {
  register
};