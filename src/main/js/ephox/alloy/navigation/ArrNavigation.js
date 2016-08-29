define(
  'ephox.alloy.navigation.ArrNavigation',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'global!Math'
  ],

  function (Arr, Option, Math) {
    // TODO: Use katamari once find is fixed
    var findIn = function (array, predicate) {
      var r = Arr.find(array, predicate);
      return r !== undefined && r !== null ? Option.some(r) : Option.none();
    };

    var cyclePrev = function (values, index, predicate) {
      var before = Arr.reverse(values.slice(0, index));
      var after = Arr.reverse(values.slice(index + 1));
      return findIn(before.concat(after), predicate);
    };

    var tryPrev = function (values, index, predicate) {
      var before = Arr.reverse(values.slice(0, index));
      return findIn(before, predicate);
    };

    var cycleNext = function (values, index, predicate) {
      var before = values.slice(0, index);
      var after = values.slice(index + 1);
      // TODO: Use katamari once find is fixed
      return findIn(after.concat(before), predicate);
    };

    var tryNext = function (values, index, predicate) {
      var after = values.slice(index + 1);
      return findIn(after, predicate);
    };

    return {
      cyclePrev: cyclePrev,
      cycleNext: cycleNext,
      tryPrev: tryPrev,
      tryNext: tryNext
    };
  }
);