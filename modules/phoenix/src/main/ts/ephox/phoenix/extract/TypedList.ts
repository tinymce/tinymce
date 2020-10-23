import { Arr, Fun, Optional } from '@ephox/katamari';
import { Arrays } from '@ephox/polaris';
import * as Spot from '../api/data/Spot';
import { TypedItem } from '../api/data/TypedItem';
import { SpotRange } from '../api/data/Types';

const count = function <E, D> (parray: TypedItem<E, D>[]) {
  return Arr.foldr(parray, function (b, a) {
    return a.len() + b;
  }, 0);
};

const dropUntil = function <E, D> (parray: TypedItem<E, D>[], target: E) {
  return Arrays.sliceby(parray, function (x) {
    return x.is(target);
  });
};

/**
 * Transform a TypedItem into a range representing that item from the start position.
 *
 * The generation function for making a PositionArray out of a list of TypedItems.
 */
const gen = function <E, D> (unit: TypedItem<E, D>, start: number): Optional<SpotRange<E>> {
  return unit.fold(() => Optional.none(), function (e) {
    return Optional.some(Spot.range(e, start, start + 1));
  }, function (t) {
    return Optional.some(Spot.range(t, start, start + unit.len()));
  }, Optional.none);
};

const empty = Fun.constant([]);

const justText = function <E, D> (parray: TypedItem<E, D>[]) {
  return Arr.bind(parray, function (x): E[] {
    return x.fold(empty, empty, function (i) { return [ i ]; }, empty);
  });
};

export {
  count,
  dropUntil,
  gen,
  justText
};
