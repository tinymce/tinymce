import { Option } from '@ephox/katamari';
import { Compare, Focus, PredicateFind, Traverse } from '@ephox/sugar';

const preserve = function (f, container) {
  const ownerDoc = Traverse.owner(container);

  const refocus = Focus.active(ownerDoc).bind(function (focused) {
    const hasFocus = function (elem) {
      return Compare.eq(focused, elem);
    };
    return hasFocus(container) ? Option.some(container) : PredicateFind.descendant(container, hasFocus);
  });

  const result = f(container);

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
  preserve
};
