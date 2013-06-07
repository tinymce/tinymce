define(
  'ephox.phoenix.util.doc.List',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.Spot',
    'ephox.polaris.api.Arrays'
  ],

  function (Arr, Fun, Option, Spot, Arrays) {

    var count = function (list) {
      return Arr.foldr(list, function (b, a) {
        return a.len() + b;
      }, 0);
    };

    var dropUntil = function (elements, target) {
      return Arrays.sliceby(elements, function (x) {
        return x.is(target);
      });
    };

    var gen = function (a, start) {
      return a.fold(Option.none, function (e) {
        return Option.some(Spot.range(e, start, start + 1));
      }, function (t) {
        return Option.some(Spot.range(t, start, start + a.len()));
      });
    };

    var justText = function (elements) {
      return Arr.bind(elements, function (x) {
        return x.fold(Fun.constant([]), Fun.constant([]), Fun.identity);
      });
    };

    return {
      count: count,
      dropUntil: dropUntil,
      gen: gen,
      justText: justText
    };
  }
);
