/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Results, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

import { PatternSet } from '../core/PatternTypes';
import { createPatternSet, normalizePattern } from './Pattern';

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K] | undefined;
  <T>(name: string): (editor: Editor) => T | undefined;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  registerOption('textpattern_patterns', {
    processor: (value) => {
      if (Type.isArrayOf(value, Type.isObject)) {
        const normalized = Results.partition(Arr.map(value, normalizePattern));
        // eslint-disable-next-line no-console
        Arr.each(normalized.errors, (err) => console.error(err.message, err.pattern));
        return { value: createPatternSet(normalized.values), valid: true };
      } else {
        return { valid: false, message: 'Must be an array of objects.' };
      }
    },
    default: [
      { start: '*', end: '*', format: 'italic' },
      { start: '**', end: '**', format: 'bold' },
      { start: '#', format: 'h1' },
      { start: '##', format: 'h2' },
      { start: '###', format: 'h3' },
      { start: '####', format: 'h4' },
      { start: '#####', format: 'h5' },
      { start: '######', format: 'h6' },
      { start: '1. ', cmd: 'InsertOrderedList' },
      { start: '* ', cmd: 'InsertUnorderedList' },
      { start: '- ', cmd: 'InsertUnorderedList' }
    ]
  });
};

const getPatternSet = option<PatternSet>('textpattern_patterns');
const getForcedRootBlock = option('forced_root_block');

export {
  register,
  getForcedRootBlock,
  getPatternSet
};
