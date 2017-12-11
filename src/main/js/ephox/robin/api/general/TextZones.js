import { Fun } from '@ephox/katamari';
import { Descent } from '@ephox/phoenix';
import TextZones from '../../zone/TextZones';

/*
 * TextZones return an array of zones based on an area being scanned. It will use the viewport
 * to work out when it can skip/abort scanning the rest of the element.
 */
var single = function (universe, element, envLang, viewport) {
  if (universe.property().isBoundary(element)) return TextZones.fromBounded(universe, element, element, envLang, viewport);
  else if (universe.property().isEmptyTag(element)) return empty();
  else return TextZones.fromInline(universe, element, envLang, viewport);
};

// NOTE: this is duplicated with TextZone, but I think if we try and reuse it it will become
// unreadable. Note, it will use the viewport to work out when it can skip/abort scanning the 
// rest of the range
var range = function (universe, start, soffset, finish, foffset, envLang, viewport) {
  var startPt = Descent.toLeaf(universe, start, soffset);
  var finishPt = Descent.toLeaf(universe, finish, foffset);
  if (universe.eq(startPt.element(), finishPt.element())) return single(universe, startPt.element(), envLang, viewport);      
  return TextZones.fromRange(universe, startPt.element(), finishPt.element(), envLang, viewport);
};

var empty = function () {
  return TextZones.empty();
};

export default <any> {
  single: single,
  range: range,
  empty: empty
};