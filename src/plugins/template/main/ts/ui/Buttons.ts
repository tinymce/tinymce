/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Templates from '../core/Templates';
import Dialog from './Dialog';

const showDialog = function (editor) {
  return function (templates) {
    Dialog.open(editor, templates);
  };
};

const register = function (editor) {
  editor.addButton('template', {
    title: 'Insert template',
    onclick: Templates.createTemplateList(editor.settings, showDialog(editor))
  });

  editor.addMenuItem('template', {
    text: 'Template',
    onclick: Templates.createTemplateList(editor.settings, showDialog(editor)),
    icon: 'template',
    context: 'insert'
  });
};

export default {
  register
};