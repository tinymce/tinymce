/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Dialog from './Dialog';

const showDialog = function (editor, currentIndexState) {
  return function () {
    Dialog.open(editor, currentIndexState);
  };
};

const register = function (editor, currentIndexState) {
  editor.addMenuItem('searchreplace', {
    text: 'Find and replace',
    shortcut: 'Meta+F',
    onclick: showDialog(editor, currentIndexState),
    separator: 'before',
    context: 'edit'
  });

  editor.addButton('searchreplace', {
    tooltip: 'Find and replace',
    onclick: showDialog(editor, currentIndexState)
  });

  editor.shortcuts.add('Meta+F', '', showDialog(editor, currentIndexState));
};

export default {
  register
};