import { Option } from '@ephox/katamari';
import { Compare } from '@ephox/sugar';
import { Focus } from '@ephox/sugar';
import { PredicateFind } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';

var preserve = function (f, container) {
  var ownerDoc = Traverse.owner(container);

  var refocus = Focus.active(ownerDoc).bind(function (focused) {
    var hasFocus = function (elem) {
      return Compare.eq(focused, elem);
    };
    return hasFocus(container) ? Option.some(container) : PredicateFind.descendant(container, hasFocus);
  });

  var result = f(container);

  // If there is a focussed element, the F function may cause focus to be lost (such as by hiding elements). Restore it afterwards.
  refocus.each(function (oldFocus) {
    const shouldFocus = Focus.active(ownerDoc).filter(function (newFocus) {
      return Compare.eq(newFocus, oldFocus);
    }).isNone();
    if (shouldFocus) {
      // Only refocus if the focus has changed, otherwise we break IE
      Focus.focus(oldFocus);
    }
  });
  return result;
};

export default <any> {
  preserve: preserve
};