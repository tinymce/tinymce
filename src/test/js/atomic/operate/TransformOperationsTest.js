test(
  'TransformOperationsTest',

  {
    'ephox.sugar.api.Css': '../mock/ephox/sugar/api/Css',
    'ephox.sugar.api.Attr': '../mock/ephox/sugar/api/Attr'
  },

  [
    'ephox.peanut.Fun',
    'ephox.snooker.api.Generators',
    'ephox.snooker.operate.TransformOperations',
    'ephox.snooker.test.TestGenerator'
  ],

  function (Fun, Generators, TransformOperations, TestGenerator) {

    // Test basic changing to header (column)
    (function () {
      var check = function (expected, grid, index) {
        var actual = TransformOperations.replaceColumn(grid, index, Fun.tripleEquals, Generators.transform('scope', 'tag')(TestGenerator(), Fun.identity).replaceOrInit);
        assert.eq(expected, actual);
      };

      check([[]], [[]], 0);
      check([
        [ 'h(a)_0' ]
      ], [
        [ 'a' ]
      ], 0);

      check([
        [ 'a', 'a', 'a' ],
        [ 'b', 'h(c)_0', 'd' ],
        [ 'e', 'h(f)_1', 'h(f)_1' ]
      ], [
        [ 'a', 'a', 'a' ],
        [ 'b', 'c', 'd' ],
        [ 'e', 'f', 'f' ]
      ], 1);

      check([
        [ 'a', 'a', 'a' ],
        [ 'b', 'h(c)_0', 'd' ],
        [ 'f', 'f', 'f' ]
      ], [
        [ 'a', 'a', 'a' ],
        [ 'b', 'c', 'd' ],
        [ 'f', 'f', 'f' ]
      ], 1);

      check([
        [ 'h(a)_0', 'h(a)_0', 'h(a)_0' ],
        [ 'h(b)_1', 'c', 'd' ],
        [ 'h(f)_2', 'h(f)_2', 'h(f)_2' ]
      ], [
        [ 'a', 'a', 'a' ],
        [ 'b', 'c', 'd' ],
        [ 'f', 'f', 'f' ]
      ], 0);

      check([
        [ 'h(a)_0', 'h(a)_0', 'h(a)_0' ],
        [ 'h(a)_0', 'h(a)_0', 'h(a)_0' ],
        [ 'h(b)_1', 'c', 'd' ],
        [ 'h(f)_2', 'h(f)_2', 'h(f)_2' ]
      ], [
        [ 'a', 'a', 'a' ],
        [ 'a', 'a', 'a' ],
        [ 'b', 'c', 'd' ],
        [ 'f', 'f', 'f' ]
      ], 0);
    })();

    // Test basic changing to header (row)
    (function () {
      var check = function (expected, grid, index) {
        var actual = TransformOperations.replaceRow(grid, index, Fun.tripleEquals, Generators.transform('scope', 'tag')(TestGenerator(), Fun.identity).replaceOrInit);
        assert.eq(expected, actual);
      };

      check([[]], [[]], 0);
      check([
        [ 'h(a)_0' ]
      ], [
        [ 'a' ]
      ], 0);

      check([
        [ 'a', 'b', 'e' ],
        [ 'a', 'h(c)_0', 'h(f)_1' ],
        [ 'a', 'd', 'h(f)_1' ]
      ], [
        [ 'a', 'b', 'e' ],
        [ 'a', 'c', 'f' ],
        [ 'a', 'd', 'f' ]
      ], 1);

      check([
        [ 'a', 'b', 'f' ],
        [ 'a', 'h(c)_0', 'f' ],
        [ 'a', 'd', 'f' ]
      ], [
        [ 'a', 'b', 'f' ],
        [ 'a', 'c', 'f' ],
        [ 'a', 'd', 'f' ]
      ], 1);

     check([
        [ 'h(a)_0', 'h(b)_1', 'h(f)_2' ],
        [ 'h(a)_0', 'c', 'h(f)_2' ],
        [ 'h(a)_0', 'd', 'h(f)_2' ]
      ], [
        [ 'a', 'b', 'f' ],
        [ 'a', 'c', 'f' ],
        [ 'a', 'd', 'f' ]
      ], 0);

      check([
        [ 'h(a)_0', 'h(a)_0', 'h(b)_1', 'h(f)_2' ],
        [ 'h(a)_0', 'h(a)_0', 'c', 'h(f)_2' ],
        [ 'h(a)_0', 'h(a)_0', 'd', 'h(f)_2' ]
      ], [
        [ 'a', 'a', 'b', 'f' ],
        [ 'a', 'a', 'c', 'f' ],
        [ 'a', 'a', 'd', 'f' ]
      ], 0);
    })();
  }
);