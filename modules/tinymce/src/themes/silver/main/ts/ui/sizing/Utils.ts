import { Optional, Type } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

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

const convertValueToPx = (element: SugarElement<Element>, value: number | string): Optional<number> => {
  if (typeof value === 'number') {
    return Optional.from(value);
  }

  const splitValue = /^([0-9.]+)(pt|em|px)$/.exec(value.trim());

  if (splitValue) {
    const type = splitValue[2];
    const parsed = Number.parseFloat(splitValue[1]);

    if (Number.isNaN(parsed) || parsed < 0) {
      return Optional.none();
    } else if (type === 'em') {
      return Optional.from(parsed * Number.parseFloat(window.getComputedStyle(element.dom).fontSize));
    } else if (type === 'pt') {
      return Optional.from(parsed * (72 / 96));
    } else if (type === 'px') {
      return Optional.from(parsed);
    }
  }

  return Optional.none();
};

export {
  calcCappedSize,
  convertValueToPx,
  parseToInt,
  numToPx
};
