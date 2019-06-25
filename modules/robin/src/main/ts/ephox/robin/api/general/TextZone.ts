import { Universe } from '@ephox/boss';
import { Descent } from '@ephox/phoenix';
import TextZone from '../../zone/TextZone';

/*
 * TextZone returns an Optional zone if that zone is the right language (onlyLang)
 */
// Cluster out from a single point, enforcing one language
const single = function <E, D> (universe: Universe<E, D>, element: E, envLang: string, onlyLang: string) {
  if (universe.property().isBoundary(element)) {
    return TextZone.fromBounded(universe, element, element, envLang, onlyLang);
  } else if (universe.property().isEmptyTag(element)) {
    return TextZone.empty<E>();
  } else {
    return TextZone.fromInline(universe, element, envLang, onlyLang);
  }
};

const range = function <E, D> (universe: Universe<E, D>, start: E, soffset: number, finish: E, foffset: number, envLang: string, onlyLang: string) {
  const startPt = Descent.toLeaf(universe, start, soffset);
  const finishPt = Descent.toLeaf(universe, finish, foffset);
  if (universe.eq(startPt.element(), finishPt.element())) {
    return single(universe, startPt.element(), envLang, onlyLang);
  }
  return TextZone.fromRange(universe, startPt.element(), finishPt.element(), envLang, onlyLang);
};

export default {
  single,
  range
};