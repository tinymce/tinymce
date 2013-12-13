define(
  'ephox.snooker.ready.util.Util',

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

    var range = function (start, end) {
      var r = [];
      for (var i = start; i < end; i++) {
        r.push(i);
      }
      return r;
    };

    return {
      repeat: repeat,
      range: range
    };
  }
);
