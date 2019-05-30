import { Element, Insert, Location, Position, Remove, Traverse } from '@ephox/sugar';
import { SugarPosition } from '../alien/TypeDefinitions';

/*
 * This returns the position of the offset parent excluding any scroll. That
 * means that the absolute coordinates can be obtained by adding the origin
 * to the offset coordinates and not needing to know scroll.
 */
const getOrigin = (element: Element, scroll: SugarPosition): SugarPosition => {
  return Traverse.offsetParent(element).orThunk(() => {
    const marker = Element.fromTag('span');
    Insert.before(element, marker);
    const offsetParent = Traverse.offsetParent(marker);
    Remove.remove(marker);
    return offsetParent;
  }).map((offsetP) => {
    const loc = Location.absolute(offsetP);
    return loc.translate(-scroll.left(), -scroll.top());
  }).getOrThunk(() => {
    return Position(0, 0);
  });
};

export {
  getOrigin
};