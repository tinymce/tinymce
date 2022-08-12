import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K];
  <T>(name: string): (editor: Editor) => T;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  registerOption('insertdatetime_dateformat', {
    processor: 'string',
    default: editor.translate('%Y-%m-%d')
  });

  registerOption('insertdatetime_timeformat', {
    processor: 'string',
    default: editor.translate('%H:%M:%S')
  });

  registerOption('insertdatetime_formats', {
    processor: 'string[]',
    default: [ '%H:%M:%S', '%Y-%m-%d', '%I:%M:%S %p', '%D' ]
  });

  registerOption('insertdatetime_element', {
    processor: 'boolean',
    default: false
  });
};

const getDateFormat = option<string>('insertdatetime_dateformat');
const getTimeFormat = option<string>('insertdatetime_timeformat');
const getFormats = option<string[]>('insertdatetime_formats');
const shouldInsertTimeElement = option<boolean>('insertdatetime_element');

const getDefaultDateTime = (editor: Editor): string => {
  const formats = getFormats(editor);
  return formats.length > 0 ? formats[0] : getTimeFormat(editor);
};

export {
  register,
  getDateFormat,
  getTimeFormat,
  getFormats,
  getDefaultDateTime,
  shouldInsertTimeElement
};
