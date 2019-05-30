import { Adt, Arr, Fun, Strings } from '@ephox/katamari';
import Util from '../util/Util';

const form = Adt.generate([
  { invalid: [ 'raw' ] },
  { pixels: [ 'value' ] },
  { percent: [ 'value' ] }
]);

const validateFor = function (suffix, type, value) {
  const rawAmount = value.substring(0, value.length - suffix.length);
  const amount = parseFloat(rawAmount);
  return rawAmount === amount.toString() ? type(amount) : form.invalid(value);
};

const validate = function (value) {
  if (Strings.endsWith(value, '%')) { return validateFor('%', form.percent, value); }
  if (Strings.endsWith(value, 'px')) { return validateFor('px', form.pixels, value); }
  return form.invalid(value);
};

// Convert all column widths to percent.
const redistributeToPercent = function (widths, totalWidth) {
  return Arr.map(widths, function (w) {
    const colType = validate(w);
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

const redistributeToPx = function (widths, totalWidth, newTotalWidth) {
  const scale = newTotalWidth / totalWidth;
  return Arr.map(widths, function (w) {
    const colType = validate(w);
    return colType.fold(function () {
      return w;
    }, function (px) {
      return (px * scale) + 'px';
    }, function (pc) {
      return (pc / 100 * newTotalWidth) + 'px';
    });
  });
};

const redistributeEmpty = function (newWidthType, columns) {
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

const redistributeValues = function (newWidthType, widths, totalWidth) {
  return newWidthType.fold(function () {
    return widths;
  }, function (px) {
    return redistributeToPx(widths, totalWidth, px);
  }, function (_pc) {
    return redistributeToPercent(widths, totalWidth);
  });
};

const redistribute = function (widths, totalWidth, newWidth) {
  const newType = validate(newWidth);
  const floats = Arr.forall(widths, function (s) { return s === '0px'; }) ? redistributeEmpty(newType, widths.length) : redistributeValues(newType, widths, totalWidth);
  return toIntegers(floats);
};

const sum = function (values, fallback) {
  if (values.length === 0) { return fallback; }
  return Arr.foldr(values, function (rest, v) {
    return validate(v).fold(Fun.constant(0), Fun.identity, Fun.identity) + rest;
  }, 0);
};

const roundDown = function (num, unit) {
  const floored = Math.floor(num);
  return { value: floored + unit, remainder: num - floored };
};

const add = function (value, amount) {
  return validate(value).fold(Fun.constant(value), function (px) {
    return (px + amount) + 'px';
  }, function (pc) {
    return (pc + amount) + '%';
  });
};

const toIntegers = function (values) {
  if (values.length === 0) { return values; }
  const scan = Arr.foldr(values, function (rest, value) {
    const info = validate(value).fold(
      function () { return { value, remainder: 0 }; },
      function (num) { return roundDown(num, 'px'); },
      function (num) { return roundDown(num, '%'); }
    );

    return { output: [ info.value ].concat(rest.output), remainder: rest.remainder + info.remainder };
  }, { output: [], remainder: 0 });

  const r = scan.output;
  return r.slice(0, r.length - 1).concat([ add(r[r.length - 1], Math.round(scan.remainder))]);
};

export default {
  validate,
  redistribute,
  sum,
  toIntegers
};