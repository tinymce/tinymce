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

    check([100, 20, 280, 100], 1, -30);
    check([100, 10, 290, 100], 1, -100);
    check([100, 80, 220, 100], 1, 30);
    check([100, 450, 10, 100], 1, 400);

    check([100, 50, 230, 120], 2, -20);
    check([100, 50, 10, 340], 2, -300);
    check([100, 50, 270, 80], 2, 20);
    check([100, 50, 400, 10], 2, 150);

    check([100, 50, 250, 150], 3, 50);

  }
);
