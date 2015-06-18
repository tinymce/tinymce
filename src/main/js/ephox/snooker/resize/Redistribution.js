define(
  'ephox.snooker.resize.Redistribution',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.scullion.ADT',
    'ephox.violin.Strings',
    'global!parseFloat',
    'global!parseInt'
  ],

  function (Arr, Fun, Adt, Strings, parseFloat, parseInt) {
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
      return newType.fold(function () {
        return widths;
      }, function (px) {
        return redistributeToPx(widths, totalWidth, px);
      }, function (_pc) {
        return redistributeToPercent(widths, totalWidth);
      });
    };

    // We are deriving a pixel amount.
    var sum = function (values, totalWidth, fallback) {
      if (values.length === 0) return '0px';
      if (values.length === 1) return values[0];
      return Arr.foldr(values, function (rest, v) {
        return validate(v).fold(Fun.constant(fallback), Fun.identity, function (pc) {
          return (pc * totalWidth / 100);
        }) + rest;
      }, 0) + 'px';
    };

    return {
      validate: validate,
      redistribute: redistribute,
      toStr: toStr,
      sum: sum
    };
  }
);