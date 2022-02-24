import { Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

type UserChar = [ number, string ];

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K] | undefined;
  <T>(name: string): (editor: Editor) => T | undefined;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  const charMapProcessor = (value: unknown) =>
    Type.isFunction(value) || Type.isArray(value);

  registerOption('charmap', {
    processor: charMapProcessor,
  });

  registerOption('charmap_append', {
    processor: charMapProcessor
  });
};

const getCharMap = option<UserChar[] | (() => UserChar[])>('charmap');
const getCharMapAppend = option<UserChar[] | (() => UserChar[])>('charmap_append');

export {
  register,
  getCharMap,
  getCharMapAppend
};
