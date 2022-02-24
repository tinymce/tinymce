import { Optional, Type } from '@ephox/katamari';

const parseToInt = (val: string | number): Optional<number> => {
  // if size is a number or '_px', will return the number
  const re = /^[0-9\.]+(|px)$/i;
  if (re.test('' + val)) {
    return Optional.some(parseInt('' + val, 10));
  }
  return Optional.none();
};

const numToPx = (val: string | number): string => Type.isNumber(val) ? val + 'px' : val;

const calcCappedSize = (size: number, minSize: Optional<number>, maxSize: Optional<number>): number => {
  const minOverride = minSize.filter((min) => size < min);
  const maxOverride = maxSize.filter((max) => size > max);
  return minOverride.or(maxOverride).getOr(size);
};

export {
  calcCappedSize,
  parseToInt,
  numToPx
};
