import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Adt } from '@ephox/katamari';
import Util from '../util/Util';
import { Strings } from '@ephox/katamari';

var form = Adt.generate([
  { invalid: [ 'raw' ] },
  { pixels: [ 'value' ] },
  { percent: [ 'value' ] }
]);

var validateFor = function (suffix, type, value) {
  var rawAmount = value.substring(0, value.length - suffix.length);
  var amount = parseFloat(rawAmount);
  return rawAmount === amount.toString() ? type(amount) : form.invalid(value);
};

var validate = function (value) {
  if (Strings.endsWith(value, '%')) return validateFor('%', form.percent, value);
  if (Strings.endsWith(value, 'px')) return validateFor('px', form.pixels, value);
  return form.invalid(value);
};

// Convert all column widths to percent.
var redistributeToPercent = function (widths, totalWidth) {
  return Arr.map(widths, function (w) {
    var colType = validate(w);
    return colType.fold(function () {
      return w;
    }, function (px) {
      var ratio = px / totalWidth * 100;
      return ratio + '%';
    }, function (pc) {
      return pc + '%';
    });
  });
};

var redistributeToPx = function (widths, totalWidth, newTotalWidth) {
  var scale = newTotalWidth / totalWidth;
  return Arr.map(widths, function (w) {
    var colType = validate(w);
    return colType.fold(function () {
      return w;
    }, function (px) {
      return (px * scale) + 'px';
    }, function (pc) {
      return (pc / 100 * newTotalWidth) + 'px';
    });
  });
};

var redistributeEmpty = function (newWidthType, columns) {
  var f = newWidthType.fold(
    function () {
      return Fun.constant('');
    },
    function (px) {
      var num = px / columns;
      return Fun.constant(num + 'px');
    },
    function (pc) {
      var num = pc / columns;
      return Fun.constant(num + 'px');
    }
  );
  return Util.repeat(columns, f);
};

var redistributeValues = function (newWidthType, widths, totalWidth) {
  return newWidthType.fold(function () {
    return widths;
  }, function (px) {
    return redistributeToPx(widths, totalWidth, px);
  }, function (_pc) {
    return redistributeToPercent(widths, totalWidth);
  });
};

var redistribute = function (widths, totalWidth, newWidth) {
  var newType = validate(newWidth);
  var floats = Arr.forall(widths, function (s) { return s === '0px'; }) ? redistributeEmpty(newType, widths.length) : redistributeValues(newType, widths, totalWidth);
  return toIntegers(floats);
};

var sum = function (values, fallback) {
  if (values.length === 0) return fallback;
  return Arr.foldr(values, function (rest, v) {
    return validate(v).fold(Fun.constant(0), Fun.identity, Fun.identity) + rest;
  }, 0);
};

var roundDown = function (num, unit) {
  var floored = Math.floor(num);
  return { value: floored + unit, remainder: num - floored };
};

var add = function (value, amount) {
  return validate(value).fold(Fun.constant(value), function (px) {
    return (px + amount) + 'px';
  }, function (pc) {
    return (pc + amount) + '%';
  });
};

var toIntegers = function (values) {
  if (values.length === 0) return values;
  var scan = Arr.foldr(values, function (rest, value) {
    var info = validate(value).fold(
      function () { return { value: value, remainder: 0 }; },
      function (num) { return roundDown(num, 'px'); },
      function (num) { return roundDown(num, '%'); }
    );

    return { output: [ info.value ].concat(rest.output), remainder: rest.remainder + info.remainder };
  }, { output: [], remainder: 0 });

  var r = scan.output;
  return r.slice(0, r.length - 1).concat([ add(r[r.length - 1], Math.round(scan.remainder))]);
};

export default {
  validate: validate,
  redistribute: redistribute,
  sum: sum,
  toIntegers: toIntegers
};