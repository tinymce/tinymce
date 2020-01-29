import { HTMLElement } from '@ephox/dom-globals';
import { Arr, Option } from '@ephox/katamari';
import { Compare, Element, SelectorFilter, Visibility } from '@ephox/sugar';

import * as ArrPinpoint from './ArrPinpoint';

const locateVisible = (container: Element<HTMLElement>, current: Element<HTMLElement>, selector: string): Option<ArrPinpoint.IndexInfo<Element<HTMLElement>>> => {
  const predicate = (x: Element) => Compare.eq(x, current);
  const candidates = SelectorFilter.descendants(container, selector) as Array<Element<HTMLElement>>;
  const visible = Arr.filter(candidates, Visibility.isVisible);
  return ArrPinpoint.locate(visible, predicate);
};

const findIndex = <T> (elements: Array<Element<T>>, target: Element<T>): Option<number> =>
  Arr.findIndex(elements, (elem) => Compare.eq(target, elem));

export {
  locateVisible,
  findIndex
};
