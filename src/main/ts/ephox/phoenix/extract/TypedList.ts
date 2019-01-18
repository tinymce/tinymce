import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import Spot from '../api/data/Spot';
import { Arrays } from '@ephox/polaris';

var count = function (parray) {
  return Arr.foldr(parray, function (b, a) {
    return a.len() + b;
  }, 0);
};

var dropUntil = function (parray, target) {
  return Arrays.sliceby(parray, function (x) {
    return x.is(target);
  });
};

/**
 * Transform a TypedItem into a range representing that item from the start position.
 *
 * The generation function for making a PositionArray out of a list of TypedItems.
 */
var gen = function (unit, start) {
  return unit.fold(Option.none, function (e) {
    return Option.some(Spot.range(e, start, start + 1));
  }, function (t) {
    return Option.some(Spot.range(t, start, start + unit.len()));
  });
};

var justText = function (parray) {
  return Arr.bind(parray, function (x) {
    return x.fold(Fun.constant([]), Fun.constant([]), function (i) { return [i]; });
  });
};

export default {
  count: count,
  dropUntil: dropUntil,
  gen: gen,
  justText: justText
};