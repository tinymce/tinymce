import { Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K] | undefined;
  <T>(name: string): (editor: Editor) => T | undefined;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  const toolbarProcessor = (defaultValue: string) => (value: unknown) => {
    const valid = Type.isBoolean(value) || Type.isString(value);
    if (valid) {
      if (Type.isBoolean(value)) {
        return { value: value ? defaultValue : '', valid };
      } else {
        return { value: value.trim(), valid };
      }
    } else {
      return { valid: false as const, message: 'Must be a boolean or string.' };
    }
  };

  const defaultSelectionToolbar = 'bold italic | quicklink h2 h3 blockquote';
  registerOption('quickbars_selection_toolbar', {
    processor: toolbarProcessor(defaultSelectionToolbar),
    default: defaultSelectionToolbar
  });

  const defaultInsertToolbar = 'quickimage quicktable';
  registerOption('quickbars_insert_toolbar', {
    processor: toolbarProcessor(defaultInsertToolbar),
    default: defaultInsertToolbar
  });

  const defaultImageToolbar = 'alignleft aligncenter alignright';
  registerOption('quickbars_image_toolbar', {
    processor: toolbarProcessor(defaultImageToolbar),
    default: defaultImageToolbar
  });
};

const getTextSelectionToolbarItems = option<string>('quickbars_selection_toolbar');
const getInsertToolbarItems = option<string>('quickbars_insert_toolbar');
const getImageToolbarItems = option<string>('quickbars_image_toolbar');

export {
  register,
  getTextSelectionToolbarItems,
  getInsertToolbarItems,
  getImageToolbarItems
};
