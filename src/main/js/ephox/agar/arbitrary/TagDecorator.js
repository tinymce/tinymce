define(
  'ephox.agar.arbitrary.TagDecorator',

  [
    'ephox.agar.arbitrary.WeightedChoice',
    'ephox.wrap-jsverify.Jsc'
  ],

  function (WeightedChoice, Jsc) {
    var gOne = function (wDecorations) {
      return WeightedChoice.generator(wDecorations).flatMap(function (choice) {
        return choice.fold(function () {
          return Jsc.constant({}).generator;
        }, function (c) {
          return c.value.map(function (v) {
            var r = {};
            r[c.property] = v;
            return r;
          });
        });
      });
    };

    var gEnforce = function (decorations) {
      return Jsc.constant(decorations).generator;
    };

    return {
      gOne: gOne,
      gEnforce: gEnforce
    };
  }
);