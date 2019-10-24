import { Arr, Fun, Option } from '@ephox/katamari';
import { Compare, Element, SelectorFilter, Visibility } from '@ephox/sugar';

import * as ArrPinpoint from './ArrPinpoint';

const locateVisible = (container: Element<any>, current: Element<any>, selector: string): Option<ArrPinpoint.IndexInfo<Element<any>>> => {
  const predicate = Fun.curry(Compare.eq, current);
  const candidates = SelectorFilter.descendants(container, selector);
  const visible = Arr.filter(candidates, Visibility.isVisible);
  return ArrPinpoint.locate(visible, predicate);
};

const findIndex = (elements: Array<Element<any>>, target: Element<any>): Option<number> => {
  return Arr.findIndex(elements, (elem) => {
    return Compare.eq(target, elem);
  });
};

export {
  locateVisible,
  findIndex
};
