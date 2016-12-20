define(
  'ephox.agar.arbitrary.WeightedChoice',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Obj',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Struct',
    'ephox.wrap-jsverify.Jsc'
  ],

  function (Arr, Obj, Merger, Option, Struct, Jsc) {
    var weighted = Struct.immutable('list', 'total');

    var choose = function (candidates) {
      var result = Arr.foldl(candidates, function (rest, d) {
        var newTotal = rest.total + d.weight;
        var merged = Merger.merge(d, {
          accWeight: newTotal
        });
        return {
          total: newTotal,
          list: rest.list.concat([ merged ])
        };
      }, { list: [ ], total: 0 });

      return weighted(result.list, result.total);
    };

    var gChoose = function (weighted) {
      return Jsc.number(0, weighted.total()).generator.map(function (w) {
        var raw = Arr.find(weighted.list(), function (d) {
          return w <= d.accWeight;
        });

        var keys = raw.map(Obj.keys).getOr([ ]);
        return keys.length === [ 'weight', 'accWeight' ].length ? Option.none() : raw;
      });
    };

    var generator = function (candidates) {
      var list = choose(candidates);
      return gChoose(list);
    };

    return {
      generator: generator
    };
  }
);