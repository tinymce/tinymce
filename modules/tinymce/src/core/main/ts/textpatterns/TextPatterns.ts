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
import { PatternSet } from './core/PatternTypes';
import * as Keyboard from './keyboard/Keyboard';

const getPatternSet = (editor: Editor): PatternSet | false => {
  const value = getTextPatterns(editor);
  if (value === false) {
    return false;
  } else {
    const normalized = Results.partition(Arr.map(value, normalizePattern));
    // eslint-disable-next-line no-console
    Arr.each(normalized.errors, (err) => console.error(err.message, err.pattern));
    return createPatternSet(normalized.values);
  }
};

const setup = (editor) => {
  const patternSet = getPatternSet(editor);

  if (patternSet !== false) {
    Keyboard.setup(editor, Cell(patternSet));
  }
};

export {
  setup
};