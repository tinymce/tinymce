import { Arr, Optional } from '@ephox/katamari';

import * as PositionArray from '../alien/PositionArray';

const output = <T>(within: T[], extra: T[], withinWidth: number): Widths<T> => ({
  within,
  extra,
  withinWidth
});

interface Pos<T> {
  readonly element: T;
  readonly start: number;
  readonly finish: number;
  readonly width: number;
}

interface Widths<T> {
  readonly within: T[];
  readonly extra: T[];
  readonly withinWidth: number;
}

type GetLengthFunc<T> = (comp: T) => number;

const apportion = <T>(units: T[], total: number, len: GetLengthFunc<T>): Widths<Pos<T>> => {
  const parray: Pos<T>[] = PositionArray.generate(units, (unit, current) => {
    const width = len(unit);
    return Optional.some({
      element: unit,
      start: current,
      finish: current + width,
      width
    });
  });

  const within = Arr.filter(parray, (unit) => unit.finish <= total);

  const withinWidth = Arr.foldr(within, (acc, el) => acc + el.width, 0);

  const extra = parray.slice(within.length);
  return {
    within,
    extra,
    withinWidth
  };
};

const toUnit = <T>(parray: Pos<T>[]) => Arr.map(parray, (unit) => unit.element);

const fitLast = <T>(within: Pos<T>[], extra: Pos<T>[], withinWidth: number) => {
  const fits = toUnit(within.concat(extra));
  return output(fits, [] as T[], withinWidth);
};

const overflow = <T>(within: Pos<T>[], extra: Pos<T>[], overflower: T, withinWidth: number) => {
  const fits = toUnit(within).concat([ overflower ]);
  return output(fits, toUnit(extra), withinWidth);
};

const fitAll = <T>(within: Pos<T>[], extra: Pos<T>[], withinWidth: number) => output(toUnit(within), [], withinWidth);

const tryFit = <T>(total: number, units: T[], len: GetLengthFunc<T>): Optional<Widths<Pos<T>>> => {
  const divide = apportion(units, total, len);
  return divide.extra.length === 0 ? Optional.some(divide) : Optional.none();
};

const partition = <T>(total: number, units: T[], len: GetLengthFunc<T>, overflower: T): Widths<T> => {
  // Firstly, we try without the overflower.
  const divide = tryFit(total, units, len).getOrThunk(() =>
    // If that doesn't work, overflow
    apportion(units, total - len(overflower), len)
  );

  const within = divide.within;
  const extra = divide.extra;
  const withinWidth = divide.withinWidth;
  if (extra.length === 1 && extra[0].width <= len(overflower)) {
    return fitLast(within, extra, withinWidth);
  } else if (extra.length >= 1) {
    return overflow(within, extra, overflower, withinWidth);
  } else {
    return fitAll(within, extra, withinWidth);
  }
};

export {
  partition
};
