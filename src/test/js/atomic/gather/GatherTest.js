test('Gathering',
  {
    'ephox.sugar.api.Traverse': '../mock/ephox/sugar/api/Traverse',
    'ephox.sugar.api.Compare': '../mock/ephox/sugar/api/Compare'
  },

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.phoenix.gather.Gather',
    'ephox.phoenix.gather.GatherResult',
    'ephox.sugar.api.Traverse'
  ],

  function (Arr, Option, Gather, GatherResult, Traverse) {

    var pruner = function (elems) {
      var stop = function (x) {
        return Arr.contains(elems, x);
      };

      var left = function (x) {
        return stop(x) ? Option.some(['<' + x]) : Option.none();
      };

      var right = function (x) {
        return stop(x) ? Option.some([x + '>']) : Option.none();
      };

      return {
        stop: stop,
        left: left,
        right: right
      };
    };

    var f = function (iterator, x, prune) {
      var children = Traverse.children(x);
      return children.length > 0 ? iterator(children, f, prune) : GatherResult([x], false);
    };

    var check = function (left, right, element, prunes) {
      var prune = pruner(prunes);
      var actual = Gather.gather(element, prune, f);
      assert.eq(left, actual.left());
      assert.eq(element, actual.element());
      assert.eq(right, actual.right());
    };

    check(['aaa'], ['aac', 'aba', 'abb'], 'aab', ['a']);
    check(['aaa', 'aab', 'aac', 'aba', 'abb', 'ba'], ['cb', 'cca', 'd'], 'caaa', []);
    check(['aaa', 'aab', 'aac', 'aba', 'abb', 'ba', 'caaa'], ['cca', 'd'], 'cb', []);
    check(['<b', 'caaa'], ['cca', 'd'], 'cb', ['b']);
    check(['aaa', 'aab'], [], 'aac', ['aa']);
    check(['<aa'], ['abb', 'ba', 'c>'], 'aba', ['aa', 'c']);
  }
);
