import { Arr, Struct } from '@ephox/katamari';

const indexInfo = Struct.immutableBag([ 'index', 'candidates' ], [ ]);

const locate = function (candidates, predicate) {
  return Arr.findIndex(candidates, predicate).map(function (index) {
    return indexInfo({
      index,
      candidates
    });
  });
};

export {
  locate
};