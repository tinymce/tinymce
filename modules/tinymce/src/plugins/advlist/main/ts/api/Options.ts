import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K];
  <T>(name: string): (editor: Editor) => T;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  registerOption('advlist_number_styles', {
    processor: 'string[]',
    default: 'default,lower-alpha,lower-greek,lower-roman,upper-alpha,upper-roman'.split(',')
  });

  registerOption('advlist_bullet_styles', {
    processor: 'string[]',
    default: 'default,circle,square'.split(',')
  });
};

const getNumberStyles = option<string[]>('advlist_number_styles');
const getBulletStyles = option<string[]>('advlist_bullet_styles');

export {
  register,
  getNumberStyles,
  getBulletStyles
};
