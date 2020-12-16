/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { RangeLikeObject } from './RangeTypes';

const isEq = (rng1: RangeLikeObject, rng2: RangeLikeObject) => {
  return rng1 && rng2 &&
    (rng1.startContainer === rng2.startContainer && rng1.startOffset === rng2.startOffset) &&
    (rng1.endContainer === rng2.endContainer && rng1.endOffset === rng2.endOffset);
};

export {
  isEq
};
