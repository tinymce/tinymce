import Editor from 'tinymce/core/api/Editor';

export interface Api {
  readonly backspaceDelete: (isForward: boolean) => void;
}

const get = (editor: Editor): Api => ({
  backspaceDelete: (isForward: boolean) => {
    editor.execCommand('mceListBackspaceDelete', false, isForward);
  }
});

export {
  get
};
