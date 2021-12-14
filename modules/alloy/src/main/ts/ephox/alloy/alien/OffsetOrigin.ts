import { Optional, Optionals } from '@ephox/katamari';
import { Css, Insert, Remove, SugarElement, SugarLocation, SugarPosition, Traverse } from '@ephox/sugar';

const getOffsetParent = (element: SugarElement<HTMLElement>): Optional<SugarElement<HTMLElement>> => {
  // Firefox sets the offsetParent to the body when fixed instead of null like
  // all other browsers. So we need to check if the element is fixed and if so then
  // disregard the elements offsetParent.
  const isFixed = Optionals.is(Css.getRaw(element, 'position'), 'fixed');
  const offsetParent = isFixed ? Optional.none<SugarElement<HTMLElement>>() : Traverse.offsetParent(element);
  return offsetParent.orThunk(() => {
    const marker = SugarElement.fromTag('span');
    // PERFORMANCE: Append the marker to the parent element, as adding it before the current element will
    // trigger the styles to be recalculated which is a little costly (particularly in scroll/resize events)
    return Traverse.parent(element).bind((parent) => {
      Insert.append(parent, marker);
      const offsetParent = Traverse.offsetParent(marker);
      Remove.remove(marker);
      return offsetParent;
    });
  });
};

/*
 * This allows the absolute coordinates to be obtained by adding the
 * origin to the offset coordinates and not needing to know scroll.
 */
const getOrigin = (element: SugarElement<HTMLElement>): SugarPosition =>
  getOffsetParent(element).map(SugarLocation.absolute).getOrThunk(() => SugarPosition(0, 0));

export {
  getOrigin,
  getOffsetParent
};
