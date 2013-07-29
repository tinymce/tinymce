define(
  'ephox.snooker.util.Util',

  [
  ],

  function () {
    // Rename this module, and repeat should be in Arr.
    var repeat = function(repititions, f) {
      var r = [];
      for (var i = 0; i < repititions; i++) {
        r.push(f(i));
      }
      return r;
    };

    return {
      repeat: repeat
    };
  }
);
