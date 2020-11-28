import { Arr, Fun } from '@ephox/katamari';
import { Selectors, SugarElement, Traverse } from '@ephox/sugar';

const firstLayer = function <T extends Element> (scope: SugarElement<Node>, selector: string): SugarElement<T>[] {
  return filterFirstLayer(scope, selector, Fun.always);
};

const filterFirstLayer = function <T extends Element> (scope: SugarElement<Node>, selector: string, predicate: (e: SugarElement<ChildNode>) => boolean): SugarElement<T>[] {
  return Arr.bind(Traverse.children(scope), function (x) {
    if (Selectors.is<T>(x, selector)) {
      return predicate(x) ? [ x ] : [];
    } else {
      return filterFirstLayer(x, selector, predicate);
    }
  });
};

export {
  firstLayer,
  filterFirstLayer
};
