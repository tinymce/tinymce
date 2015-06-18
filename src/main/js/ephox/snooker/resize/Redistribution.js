define(
  'ephox.snooker.resize.Redistribution',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.scullion.ADT',
    'ephox.violin.Strings',
    'global!Math',
    'global!parseFloat',
    'global!parseInt'
  ],

  function (Arr, Fun, Adt, Strings, Math, parseFloat, parseInt) {
    var form = Adt.generate([
      { invalid: [ 'raw' ] },
      { pixels: [ 'value' ] },
      { percent: [ 'value' ] }
    ]);

    var toStr = function (f) {
      return f.fold(function (raw) {
        return 'invalid[' + raw + ']';
      }, function (pixels) {
        return 'pixels[' + pixels + ']';
      }, function (percent) {
        return 'percent[' + percent + ']';
      });
    };

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

    var redistribute = function (widths, totalWidth, newWidth) {
      var newType = validate(newWidth);
      var floats = newType.fold(function () {
        return widths;
      }, function (px) {
        return redistributeToPx(widths, totalWidth, px);
      }, function (_pc) {
        return redistributeToPercent(widths, totalWidth);
      });
      return integers(floats);
    };

    var sum = function (values, fallback) {
      if (values.length === 0) return fallback;
      return Arr.foldr(values, function (rest, v) {
        return validate(v).fold(Fun.constant(fallback), Fun.identity, Fun.identity) + rest;
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

    var integers = function (values) {
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

    return {
      validate: validate,
      redistribute: redistribute,
      toStr: toStr,
      sum: sum,
      integers: integers
    };
  }
);