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
  editor.ui.registry.addButton('template', {
    type: 'button',
    icon: 'template',
    tooltip: 'Insert template',
    onAction: Templates.createTemplateList(editor.settings, showDialog(editor))
  });

  editor.ui.registry.addMenuItem('template', {
    icon: 'template',
    text: 'Insert template...',
    onAction: Templates.createTemplateList(editor.settings, showDialog(editor)),
  });
};

export default {
  register
};