import Editor from 'tinymce/core/api/Editor';

import * as Delete from '../core/Delete';

export interface Api {
  readonly backspaceDelete: (isForward: boolean) => void;
}

const get = (editor: Editor): Api => ({
  backspaceDelete: (isForward: boolean) => {
    Delete.backspaceDelete(editor, isForward);
  }
});

export {
  get
};
