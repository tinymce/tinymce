import { Option } from '@ephox/katamari';
import { Compare, Focus, PredicateFind, Traverse } from '@ephox/sugar';

import { SugarElement } from '../alien/TypeDefinitions';

const preserve = <T>(f: (SugarElement) => T, container: SugarElement): T => {
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
    }).orThunk(() => {
      // Only refocus if the focus has changed, otherwise we break IE
      Focus.focus(oldFocus);
    });
  });
  return result;
};

export {
  preserve
};