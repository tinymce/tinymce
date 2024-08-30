import { Fun } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

const register = (editor: Editor): void => {
  editor.ui.registry.addContext('editable', (editor: Editor) => {
    console.log('check editable', editor.selection.isEditable());
    return editor.selection.isEditable() || editor.selection.getNode().className === 'special';
  });

  editor.ui.registry.addContext('mode', (editor: Editor, mode: string) => {
    return editor.mode.get() === mode;
  });

  editor.ui.registry.addContext('any', Fun.always);

  editor.ui.registry.addContext('formatting', (editor: Editor, format: string) => {
    return editor.formatter.canApply(format);
  });

  editor.ui.registry.addContext('insert', (editor: Editor, child: string) => {
    return editor.schema.isValidChild(editor.selection.getNode().tagName, child);
  });
};

export {
  register
};
