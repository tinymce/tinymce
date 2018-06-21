import { Option, Fun } from '@ephox/katamari';
import { Compare, Focus, PredicateFind, Traverse, Element } from '@ephox/sugar';

const preserve = <T>(f: (e: Element) => T, container: Element): T => {
  const ownerDoc = Traverse.owner(container);

  const refocus = Focus.active(ownerDoc).bind((focused) => {
    const hasFocus = (elem) => {
      return Compare.eq(focused, elem);
    };
    return hasFocus(container) ? Option.some(container) : PredicateFind.descendant(container, hasFocus);
  });

  const result = f(container);

  // If there is a focussed element, the F function may cause focus to be lost (such as by hiding elements). Restore it afterwards.
  refocus.each((oldFocus) => {
    Focus.active(ownerDoc).filter((newFocus) => {
      return Compare.eq(newFocus, oldFocus);
    }).fold(() => {
      // Only refocus if the focus has changed, otherwise we break IE
      Focus.focus(oldFocus);
    }, Fun.noop);
  });
  return result;
};

export {
  preserve
};