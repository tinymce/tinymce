test(
  'TransformOperationsTest',

  {
    'ephox.syrup.api.Css': '../mock/ephox/syrup/api/Css',
    'ephox.syrup.api.Attr': '../mock/ephox/syrup/api/Attr'
  },

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.api.Generators',
    'ephox.snooker.api.Structs',
    'ephox.snooker.operate.TransformOperations',
    'ephox.snooker.test.TestGenerator'
  ],

  function (Arr, Fun, Generators, Structs, TransformOperations, TestGenerator) {

    var mapToStructGrid = function (grid) {
      return Arr.map(grid, function (row) {
        return Structs.rowcells(row, 'tbody');
      });
    };

    var assertGrids = function (expected, actual) {
      assert.eq(expected.length, actual.length);
      Arr.each(expected, function (row, i) {
        assert.eq(row.cells(), actual[i].cells());
        assert.eq(row.section(), actual[i].section());
      });
    };
    
    // Test basic changing to header (column)
    (function () {
      var check = function (expected, grid, index) {
        var structExpected = mapToStructGrid(expected);
        var structGrid = mapToStructGrid(grid);
        var actual = TransformOperations.replaceColumn(structGrid, index, Fun.tripleEquals, Generators.transform('scope', 'tag')(TestGenerator(), Fun.identity).replaceOrInit);
        assertGrids(structExpected, actual);
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
        var structExpected = mapToStructGrid(expected);
        var structGrid = mapToStructGrid(grid);
        var actual = TransformOperations.replaceRow(structGrid, index, Fun.tripleEquals, Generators.transform('scope', 'tag')(TestGenerator(), Fun.identity).replaceOrInit);
        assertGrids(structExpected, actual);
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