import { Arr, Fun, Option } from '@ephox/katamari';
import { Arrays } from '@ephox/polaris';
import * as Spot from '../api/data/Spot';
import { TypedItem } from '../api/data/TypedItem';
import { SpotRange } from '../api/data/Types';

const count = function <E, D>(parray: TypedItem<E, D>[]) {
  return Arr.foldr(parray, function (b, a) {
    return a.len() + b;
  }, 0);
};

const dropUntil = function <E, D>(parray: TypedItem<E, D>[], target: E) {
  return Arrays.sliceby(parray, function (x) {
    return x.is(target);
  });
};

/**
 * Transform a TypedItem into a range representing that item from the start position.
 *
 * The generation function for making a PositionArray out of a list of TypedItems.
 */
const gen = function <E, D>(unit: TypedItem<E, D>, start: number): Option<SpotRange<E>> {
  return unit.fold(() => Option.none(), function (e) {
    return Option.some(Spot.range(e, start, start + 1));
  }, function (t) {
    return Option.some(Spot.range(t, start, start + unit.len()));
  });
};

const justText = function <E, D>(parray: TypedItem<E, D>[]) {
  return Arr.bind(parray, function (x): E[] {
    return x.fold(Fun.constant([]), Fun.constant([]), function (i) { return [i]; });
  });
};

export {
  count,
  dropUntil,
  gen,
  justText
};
