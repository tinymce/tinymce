import { Universe } from '@ephox/boss';
import { Descent } from '@ephox/phoenix';
import * as TextZones from '../../zone/TextZones';
import { Zones } from '../../zone/Zones';
import { ZoneViewports } from './ZoneViewports';

/*
 * TextZones return an array of zones based on an area being scanned. It will use the viewport
 * to work out when it can skip/abort scanning the rest of the element.
 */
const single = function <E, D> (universe: Universe<E, D>, element: E, envLang: string, viewport: ZoneViewports<E>) {
  if (universe.property().isBoundary(element)) {
    return TextZones.fromBounded(universe, element, element, envLang, viewport);
  } else if (universe.property().isEmptyTag(element)) {
    return empty<E>();
  } else {
    return TextZones.fromInline(universe, element, envLang, viewport);
  }
};

// NOTE: this is duplicated with TextZone, but I think if we try and reuse it it will become
// unreadable. Note, it will use the viewport to work out when it can skip/abort scanning the
// rest of the range
const range = function <E, D> (universe: Universe<E, D>, start: E, soffset: number, finish: E, foffset: number, envLang: string, viewport: ZoneViewports<E>) {
  const startPt = Descent.toLeaf(universe, start, soffset);
  const finishPt = Descent.toLeaf(universe, finish, foffset);
  if (universe.eq(startPt.element(), finishPt.element())) {
    return single(universe, startPt.element(), envLang, viewport);
  }
  return TextZones.fromRange(universe, startPt.element(), finishPt.element(), envLang, viewport);
};

type EmptyFn = <E>() => Zones<E>;
const empty: EmptyFn = TextZones.empty;

export {
  single,
  range,
  empty
};
