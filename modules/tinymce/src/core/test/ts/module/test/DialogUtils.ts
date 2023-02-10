import { Dialog } from '@ephox/bridge';

import Editor from 'tinymce/core/api/Editor';
import { WindowParams } from 'tinymce/core/api/WindowManager';

const open = <T extends Dialog.DialogData>(editor: Editor, spec: Dialog.DialogSpec<T>, params: WindowParams): Dialog.DialogInstanceApi<T> =>
  editor.windowManager.open(spec, params);

export {
  open
};
