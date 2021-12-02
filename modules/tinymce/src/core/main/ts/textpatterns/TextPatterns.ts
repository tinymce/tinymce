/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Cell, Results } from '@ephox/katamari';

import Editor from '../api/Editor';
import { getTextPatterns } from '../api/Options';

import { createPatternSet, normalizePattern } from './core/Pattern';
import { PatternSet, RawPattern } from './core/PatternTypes';
import * as Keyboard from './keyboard/Keyboard';

const generatePatternSet = (patterns: RawPattern[]): PatternSet => {
  const normalized = Results.partition(Arr.map(patterns, normalizePattern));
  // eslint-disable-next-line no-console
  Arr.each(normalized.errors, (err) => console.error(err.message, err.pattern));
  return createPatternSet(normalized.values);
};

const setup = (editor: Editor): void => {
  const patterns = getTextPatterns(editor);

  if (patterns !== false) {
    const patternSet = generatePatternSet(patterns);
    Keyboard.setup(editor, Cell(patternSet));
  }
};

export {
  setup,
  generatePatternSet
};