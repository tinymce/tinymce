import { Arr, Optional } from '@ephox/katamari';
import { Compare, SelectorFilter, SugarElement, Visibility } from '@ephox/sugar';

import * as ArrPinpoint from './ArrPinpoint';

const locateVisible = (container: SugarElement<HTMLElement>, current: SugarElement<HTMLElement>, selector: string): Optional<ArrPinpoint.IndexInfo<SugarElement<HTMLElement>>> => {
  const predicate = (x: SugarElement<Node>) => Compare.eq(x, current);
  const candidates = SelectorFilter.descendants<HTMLElement>(container, selector);
  const visible = Arr.filter(candidates, Visibility.isVisible);
  return ArrPinpoint.locate(visible, predicate);
};

const findIndex = <T> (elements: Array<SugarElement<T>>, target: SugarElement<T>): Optional<number> =>
  Arr.findIndex(elements, (elem) => Compare.eq(target, elem));

export {
  locateVisible,
  findIndex
};
