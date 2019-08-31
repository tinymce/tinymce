import { Element, Insert, Location, Position, Remove, Traverse } from '@ephox/sugar';
import { SugarPosition } from './TypeDefinitions';

/*
 * This allows the absolute coordinates to be obtained by adding the
 * origin to the offset coordinates and not needing to know scroll.
 */
const getOrigin = (element: Element): SugarPosition => {
  return Traverse.offsetParent(element).orThunk(() => {
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
