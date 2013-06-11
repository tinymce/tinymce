test(
  'words :: Prune',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.perhaps.Option',
    'ephox.robin.test.Assertions',
    'ephox.robin.test.BrowserCheck',
    'ephox.robin.words.Prune'
  ],

  function (DomUniverse, Option, Assertions, BrowserCheck, Prune) {
    var prune = Prune(DomUniverse());

    var check = function (expected, input) {
      BrowserCheck.run(input, function (node) {
        assert.eq(expected.stop, prune.stop(node));
        Assertions.assertOptTextList(expected.left, prune.left(node));
        Assertions.assertOptTextList(expected.right, prune.right(node));
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
