import { Arr, Fun, Option, Struct } from '@ephox/katamari';

import * as PositionArray from '../alien/PositionArray';

const output = Struct.immutable('within', 'extra', 'withinWidth');

const apportion = (units, total, len) => {
  const parray = PositionArray.generate(units, (unit, current) => {
    const width = len(unit);
    return Option.some({
      element: Fun.constant(unit),
      start: Fun.constant(current),
      finish: Fun.constant(current + width),
      width: Fun.constant(width)
    });
  });

  const within = Arr.filter(parray, (unit) => {
    return unit.finish() <= total;
  });

  const withinWidth = Arr.foldr(within, (acc, el) => {
    return acc + el.width();
  }, 0);

  const extra = parray.slice(within.length);
  return {
    within: Fun.constant(within),
    extra: Fun.constant(extra),
    withinWidth: Fun.constant(withinWidth)
  };
};

const toUnit = (parray) => {
  return Arr.map(parray, (unit) => {
    return unit.element();
  });
};

const fitLast = (within, extra, withinWidth) => {
  const fits = toUnit(within.concat(extra));
  return output(fits, [], withinWidth);
};

const overflow = (within, extra, overflower, withinWidth) => {
  const fits = toUnit(within).concat([ overflower ]);
  return output(fits, toUnit(extra), withinWidth);
};

const fitAll = (within, extra, withinWidth) => {
  return output(toUnit(within), [], withinWidth);
};

const tryFit = (total, units, len) => {
  const divide = apportion(units, total, len);
  return divide.extra().length === 0 ? Option.some(divide) : Option.none();
};

const partition = (total, units, len, overflower) => {
  // Firstly, we try without the overflower.
  const divide = tryFit(total, units, len).getOrThunk(() => {
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