test(
  'OptionsTest',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Options',
    'ephox.katamari.test.arb.ArbDataTypes',
    'ephox.wrap.Jsc'
  ],

  function (Arr, Option, Options, ArbDataTypes, Jsc) {
    Jsc.property(
      'Options.cat of only nones should be an empty array',
      Jsc.array(ArbDataTypes.optionNone),
      function (options) {
        var output = Options.cat(options);
        return Jsc.eq(0, output.length);
      }
    );

    Jsc.property(
      'Options.cat of only somes should have the same length',
      Jsc.array(ArbDataTypes.optionSome),
      function (options) {
        var output = Options.cat(options);
        return Jsc.eq(options.length, output.length);
      }
    );

    Jsc.property(
      'Options.cat of Arr.map(xs, Option.some) should be xs',
      Jsc.array(Jsc.json),
      function (arr) {
        var options = Arr.map(arr, Option.some);
        var output = Options.cat(options);
        return Jsc.eq(arr, output);
      }
    );

    Jsc.property(
      'Options.cat of somes and nones should have length <= original',
      Jsc.array(ArbDataTypes.option),
      function (arr) {
        var output = Options.cat(arr);
        return Jsc.eq(output.length <= arr.length, true);
      }
    );

    Jsc.property(
      'Options.cat of nones.concat(somes).concat(nones) should be somes',
      Jsc.array(Jsc.json),
      Jsc.array(Jsc.json),
      Jsc.array(Jsc.json),
      function (before, on, after) {
        var beforeNones = Arr.map(before, Option.none);
        var afterNones = Arr.map(after, Option.none);
        var onSomes = Arr.map(on, Option.some);
        var output = Options.cat(beforeNones.concat(onSomes).concat(afterNones));
        return Jsc.eq(on, output);
      }
    );
  }
);