import { Arr, Fun, Optional } from '@ephox/katamari';
import { Arrays } from '@ephox/polaris';

import * as Spot from '../api/data/Spot';
import { TypedItem } from '../api/data/TypedItem';
import { SpotRange } from '../api/data/Types';

const count = <E, D>(parray: TypedItem<E, D>[]): number => {
  return Arr.foldr(parray, (b, a) => {
    return a.len() + b;
  }, 0);
};

const dropUntil = <E, D>(parray: TypedItem<E, D>[], target: E): TypedItem<E, D>[] => {
  return Arrays.sliceby(parray, (x) => {
    return x.is(target);
  });
};

/**
 * Transform a TypedItem into a range representing that item from the start position.
 *
 * The generation function for making a PositionArray out of a list of TypedItems.
 */
const gen = <E, D>(unit: TypedItem<E, D>, start: number): Optional<SpotRange<E>> => {
  return unit.fold(() => Optional.none(), (e) => {
    return Optional.some(Spot.range(e, start, start + 1));
  }, (t) => {
    return Optional.some(Spot.range(t, start, start + unit.len()));
  }, Optional.none);
};

const empty = Fun.constant([]);

const justText = <E, D>(parray: TypedItem<E, D>[]): E[] => {
  return Arr.bind(parray, (x): E[] => {
    return x.fold(empty, empty, (i) => {
      return [ i ];
    }, empty);
  });
};

export {
  count,
  dropUntil,
  gen,
  justText
};
