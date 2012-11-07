test(
  'PreBlockTest',

  [
    'ephox.perhaps.Option',
    'ephox.robin.prune.PreBlock',
    'ephox.robin.test.Assertions',
    'ephox.robin.test.BrowserCheck'
  ],

  function (Option, PreBlock, Assertions, BrowserCheck) {

    var check = function (expected, input) {
      BrowserCheck.run(input, function (node) {
        assert.eq(expected.stop, PreBlock.stop(node));
        Assertions.assertOpt(expected.left, PreBlock.left(node));
        Assertions.assertOpt(Option.some([]), PreBlock.right(node));
      });
    };

    check({ stop: false, left: Option.none() }, 'house<span class="me"><br/><br/>Not');
    check({ stop: false, left: Option.none() }, '<span class="me">me</span>');
    check({ stop: true, left: Option.some([]) }, '<br class="me"/>');

  }
);
