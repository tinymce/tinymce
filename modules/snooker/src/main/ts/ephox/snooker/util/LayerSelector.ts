import { Arr, Fun } from '@ephox/katamari';
import { Selectors, Traverse } from '@ephox/sugar';

const firstLayer = function (scope, selector) {
  return filterFirstLayer(scope, selector, Fun.constant(true));
};

const filterFirstLayer = function (scope, selector, predicate) {
  return Arr.bind(Traverse.children(scope), function (x) {
    return Selectors.is(x, selector) ?
      predicate(x) ? [ x ] : [ ]
      : filterFirstLayer(x, selector, predicate);
  });
};

export default {
  firstLayer,
  filterFirstLayer
};