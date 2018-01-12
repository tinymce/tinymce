/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Storage from '../core/Storage';

const postRender = function (editor, started) {
  return function (e) {
    const ctrl = e.control;

    ctrl.disabled(!Storage.hasDraft(editor));

    editor.on('StoreDraft RestoreDraft RemoveDraft', function () {
      ctrl.disabled(!Storage.hasDraft(editor));
    });

    // TODO: Investigate why this is only done on postrender that would
    // make the feature broken if only the menu item was rendered since
    // it is rendered when the menu appears
    Storage.startStoreDraft(editor, started);
  };
};

const register = function (editor, started) {
  editor.addButton('restoredraft', {
    title: 'Restore last draft',
    onclick () {
      Storage.restoreLastDraft(editor);
    },
    onPostRender: postRender(editor, started)
  });

  editor.addMenuItem('restoredraft', {
    text: 'Restore last draft',
    onclick () {
      Storage.restoreLastDraft(editor);
    },
    onPostRender: postRender(editor, started),
    context: 'file'
  });
};

export default {
  register
};