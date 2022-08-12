import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K];
  <T>(name: string): (editor: Editor) => T;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  registerOption('visualchars_default_state', {
    processor: 'boolean',
    default: false
  });
};

const isEnabledByDefault = option<boolean>('visualchars_default_state');

export {
  register,
  isEnabledByDefault
};
