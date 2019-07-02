import { Arr, Struct } from '@ephox/katamari';

const indexInfo = Struct.immutableBag([ 'index', 'candidates' ], [ ]);

const locate = (candidates, predicate) => {
  return Arr.findIndex(candidates, predicate).map((index) => {
    return indexInfo({
      index,
      candidates
    });
  });
};

export {
  locate
};
