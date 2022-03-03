import Editor from 'tinymce/core/api/Editor';

import { ImageData } from '../core/ImageData';
import { insertOrUpdateImage } from '../core/ImageSelection';
import { Dialog } from '../ui/Dialog';

const register = (editor: Editor): void => {
  editor.addCommand('mceImage', Dialog(editor).open);

  // TODO: This command is likely to be short lived we only need it until we expose the rtc model though a new api so it shouldn't be documented
  // it's just a command since that is a convenient method for the rtc plugin to override the default dom mutation behaviour
  editor.addCommand('mceUpdateImage', (_ui, data: Partial<ImageData>) => {
    editor.undoManager.transact(() => insertOrUpdateImage(editor, data));
  });
};

export {
  register
};
