import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K];
  <T>(name: string): (editor: Editor) => T;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  registerOption('list_glyphs', {
    processor: 'object',
    // TODO: Add correct default emoji values
    default: {
      checkbox: '&#x2611;', // ☑
      cross: '&#x2716;', // ✖
      question: '&#x2753;', // ❓
    }
  });

};

const getListUrls = option<Record<string, string>>('list_glyphs');

export {
  register,
  getListUrls
};
