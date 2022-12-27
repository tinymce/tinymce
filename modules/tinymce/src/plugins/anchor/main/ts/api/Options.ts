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

  registerOption('anchor_name_placeholder', {
    processor: 'string',
    default: 'example'
  });

  registerOption('anchor_invalid_message', {
    processor: 'string',
    default: 'ID should start with a letter, followed only by letters, numbers, dashes, dots, colons or underscores.'
  });
};

const allowHtmlInNamedAnchor = option<boolean>('allow_html_in_named_anchor');
const anchorNamePlaceholder = option<string>('anchor_name_placeholder');
const anchorInvalidMessage = option<string>('anchor_invalid_message');

export {
  register,
  allowHtmlInNamedAnchor,
  anchorNamePlaceholder,
  anchorInvalidMessage
};
