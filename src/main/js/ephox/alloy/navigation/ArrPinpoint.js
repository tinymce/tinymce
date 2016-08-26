define(
  'ephox.alloy.navigation.ArrPinpoint',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.scullion.Struct'
  ],

  function (Arr, Option, Struct) {
    var indexInfo = Struct.immutable('index', 'candidates');

    var locate = function (candidates, predicate) {
      var index = Arr.findIndex(candidates, predicate);
      return index > -1 ? Option.some(indexInfo({
        index: index,
        candidates: candidates
      })) : Option.none();
    };

    return {
      locate: locate
    };
  }
);