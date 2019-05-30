import { Descent } from '@ephox/phoenix';
import TextZone from '../../zone/TextZone';

/*
 * TextZone returns an Optional zone if that zone is the right language (onlyLang)
 */
// Cluster out from a single point, enforcing one language
var single = function (universe, element, envLang, onlyLang) {
  if (universe.property().isBoundary(element)) return TextZone.fromBounded(universe, element, element, envLang, onlyLang);
  else if (universe.property().isEmptyTag(element)) return TextZone.empty();
  else return TextZone.fromInline(universe, element, envLang, onlyLang);
};

var range = function (universe, start, soffset, finish, foffset, envLang, onlyLang) {
  var startPt = Descent.toLeaf(universe, start, soffset);
  var finishPt = Descent.toLeaf(universe, finish, foffset);
  if (universe.eq(startPt.element(), finishPt.element())) return single(universe, startPt.element(), envLang, onlyLang);      
  return TextZone.fromRange(universe, startPt.element(), finishPt.element(), envLang, onlyLang);
};

export default <any> {
  single: single,
  range: range
};