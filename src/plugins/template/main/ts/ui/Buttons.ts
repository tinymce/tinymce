/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
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