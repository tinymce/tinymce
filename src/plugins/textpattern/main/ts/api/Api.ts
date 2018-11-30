/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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