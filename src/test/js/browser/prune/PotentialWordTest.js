test(
  'PotentialWordTest',

  [
    'ephox.perhaps.Option',
    'ephox.robin.prune.PotentialWord',
    'ephox.robin.test.Assertions',
    'ephox.robin.test.BrowserCheck'
  ],

  function (Option, PotentialWord, Assertions, BrowserCheck) {

    var check = function (expected, input) {
      BrowserCheck.run(input, function (node) {
        assert.eq(expected.stop, PotentialWord.stop(node));
        Assertions.assertOptTextList(expected.left, PotentialWord.left(node));
        Assertions.assertOptTextList(expected.right, PotentialWord.right(node));
      });
    };

    check({
      left: Option.none(),
      right: Option.none(),
      stop: false
    }, '<div><span class="child">Hi</span></div>');

    check({
      left: Option.some([' cattle']),
      right: Option.some(['axe ']),
      stop: false
    }, '<div><span class="child">axe cattle</span></div>');

    check({
      left: Option.some([' ']),
      right: Option.some([' ']),
      stop: false
    }, '<div><span class="child"> </span></div>');

  }
);
