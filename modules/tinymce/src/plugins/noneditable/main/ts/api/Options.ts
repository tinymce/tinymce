/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K] | undefined;
  <T>(name: string): (editor: Editor) => T | undefined;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const isRegExp = (x: unknown): x is RegExp => Type.is(x, RegExp);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  registerOption('noneditable_noneditable_class', {
    processor: 'string',
    default: 'mceNonEditable'
  });

  registerOption('noneditable_editable_class', {
    processor: 'string',
    default: 'mceEditable'
  });

  registerOption('noneditable_regexp', {
    processor: (value) => {
      if (Type.isArrayOf(value, isRegExp)) {
        return { value, valid: true };
      } else if (isRegExp(value)) {
        return { value: [ value ], valid: true };
      } else {
        return { valid: false, message: 'Must be a RegExp or an array of RegExp.' };
      }
    },
    default: []
  });
};

const getNonEditableClass = option<string>('noneditable_noneditable_class');
const getEditableClass = option<string>('noneditable_editable_class');
const getNonEditableRegExps = option<RegExp[]>('noneditable_regexp');

export {
  register,
  getNonEditableClass,
  getEditableClass,
  getNonEditableRegExps
};
