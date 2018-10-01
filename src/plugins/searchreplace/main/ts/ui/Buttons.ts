/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Dialog from './Dialog';

const showDialog = function (editor, currentIndexState) {
  return function () {
    Dialog.open(editor, currentIndexState);
  };
};

const register = function (editor, currentIndexState) {
  editor.ui.registry.addMenuItem('searchreplace', {
    text: 'Find and replace',
    shortcut: 'Meta+F',
    onAction: showDialog(editor, currentIndexState),
    separator: 'before',
    icon: 'search'
  });

  editor.ui.registry.addButton('searchreplace', {
    tooltip: 'Find and replace',
    onAction: showDialog(editor, currentIndexState),
    icon: 'search'
  });

  editor.shortcuts.add('Meta+F', '', showDialog(editor, currentIndexState));
};

export default {
  register
};