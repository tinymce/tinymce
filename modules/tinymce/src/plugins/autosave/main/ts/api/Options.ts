import { Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

import * as Time from '../core/Time';

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K];
  <T>(name: string): (editor: Editor) => T;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  const timeProcessor = (value: unknown) => {
    const valid = Type.isString(value);
    if (valid) {
      return { value: Time.parse(value), valid };
    } else {
      return { valid: false as const, message: 'Must be a string.' };
    }
  };

  registerOption('autosave_ask_before_unload', {
    processor: 'boolean',
    default: true
  });

  registerOption('autosave_prefix', {
    processor: 'string',
    default: 'tinymce-autosave-{path}{query}{hash}-{id}-'
  });

  registerOption('autosave_restore_when_empty', {
    processor: 'boolean',
    default: false
  });

  registerOption('autosave_interval', {
    processor: timeProcessor,
    default: '30s'
  });

  registerOption('autosave_retention', {
    processor: timeProcessor,
    default: '20m'
  });
};

const shouldAskBeforeUnload = option<boolean>('autosave_ask_before_unload');
const shouldRestoreWhenEmpty = option<boolean>('autosave_restore_when_empty');
const getAutoSaveInterval = option<number>('autosave_interval');
const getAutoSaveRetention = option<number>('autosave_retention');

const getAutoSavePrefix = (editor: Editor): string => {
  const location = document.location;
  return editor.options.get('autosave_prefix').replace(/{path}/g, location.pathname)
    .replace(/{query}/g, location.search)
    .replace(/{hash}/g, location.hash)
    .replace(/{id}/g, editor.id);
};

export {
  register,
  shouldAskBeforeUnload,
  getAutoSavePrefix,
  shouldRestoreWhenEmpty,
  getAutoSaveInterval,
  getAutoSaveRetention
};
