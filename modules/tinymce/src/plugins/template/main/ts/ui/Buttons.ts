/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import * as Templates from '../core/Templates';
import * as Dialog from './Dialog';

const showDialog = function (editor: Editor) {
  return function (templates) {
    Dialog.open(editor, templates);
  };
};

const register = function (editor: Editor) {
  editor.ui.registry.addButton('template', {
    icon: 'template',
    tooltip: 'Insert template',
    onAction: Templates.createTemplateList(editor, showDialog(editor))
  });

  editor.ui.registry.addMenuItem('template', {
    icon: 'template',
    text: 'Insert template...',
    onAction: Templates.createTemplateList(editor, showDialog(editor))
  });
};

export {
  register
};
