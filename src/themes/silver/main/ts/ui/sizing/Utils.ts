import { Option, Type } from '@ephox/katamari';

const parseToInt = (val) => {
  // if size is a number or '_pt', will return the number
  const re = /^[0-9\.]+(|px)$/i;
  if (re.test('' + val)) {
    return Option.some(parseInt(val, 10));
  }
  return Option.none();
};

const numToPx = (val) => {
  return Type.isNumber(val) ? val + 'px' : val;
};

export default {
  parseToInt,
  numToPx
};