import { HTMLElement } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { Css, Element, Insert, Location, Position, Remove, Traverse } from '@ephox/sugar';

const getOffsetParent = (element: Element): Option<Element<HTMLElement>> => {
  // Firefox sets the offsetParent to the body when fixed instead of null like
  // all other browsers. So we need to check if the element is fixed and if so then
  // disregard the elements offsetParent.
  const isFixed = Css.getRaw(element, 'position').is('fixed');
  const offsetParent = isFixed ? Option.none<Element<HTMLElement>>() : Traverse.offsetParent(element);
  return offsetParent.orThunk(() => {
    const marker = Element.fromTag('span');
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
const getOrigin = (element: Element): Position => getOffsetParent(element).map(Location.absolute).getOrThunk(() => Position(0, 0));

export {
  getOrigin,
  getOffsetParent
};
