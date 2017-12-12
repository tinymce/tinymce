import ArrPinpoint from './ArrPinpoint';
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Compare } from '@ephox/sugar';
import { SelectorFilter } from '@ephox/sugar';
import { Visibility } from '@ephox/sugar';

var locateVisible = function (container, current, selector) {
  var filter = Visibility.isVisible;
  return locateIn(container, current, selector, filter);
};

var locateIn = function (container, current, selector, filter) {
  var predicate = Fun.curry(Compare.eq, current);
  var candidates = SelectorFilter.descendants(container, selector);
  var visible = Arr.filter(candidates, Visibility.isVisible);
  return ArrPinpoint.locate(visible, predicate);
};

var findIndex = function (elements, target) {
  return Arr.findIndex(elements, function (elem) {
    return Compare.eq(target, elem);
  });
};

export default <any> {
  locateVisible: locateVisible,
  locateIn: locateIn,
  findIndex: findIndex
};