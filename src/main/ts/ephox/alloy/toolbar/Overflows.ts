import PositionArray from '../alien/PositionArray';
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Struct } from '@ephox/katamari';

var output = Struct.immutable('within', 'extra', 'withinWidth');

var apportion = function (units, total, len) {
  var parray = PositionArray.generate(units, function (unit, current) {
    var width = len(unit);
    return Option.some({
      element: Fun.constant(unit),
      start: Fun.constant(current),
      finish: Fun.constant(current + width),
      width: Fun.constant(width)
    });
  });

  var within = Arr.filter(parray, function (unit) {
    return unit.finish() <= total;
  });

  var withinWidth = Arr.foldr(within, function (acc, el) {
    return acc + el.width();
  }, 0);

  var extra = parray.slice(within.length);
  return {
    within: Fun.constant(within),
    extra: Fun.constant(extra),
    withinWidth: Fun.constant(withinWidth)
  };
};

var toUnit = function (parray) {
  return Arr.map(parray, function (unit) {
    return unit.element();
  });
};

var fitLast = function (within, extra, withinWidth) {
  var fits = toUnit(within.concat(extra));
  return output(fits, [], withinWidth);
};

var overflow = function (within, extra, overflower, withinWidth) {
  var fits = toUnit(within).concat([ overflower ]);
  return output(fits, toUnit(extra), withinWidth);
};

var fitAll = function (within, extra, withinWidth) {
  return output(toUnit(within), [], withinWidth);
};

var tryFit = function (total, units, len) {
  var divide = apportion(units, total, len);
  return divide.extra().length === 0 ? Option.some(divide) : Option.none();
};

var partition = function (total, units, len, overflower) {
  // Firstly, we try without the overflower.
  var divide = tryFit(total, units, len).getOrThunk(function () {
    // If that doesn't work, overflow
    return apportion(units, total - len(overflower), len);
  });

  var within = divide.within();
  var extra = divide.extra();
  var withinWidth = divide.withinWidth();
  if (extra.length === 1 && extra[0].width() <= len(overflower)) return fitLast(within, extra, withinWidth);
  else if (extra.length >= 1) return overflow(within, extra, overflower, withinWidth);
  else return fitAll(within, extra, withinWidth);
};

export default <any> {
  partition: partition
};