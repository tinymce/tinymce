/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const toggleActiveState = function (editor, enabledState) {
  return function (e) {
    const ctrl = e.control;

    ctrl.active(enabledState.get());

    editor.on('VisualBlocks', function (e) {
      ctrl.active(e.state);
    });
  };
};

const register = function (editor, enabledState) {
  editor.addButton('visualblocks', {
    active: false,
    title: 'Show blocks',
    cmd: 'mceVisualBlocks',
    onPostRender: toggleActiveState(editor, enabledState)
  });

  editor.addMenuItem('visualblocks', {
    text: 'Show blocks',
    cmd: 'mceVisualBlocks',
    onPostRender: toggleActiveState(editor, enabledState),
    selectable: true,
    context: 'view',
    prependToContext: true
  });
};

export default {
  register
};