/**
 * Api.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Cell } from '@ephox/katamari';
import { PatternSet, createPatternSet, Pattern } from './Pattern';

const get = (patternsState: Cell<PatternSet>) => {
  const setPatterns = (newPatterns: Pattern[]) => {
    patternsState.set(createPatternSet(newPatterns));
  };

  const getPatterns = () => {
    return [
      ...patternsState.get().inlinePatterns,
      ...patternsState.get().blockPatterns,
      ...patternsState.get().replacementPatterns
    ];
  };

  return {
    setPatterns,
    getPatterns
  };
};

export default {
  get
};