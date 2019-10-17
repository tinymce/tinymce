import { Css, Element, Insert, Location, Position, Remove, Traverse } from '@ephox/sugar';
import { Option } from '@ephox/katamari';
import { SugarPosition } from './TypeDefinitions';

/*
 * This allows the absolute coordinates to be obtained by adding the
 * origin to the offset coordinates and not needing to know scroll.
 */
const getOrigin = (element: Element): SugarPosition => {
  // Firefox sets the offsetParent to the body when fixed instead of null like
  // all other browsers. So we need to check if the element is fixed and if so then
  // disregard the elements offsetParent.
  const isFixed = Css.getRaw(element, 'position').is('fixed');
  const offsetParent = isFixed ? Option.none<Element>() : Traverse.offsetParent(element);
  return offsetParent.orThunk(() => {
    const marker = Element.fromTag('span');
    Insert.before(element, marker);
    const offsetParent = Traverse.offsetParent(marker);
    Remove.remove(marker);
    return offsetParent;
  }).map(Location.absolute).getOrThunk(() => {
    return Position(0, 0);
  });
};

export {
  getOrigin
};
