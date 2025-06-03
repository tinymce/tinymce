import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

import { LanguageSpec } from '../core/Languages';

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K];
  <T>(name: string): (editor: Editor) => T;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  registerOption('codesample_languages', {
    processor: 'object[]'
  });

  registerOption('codesample_global_prismjs', {
    processor: 'boolean',
    default: false
  });
};

const getLanguages = option<LanguageSpec[] | undefined>('codesample_languages');
const useGlobalPrismJS = option<boolean>('codesample_global_prismjs');

export {
  register,
  getLanguages,
  useGlobalPrismJS
};
