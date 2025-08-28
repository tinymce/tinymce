import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K];
  <T>(name: string): (editor: Editor) => T;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  registerOption('save_enablewhendirty', {
    processor: 'boolean',
    default: true
  });

  registerOption('save_onsavecallback', {
    processor: 'function'
  });

  registerOption('save_oncancelcallback', {
    processor: 'function'
  });
};

const enableWhenDirty = option<boolean>('save_enablewhendirty');
const getOnSaveCallback = option<((editor: Editor) => void) | undefined>('save_onsavecallback');
const getOnCancelCallback = option<((editor: Editor) => void) | undefined>('save_oncancelcallback');

export {
  register,
  enableWhenDirty,
  getOnSaveCallback,
  getOnCancelCallback
};
