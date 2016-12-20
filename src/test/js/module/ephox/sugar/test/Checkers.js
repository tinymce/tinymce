define(
  'ephox.sugar.test.Checkers',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Node'
  ],

  function (Arr, Fun, Compare, Node) {
    var expectedSome = Fun.curry(assert.fail, 'Expected actual to be some, was none');

    var checkOpt = function (expected, actual) {
      expected.fold(function () {
        assert.eq(true, actual.isNone(), 'Expected actual to be none, was some');
      }, function (v) {
        actual.fold(expectedSome, function (vv) {
          assert.eq(true, Compare.eq(v, vv));
        });
      });
    };

    var checkList = function (expected, actual) {
      assert.eq(expected.length, actual.length);
      Arr.each(expected, function (x, i) {
        assert.eq(true, Compare.eq(expected[i], actual[i]));
      });
    };

    var isName = function (name) {
      return function (x) {
        return Node.name(x) === name;
      };
    };

    return {
      checkOpt: checkOpt,
      checkList: checkList,
      isName: isName
    };
  }
);
