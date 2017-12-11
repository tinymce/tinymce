import { Arr } from '@ephox/katamari';

/**
 * Slice an array at the first item matched by the predicate
 */
var sliceby = function (list, pred) {
  var index = Arr.findIndex(list, pred).getOr(-1);
  return list.slice(0, index);
};

export default <any> {
  sliceby: sliceby
};