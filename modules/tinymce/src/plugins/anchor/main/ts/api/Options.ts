import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K];
  <T>(name: string): (editor: Editor) => T;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  registerOption('allow_html_in_named_anchor', {
    processor: 'boolean',
    default: false
  });
};

const allowHtmlInNamedAnchor = option<boolean>('allow_html_in_named_anchor');

export {
  register,
  allowHtmlInNamedAnchor
};
