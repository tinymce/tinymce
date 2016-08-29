define(
  'ephox.alloy.navigation.Cycles',

  [

  ],

  function () {
    var cycleBy = function (value, delta, min, max) {
      var r = value + delta;
      if (r > max) return min;
      else if (r < min) return max;
      return r;
    };

    var cap = function (value, min, max) {
      if (value <= min) return min;
      else if (value >= max) return max;
      else return value;
    };

    return {
      cycleBy: cycleBy,
      cap: cap
    };
  }
);