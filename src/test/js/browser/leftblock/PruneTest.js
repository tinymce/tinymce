test(
  'leftblock :: Prune',

  [
    'ephox.perhaps.Option',
    'ephox.robin.leftblock.Prune',
    'ephox.robin.test.Assertions',
    'ephox.robin.test.BrowserCheck'
  ],

  function (Option, Prune, Assertions, BrowserCheck) {

    var check = function (expected, input) {
      BrowserCheck.run(input, function (node) {
        assert.eq(expected.stop, Prune.stop(node));
        Assertions.assertOpt(expected.left, Prune.left(node));
        Assertions.assertOpt(Option.some([]), Prune.right(node));
      });
    };

    check({ stop: false, left: Option.none() }, 'house<span class="me"><br/><br/>Not');
    check({ stop: false, left: Option.none() }, '<span class="me">me</span>');
    check({ stop: true, left: Option.some([]) }, '<br class="me"/>');

  }
);
