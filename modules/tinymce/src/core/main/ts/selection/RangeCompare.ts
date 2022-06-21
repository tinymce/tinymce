import { RangeLikeObject } from './RangeTypes';

const isEq = (rng1: RangeLikeObject | undefined, rng2: RangeLikeObject | undefined) => {
  return rng1 && rng2 &&
    (rng1.startContainer === rng2.startContainer && rng1.startOffset === rng2.startOffset) &&
    (rng1.endContainer === rng2.endContainer && rng1.endOffset === rng2.endOffset);
};

export {
  isEq
};
