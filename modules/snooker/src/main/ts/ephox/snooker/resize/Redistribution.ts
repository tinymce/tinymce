import { Arr, Fun } from '@ephox/katamari';
import * as Util from '../util/Util';
import { Size } from './Size';

// Convert all column widths to percent.
const redistributeToPercent = function (widths: string[], totalWidth: number) {
  return Arr.map(widths, function (w) {
    const colType = Size.from(w);
    return colType.fold(function () {
      return w;
    }, function (px) {
      const ratio = px / totalWidth * 100;
      return ratio + '%';
    }, function (pc) {
      return pc + '%';
    });
  });
};

const redistributeToPx = function (widths: string[], totalWidth: number, newTotalWidth: number) {
  const scale = newTotalWidth / totalWidth;
  return Arr.map(widths, function (w) {
    const colType = Size.from(w);
    return colType.fold(function () {
      return w;
    }, function (px) {
      return (px * scale) + 'px';
    }, function (pc) {
      return (pc / 100 * newTotalWidth) + 'px';
    });
  });
};

const redistributeEmpty = function (newWidthType: Size, columns: number) {
  const f = newWidthType.fold(
    function () {
      return Fun.constant('');
    },
    function (px) {
      const num = px / columns;
      return Fun.constant(num + 'px');
    },
    function (pc) {
      const num = pc / columns;
      return Fun.constant(num + 'px');
    }
  );
  return Util.repeat(columns, f);
};

const redistributeValues = function (newWidthType: Size, widths: string[], totalWidth: number) {
  return newWidthType.fold(function () {
    return widths;
  }, function (px) {
    return redistributeToPx(widths, totalWidth, px);
  }, function (_pc) {
    return redistributeToPercent(widths, totalWidth);
  });
};

const redistribute = function (widths: string[], totalWidth: number, newWidth: string) {
  const newType = Size.from(newWidth);
  const floats = Arr.forall(widths, function (s) { return s === '0px'; }) ? redistributeEmpty(newType, widths.length) : redistributeValues(newType, widths, totalWidth);
  return toIntegers(floats);
};

const sum = function (values: string[], fallback: number) {
  if (values.length === 0) {
    return fallback;
  }
  return Arr.foldr(values, function (rest, v) {
    return Size.from(v).fold(Fun.constant(0), Fun.identity, Fun.identity) + rest;
  }, 0);
};

const roundDown = function (num: number, unit: string) {
  const floored = Math.floor(num);
  return { value: floored + unit, remainder: num - floored };
};

const add = function (value: string, amount: number) {
  return Size.from(value).fold(Fun.constant(value), function (px) {
    return (px + amount) + 'px';
  }, function (pc) {
    return (pc + amount) + '%';
  });
};

const toIntegers = function (values: string[]) {
  if (values.length === 0) {
    return values;
  }
  const scan = Arr.foldr(values, function (rest, value) {
    const info = Size.from(value).fold(
      function () {
        return { value, remainder: 0 };
      },
      function (num) {
        return roundDown(num, 'px');
      },
      function (num) {
        return roundDown(num, '%');
      }
    );

    return {
      output: [ info.value ].concat(rest.output),
      remainder: rest.remainder + info.remainder
    };
  }, { output: [] as string[], remainder: 0 });

  const r = scan.output;
  return r.slice(0, r.length - 1).concat([ add(r[r.length - 1], Math.round(scan.remainder)) ]);
};

const validate = Size.from;

export default {
  validate,
  redistribute,
  sum,
  toIntegers
};