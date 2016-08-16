test(
  'BagEqualTest',

  [
    'ephox.katamari.api.Bag'
  ],

  function (Bag) {
    var check = function (expected, b1, b2) {
      var actual = Bag.equal(b1, b2);
      assert.eq(expected, actual);
    };

    check(true, [], []);
    check(false, [1], []);
    check(false, [], [1]);
    check(true, [1], [1]);
    check(false, [1], [2]);
    check(false, [2], [3]);
    check(true, [1, 2, 3], [3, 2, 1]);
    check(false, [1, 2, 2, 3], [1, 2, 3]);
    check(false, [1, 2, 2, 3], [1, 3, 3, 2]);

    var alpha = { a: 'a' };
    var beta = { b: 'b' };
    var gamma = { c: 'c' };
    var delta = { d: 'd' };

    check(false, [alpha, beta, alpha], [beta, beta, alpha]);
    check(true, [alpha, alpha, alpha, beta, gamma, delta, alpha], [alpha, beta, gamma, alpha, alpha, alpha, delta]);
    check(false, [alpha, beta, alpha, beta, gamma, delta, alpha], [alpha, beta, gamma, alpha, alpha, alpha, delta]);
  }
);
