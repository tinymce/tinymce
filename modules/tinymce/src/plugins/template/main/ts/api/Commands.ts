import { Fun } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Templates from '../core/Templates';
import { ExternalTemplate } from '../core/Types';
import * as Dialog from '../ui/Dialog';

const showDialog = (editor: Editor) => (templates: ExternalTemplate[]): void => {
  Dialog.open(editor, templates);
};

const register = (editor: Editor): void => {
  editor.addCommand('mceInsertTemplate', Fun.curry(Templates.insertTemplate, editor));
  editor.addCommand('mceTemplate', Templates.createTemplateList(editor, showDialog(editor)));
};

export {
  register
};
