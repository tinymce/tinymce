test(
  'leftblock :: Prune',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.perhaps.Option',
    'ephox.robin.leftblock.Prune',
    'ephox.robin.test.Assertions',
    'ephox.robin.test.BrowserCheck'
  ],

  function (DomUniverse, Option, Prune, Assertions, BrowserCheck) {
    var prune = Prune(DomUniverse());

    var check = function (expected, input) {
      BrowserCheck.run(input, function (node) {
        assert.eq(expected.stop, prune.stop(node));
        Assertions.assertOpt(expected.left, prune.left(node));
        Assertions.assertOpt(Option.some([]), prune.right(node));
      });
    };

    check({ stop: false, left: Option.none() }, 'house<span class="me"><br/><br/>Not');
    check({ stop: false, left: Option.none() }, '<span class="me">me</span>');
    check({ stop: true, left: Option.some([]) }, '<br class="me"/>');

  }
);
