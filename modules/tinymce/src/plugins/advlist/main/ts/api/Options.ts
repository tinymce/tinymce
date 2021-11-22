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

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  const stringListProcessor = (value: unknown) => {
    const valid = Type.isString(value);
    if (valid) {
      return { value: value.split(/[ ,]/), valid };
    } else {
      return { valid: false as const, message: 'Must be a string.' };
    }
  };

  registerOption('advlist_number_styles', {
    processor: stringListProcessor,
    default: 'default,lower-alpha,lower-greek,lower-roman,upper-alpha,upper-roman'
  });

  registerOption('advlist_bullet_styles', {
    processor: stringListProcessor,
    default: 'default,circle,square'
  });
};

const getNumberStyles = option<string[]>('advlist_number_styles');
const getBulletStyles = option<string[]>('advlist_bullet_styles');

export {
  register,
  getNumberStyles,
  getBulletStyles
};
