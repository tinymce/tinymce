define(
  'ephox.boss.mutant.Query',

  [
    'ephox.boss.mutant.Logger',
    'ephox.boss.mutant.Up',
    'ephox.compass.Arr'
  ],

  function (Logger, Up, Arr) {
    var comparePosition = function (item, other) {
      // horribly inefficient
      var top = Up.top(item);
      var all = Logger.basic(top);

      var itemIndex = Arr.findIndex(all, function (x) { return item.id === x; });
      var otherIndex = Arr.findIndex(all, function (x) { return other.id === x; });

      if (itemIndex > -1 && otherIndex > -1) {
        if (itemIndex < otherIndex) return 2;
        else return 4;
      }
      return 0;
    };

    return {
      comparePosition: comparePosition
    };
  }
);
