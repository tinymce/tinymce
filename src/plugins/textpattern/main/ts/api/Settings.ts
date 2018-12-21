/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { createPatternSet, PatternSet, normalizePattern } from './Pattern';
import { Obj, Type, Results, Arr } from '@ephox/katamari';
import ErrorReporter from 'tinymce/core/ErrorReporter';

const defaultPatterns = [
  { start: '*', end: '*', format: 'italic' },
  { start: '**', end: '**', format: 'bold' },
  { start: '***', end: '***', format: ['bold', 'italic'] },
  { start: '#', format: 'h1' },
  { start: '##', format: 'h2' },
  { start: '###', format: 'h3' },
  { start: '####', format: 'h4' },
  { start: '#####', format: 'h5' },
  { start: '######', format: 'h6' },
  { start: '1. ', cmd: 'InsertOrderedList' },
  { start: '* ', cmd: 'InsertUnorderedList' },
  { start: '- ', cmd: 'InsertUnorderedList' }
];

const getPatternSet = (editorSettings): PatternSet => {
  const patterns = Obj.get(editorSettings, 'textpattern_patterns').getOr(defaultPatterns);
  if (!Type.isArray(patterns)) {
    ErrorReporter.initError('The setting textpattern_patterns should be an array');
    return {
      inlinePatterns: [],
      blockPatterns: [],
    };
  }
  const normalized = Results.partition(Arr.map(patterns, normalizePattern));
  Arr.each(normalized.errors, (err) => {
    ErrorReporter.initError(err.message, err.pattern);
  });
  return createPatternSet(normalized.values);
};

export {
  getPatternSet,
};