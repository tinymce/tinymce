/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import * as Storage from '../core/Storage';
import { Editor } from 'tinymce/core/api/Editor';
import { Cell } from '@ephox/katamari';

const postRender = (editor: Editor, started: Cell<boolean>) => {
  return (e) => {
    const ctrl = e.control;

    ctrl.disabled(!Storage.hasDraft(editor));

    editor.on('StoreDraft RestoreDraft RemoveDraft', () => {
      ctrl.disabled(!Storage.hasDraft(editor));
    });

    // TODO: Investigate why this is only done on postrender that would
    // make the feature broken if only the menu item was rendered since
    // it is rendered when the menu appears
    Storage.startStoreDraft(editor, started);
  };
};

const register = (editor: Editor, started: Cell<boolean>) => {
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

export {
  register
};