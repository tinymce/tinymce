/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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