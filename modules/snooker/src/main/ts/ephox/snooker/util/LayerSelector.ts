import { Arr, Fun } from '@ephox/katamari';
import { Selectors, Traverse, Element } from '@ephox/sugar';

const firstLayer = function (scope: Element, selector: string) {
  return filterFirstLayer(scope, selector, Fun.constant(true));
};

const filterFirstLayer = function (scope: Element, selector: string, predicate: (e: Element) => boolean): Element[] {
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