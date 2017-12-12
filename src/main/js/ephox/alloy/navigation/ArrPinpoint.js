import { Arr } from '@ephox/katamari';
import { Struct } from '@ephox/katamari';

var indexInfo = Struct.immutableBag([ 'index', 'candidates' ], [ ]);

var locate = function (candidates, predicate) {
  return Arr.findIndex(candidates, predicate).map(function (index) {
    return indexInfo({
      index: index,
      candidates: candidates
    });
  });
};

export default <any> {
  locate: locate
};