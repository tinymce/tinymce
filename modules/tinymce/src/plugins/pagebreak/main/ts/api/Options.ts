import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K];
  <T>(name: string): (editor: Editor) => T;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  registerOption('pagebreak_separator', {
    processor: 'string',
    default: '<!-- pagebreak -->'
  });

  registerOption('pagebreak_split_block', {
    processor: 'boolean',
    default: false
  });
};

const getSeparatorHtml = option<string>('pagebreak_separator');
const shouldSplitBlock = option<boolean>('pagebreak_split_block');

export {
  register,
  getSeparatorHtml,
  shouldSplitBlock
};
