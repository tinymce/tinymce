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

  registerOption('toc_class', {
    processor: 'string',
    default: 'mce-toc'
  });

  registerOption('toc_header', {
    processor: (value) => Type.isString(value) && /^h[1-6]$/.test(value),
    default: 'h2'
  });

  registerOption('toc_depth', {
    processor: (value) => Type.isNumber(value) && value >= 1 && value <= 9,
    default: 3
  });
};

const getTocClass = option<string>('toc_class');
const getTocHeader = option<string>('toc_header');
const getTocDepth = option<number>('toc_depth');

export {
  register,
  getTocClass,
  getTocHeader,
  getTocDepth
};
