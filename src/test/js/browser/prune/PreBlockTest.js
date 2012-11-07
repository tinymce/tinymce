test(
  'PreBlockTest',

  [
    'ephox.perhaps.Option',
    'ephox.robin.prune.PreBlock',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Traverse'
  ],

  function (Option, PreBlock, Element, Insert, Remove, SelectorFind, Traverse) {

    var body = SelectorFind.first('body').getOrDie();

    var getNode = function (container) {
      return SelectorFind.descendant(container, '.me').fold(function () {
        return SelectorFind.descendant(container, '.child').bind(Traverse.firstChild);
      }, function (v) {
        return Option.some(v);
      }).getOrDie();
    };

    var assertOpt = function (o1, o2) {
      o1.fold(function () {
        assert.eq(true, o2.isNone());
      }, function (v) {
        o2.fold(function () {
          assert.fail('Expected some, was none.');
        }, function (vv) {
          assert.eq(v, vv);
        });
      });
    };

    var check = function (expected, input) {
      var container = Element.fromTag('div');
      Insert.append(body, container);
      container.dom().innerHTML = input;
      var node = getNode(container);

      assert.eq(expected.stop, PreBlock.stop(node));
      assertOpt(expected.left, PreBlock.left(node));
      assertOpt(Option.some([]), PreBlock.right(node));
      Remove.remove(container);
    };

    check({ stop: false, left: Option.none() }, 'house<span class="me"><br/><br/>Not');
    check({ stop: false, left: Option.none() }, '<span class="me">me</span>');
    check({ stop: true, left: Option.some([]) }, '<br class="me"/>');

  }
);
