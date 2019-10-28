import { Arr, Fun, Option } from '@ephox/katamari';
import { Compare, Element, SelectorFilter, Visibility } from '@ephox/sugar';
import { HTMLElement } from '@ephox/dom-globals';

import * as ArrPinpoint from './ArrPinpoint';

const locateVisible = (container: Element<HTMLElement>, current: Element<HTMLElement>, selector: string): Option<ArrPinpoint.IndexInfo<Element<HTMLElement>>> => {
  const predicate = Fun.curry(Compare.eq, current);
  const candidates = SelectorFilter.descendants(container, selector);
  const visible = Arr.filter(candidates, Visibility.isVisible);
  return ArrPinpoint.locate(visible, predicate);
};

const findIndex = (elements: Array<Element<any>>, target: Element<any>): Option<number> =>
  Arr.findIndex(elements, (elem) => Compare.eq(target, elem));

export {
  locateVisible,
  findIndex
};
