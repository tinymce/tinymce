import { Fun, Optional } from '@ephox/katamari';
import { Compare, Focus, PredicateFind, SugarElement, SugarShadowDom } from '@ephox/sugar';

const preserve = <T>(f: (e: SugarElement) => T, container: SugarElement): T => {
  const dos = SugarShadowDom.getRootNode(container);

  const refocus = Focus.active(dos).bind((focused: SugarElement) => {
    const hasFocus = (elem: SugarElement) => Compare.eq(focused, elem);
    return hasFocus(container) ? Optional.some(container) : PredicateFind.descendant(container, hasFocus);
  });

  const result = f(container);

  // If there is a focussed element, the F function may cause focus to be lost (such as by hiding elements). Restore it afterwards.
  refocus.each((oldFocus: SugarElement) => {
    Focus.active(dos).filter((newFocus) => Compare.eq(newFocus, oldFocus)).fold(() => {
      // Only refocus if the focus has changed, otherwise we break IE
      Focus.focus(oldFocus);
    }, Fun.noop);
  });
  return result;
};

export {
  preserve
};
