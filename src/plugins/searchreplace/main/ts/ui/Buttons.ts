/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Dialog from './Dialog';
import { Editor } from 'tinymce/core/api/Editor';

const showDialog = function (editor: Editor, currentIndexState) {
  return function () {
    Dialog.open(editor, currentIndexState);
  };
};

const register = function (editor: Editor, currentIndexState) {
  editor.ui.registry.addMenuItem('searchreplace', {
    text: 'Find and replace...',
    shortcut: 'Meta+F',
    onAction: showDialog(editor, currentIndexState),
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