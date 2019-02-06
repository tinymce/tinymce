import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Selectors } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';

var firstLayer = function (scope, selector) {
  return filterFirstLayer(scope, selector, Fun.constant(true));
};

var filterFirstLayer = function (scope, selector, predicate) {
  return Arr.bind(Traverse.children(scope), function (x) {
    return Selectors.is(x, selector) ?
      predicate(x) ? [ x ] : [ ]
      : filterFirstLayer(x, selector, predicate);
  });
};

export default {
  firstLayer: firstLayer,
  filterFirstLayer: filterFirstLayer
};