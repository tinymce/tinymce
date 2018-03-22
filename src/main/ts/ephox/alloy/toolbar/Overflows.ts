import { Arr, Fun, Option, Struct } from '@ephox/katamari';

import * as PositionArray from '../alien/PositionArray';

const output = Struct.immutable('within', 'extra', 'withinWidth');

const apportion = function (units, total, len) {
  const parray = PositionArray.generate(units, function (unit, current) {
    const width = len(unit);
    return Option.some({
      element: Fun.constant(unit),
      start: Fun.constant(current),
      finish: Fun.constant(current + width),
      width: Fun.constant(width)
    });
  });

  const within = Arr.filter(parray, function (unit) {
    return unit.finish() <= total;
  });

  const withinWidth = Arr.foldr(within, function (acc, el) {
    return acc + el.width();
  }, 0);

  const extra = parray.slice(within.length);
  return {
    within: Fun.constant(within),
    extra: Fun.constant(extra),
    withinWidth: Fun.constant(withinWidth)
  };
};

const toUnit = function (parray) {
  return Arr.map(parray, function (unit) {
    return unit.element();
  });
};

const fitLast = function (within, extra, withinWidth) {
  const fits = toUnit(within.concat(extra));
  return output(fits, [], withinWidth);
};

const overflow = function (within, extra, overflower, withinWidth) {
  const fits = toUnit(within).concat([ overflower ]);
  return output(fits, toUnit(extra), withinWidth);
};

const fitAll = function (within, extra, withinWidth) {
  return output(toUnit(within), [], withinWidth);
};

const tryFit = function (total, units, len) {
  const divide = apportion(units, total, len);
  return divide.extra().length === 0 ? Option.some(divide) : Option.none();
};

const partition = function (total, units, len, overflower) {
  // Firstly, we try without the overflower.
  const divide = tryFit(total, units, len).getOrThunk(function () {
    // If that doesn't work, overflow
    return apportion(units, total - len(overflower), len);
  });

  const within = divide.within();
  const extra = divide.extra();
  const withinWidth = divide.withinWidth();
  if (extra.length === 1 && extra[0].width() <= len(overflower)) { return fitLast(within, extra, withinWidth); } else if (extra.length >= 1) { return overflow(within, extra, overflower, withinWidth); } else { return fitAll(within, extra, withinWidth); }
};

export {
  partition
};