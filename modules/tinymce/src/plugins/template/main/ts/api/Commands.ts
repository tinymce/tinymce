/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Templates from '../core/Templates';
import * as Dialog from '../ui/Dialog';

const showDialog = (editor: Editor) => {
  return (templates) => {
    Dialog.open(editor, templates);
  };
};

const register = (editor) => {
  editor.addCommand('mceInsertTemplate', Fun.curry(Templates.insertTemplate, editor));
  editor.addCommand('mceTemplate', Templates.createTemplateList(editor, showDialog(editor)));
};

export {
  register
};
