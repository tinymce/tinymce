import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K];
  <T>(name: string): (editor: Editor) => T;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  registerOption('autoresize_overflow_padding', {
    processor: 'number',
    default: 1
  });

  registerOption('autoresize_bottom_margin', {
    processor: 'number',
    default: 50
  });
};

const getMinHeight = option('min_height');
const getMaxHeight = option('max_height');
const getAutoResizeOverflowPadding = option<number>('autoresize_overflow_padding');
const getAutoResizeBottomMargin = option<number>('autoresize_bottom_margin');

export {
  register,
  getMinHeight,
  getMaxHeight,
  getAutoResizeOverflowPadding,
  getAutoResizeBottomMargin
};
