import type Editor from 'tinymce/core/api/Editor';
import type { EditorOptions } from 'tinymce/core/api/OptionTypes';

const option = <K extends keyof EditorOptions>(name: K) => (editor: Editor) =>
  editor.options.get(name);

const isDisabled = option('disabled');

export {
  isDisabled
};
