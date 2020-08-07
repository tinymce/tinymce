import { Arr, Fun } from '@ephox/katamari';
import { Selectors, SugarElement, Traverse } from '@ephox/sugar';

const firstLayer = function (scope: SugarElement, selector: string) {
  return filterFirstLayer(scope, selector, Fun.always);
};

const filterFirstLayer = function (scope: SugarElement, selector: string, predicate: (e: SugarElement) => boolean): SugarElement[] {
  return Arr.bind(Traverse.children(scope), function (x) {
    return Selectors.is(x, selector) ?
      predicate(x) ? [ x ] : [ ]
      : filterFirstLayer(x, selector, predicate);
  });
};

export {
  firstLayer,
  filterFirstLayer
};
