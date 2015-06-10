define(
  'ephox.snooker.test.TestGenerator',

  [
    'ephox.peanut.Fun'
  ],

  function (Fun) {
    return function () {
      var counter = 0;

      var cell = function () {
        var r = '?_' + counter;
        counter++;
        return r;
      };

      var replace = function (name) {
        var r = 'h(' + name + ')_' + counter;
        counter++;
        return r;
      };

      return {
        cell: cell,
        gap: Fun.constant('*'),
        row: Fun.constant('tr'),
        replace: replace
      };
    };
  }
);