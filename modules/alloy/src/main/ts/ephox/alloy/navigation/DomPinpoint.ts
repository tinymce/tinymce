import { Arr, Fun, Option } from '@ephox/katamari';
import { Compare, SelectorFilter, Visibility } from '@ephox/sugar';

import * as ArrPinpoint from './ArrPinpoint';

const locateVisible = (container, current, selector) => {
  const filter = Visibility.isVisible;
  return locateIn(container, current, selector, filter);
};

const locateIn = (container, current, selector, filter) => {
  const predicate = Fun.curry(Compare.eq, current);
  const candidates = SelectorFilter.descendants(container, selector);
  const visible = Arr.filter(candidates, Visibility.isVisible);
  return ArrPinpoint.locate(visible, predicate);
};

const findIndex = (elements, target) => {
  return Arr.findIndex(elements, (elem) => {
    return Compare.eq(target, elem);
  });
};

export {
  locateVisible,
  locateIn,
  findIndex
};