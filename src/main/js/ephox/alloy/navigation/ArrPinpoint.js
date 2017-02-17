define(
  'ephox.alloy.navigation.ArrPinpoint',

  [
    'ephox.katamari.api.Arr',
    'ephox.scullion.Struct'
  ],

  function (Arr, Struct) {
    var indexInfo = Struct.immutableBag([ 'index', 'candidates' ], [ ]);

    var locate = function (candidates, predicate) {
      return Arr.findIndex(candidates, predicate).map(function (index) {
        return indexInfo({
          index: index,
          candidates: candidates
        });
      });
    };

    return {
      locate: locate
    };
  }
);