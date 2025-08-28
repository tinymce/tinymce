import { Type } from '@ephox/katamari';

import { RangeLikeObject } from './RangeTypes';

const isEq = (rng1: RangeLikeObject | undefined, rng2: RangeLikeObject | undefined): boolean => {
  return Type.isNonNullable(rng1) && Type.isNonNullable(rng2) &&
    (rng1.startContainer === rng2.startContainer && rng1.startOffset === rng2.startOffset) &&
    (rng1.endContainer === rng2.endContainer && rng1.endOffset === rng2.endOffset);
};

export {
  isEq
};
