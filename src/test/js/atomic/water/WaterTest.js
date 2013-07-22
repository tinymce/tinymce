test(
  'WaterTest',

  [
    'ephox.snooker.activate.Water'
  ],

  function (Water) {
    var input = [100, 50, 250, 100];
    var min = 10;
    var check = function (expected, column, step) {
      var actual = Water.water(input, column, step, min);
      console.log('Actual: ', actual);
      assert.eq(expected, actual);
    };

    check([80, 70, 250, 100], 0, -20);
    check([10, 140, 250, 100], 0, -200);
    check([120, 30, 250, 100], 0, 20);
    check([180, 10, 250, 100], 0, 80);

  }
);
