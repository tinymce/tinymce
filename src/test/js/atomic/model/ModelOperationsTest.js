test(
  'ModelOperationsTest',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.scullion.Struct',
    'ephox.snooker.model.ModelOperations'
  ],

  function (Fun, Option, Struct, ModelOperations) {
    var nu = {
      lead: Struct.immutable('cell', 'rowspan', 'colspan'),
      bounds: Struct.immutable('startRow', 'startCol', 'finishRow', 'finishCol')
    };

    var generators = function () {
      var counter = 0;
      var prior = Option.none();
      var getOrInit = function (element, comparator) {
        return prior.fold(function () {
          var r = '?_' + counter;
          counter++;
          prior = Option.some({ item: element, sub: r });
          return r;
        }, function (p) {
          if (comparator(element, p.item)) {
            return p.sub;
          } else {
            var r = '?_' + counter;
            counter++;
            prior = Option.some({ item: element, sub: r });
            return r;
          }
        });
      };

      var nu = function () {
        return '?';
      };

      return {
        getOrInit: getOrInit,
        nu: nu
      };
    };

    var headerGenerators = function () {
      var counter = 0;

      // We need a store so row processing.
      var store = {};

      var replaceOrInit = function (element, comparator) {
        return Option.from(store[element]).fold(function () {
          var r = 'h(' + element + ')_' + counter;
          counter++;
          store[element] = { item: element, sub: r };
          return r;
        }, function (p) {
          if (comparator(element, p.item)) {
            return p.sub;
          } else {
            var r = 'h(' + element + ')_' + counter;
            counter++;
            store[element] = { item: element, sub: r };
            return r;
          }
        });
      };

      return {
        replaceOrInit: replaceOrInit
      };
    };

    // Test basic merge.
    (function () {
      var check = function (expected, grid, bounds, lead) {
        var actual = ModelOperations.merge(grid, bounds, Fun.tripleEquals, Fun.constant(lead));
        assert.eq(expected, actual);
      };

      check([], [], nu.bounds(0, 0, 1, 1), 'a');
      check([[ 'a', 'a' ]], [[ 'a', 'b' ]], nu.bounds(0, 0, 0, 1), 'a');
      check(
        [
          [ 'a', 'a' ],
          [ 'a', 'a' ]
        ],
        [
          [ 'a', 'b' ],
          [ 'c', 'd' ]
        ], nu.bounds(0, 0, 1, 1), 'a');
    })();

    // Test basic unmerge.
    (function () {
      var check = function (expected, grid, target) {
        var actual = ModelOperations.unmerge(grid, target, Fun.tripleEquals, Fun.constant('?'));
        assert.eq(expected, actual);
      };

      check([], [], 'a');
      check([[ 'a', '?' ]], [[ 'a', 'a' ]], 'a');
      check(
        [
          [ 'a', '?' ],
          [ '?', '?' ]
        ],
        [
          [ 'a', 'a' ],
          [ 'a', 'a' ]
        ], 'a'
      );
    })();

    // Test basic insert column
    (function () {
      var check = function (expected, grid, example, index) {
        var actual = ModelOperations.insertColumnAt(grid, index, example, Fun.tripleEquals, generators());
        assert.eq(expected, actual);
      };

      check([], [], 0, 0);
      check([[ '?_0' ]], [[ ]], 0, 0);
      check([[ '?_0', 'a' ]], [[ 'a' ]], 0, 0);
      check([[ 'a', '?_0' ]], [[ 'a' ]], 0, 1);
      check(
        [
          [ 'a', '?_0' ],
          [ 'b', '?_1' ]
        ],
        [
          [ 'a' ],
          [ 'b' ]
        ], 0, 1
      );
      check(
        [
          [ '?_0', 'a' ],
          [ '?_1', 'b' ]
        ],
        [
          [ 'a' ],
          [ 'b' ]
        ], 0, 0
      );
      // Spanning check.
      check(
        [
          [ 'a', 'a', 'a' ],
          [ 'b', '?_0', 'c' ]
        ],
        [
          [ 'a', 'a' ],
          [ 'b', 'c' ]
        ], 0, 1
      );
      check(
        [
          [ 'a', 'b', '?_0' ],
          [ 'c', 'b', '?_0' ],
          [ 'c', 'd', '?_1' ]
        ],
        [
          [ 'a', 'b' ],
          [ 'c', 'b' ],
          [ 'c', 'd' ]
        ], 1, 2
      );

      // Copying the target row with a column
    })();

    // Test basic insert row
    (function () {
      var check = function (expected, grid, example, index) {
        var actual = ModelOperations.insertRowAt(grid, index, example, Fun.tripleEquals, generators());
        assert.eq(expected, actual);
      };

      check([[ '?_0' ], [ 'a' ]], [[ 'a' ]], 0, 0);
      check([[ 'a' ], [ '?_0' ]], [[ 'a' ]], 0, 1);
      check([[ 'a', 'b' ], [ '?_0', '?_1' ]], [[ 'a', 'b' ]], 0, 1);
      check([[ 'a', 'a' ], [ '?_0', '?_0' ]], [[ 'a', 'a' ]], 0, 1);

      check(
        [
          [ 'a', 'a', 'b' ],
          // *********** Should this really be ?_0 in the 2nd column? Shouldn't it be ?_1?
          [ '?_0', '?_0', 'b' ],
          [ 'c', 'd', 'b' ]
        ],
        [
          [ 'a', 'a', 'b' ],
          [ 'c', 'd', 'b' ]
        ], 0, 1);
    })();

    // Test basic delete column
    (function () {
      var check = function (expected, grid, index) {
        var actual = ModelOperations.deleteColumnAt(grid, index, Fun.tripleEquals);
        assert.eq(expected, actual);
      };

      check([[ ]], [[ 'a' ]], 0);
      check([[ 'b' ]], [[ 'a', 'b' ]], 0);
      check(
        [
          [ 'a', 'b' ], 
          [ 'c', 'c' ]
        ], 
        [
          [ 'a', 'b', 'b' ],
          [ 'c', 'c', 'c' ]
        ], 1);
    })();

    // Test basic delete row
    (function () {
      var check = function (expected, grid, index) {
        var actual = ModelOperations.deleteRowAt(grid, index, Fun.tripleEquals);
        assert.eq(expected, actual);
      };

      check([], [[ 'a' ]], 0);
      check([[ 'b' ]], [[ 'a' ], [ 'b' ]], 0);
      check(
        [
          [ 'a', 'b', 'b' ], 
          [ 'c', 'c', 'c' ]
        ], 
        [
          [ 'a', 'b', 'b' ],
          [ 'a', 'b', 'b' ],
          [ 'c', 'c', 'c' ]
        ], 1);
    })();

    // Test basic changing to header (column)
    (function () {
      var check = function (expected, grid, index) {
        var actual = ModelOperations.replaceColumn(grid, index, Fun.tripleEquals, headerGenerators());
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
        var actual = ModelOperations.replaceRow(grid, index, Fun.tripleEquals, headerGenerators());
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

      // check([
      //   [ 'h(a)_0', 'h(a)_0', 'h(a)_0' ],
      //   [ 'h(a)_0', 'h(a)_0', 'h(a)_0' ],
      //   [ 'h(b)_1', 'c', 'd' ],
      //   [ 'h(f)_2', 'h(f)_2', 'h(f)_2' ]
      // ], [
      //   [ 'a', 'a', 'a' ],
      //   [ 'a', 'a', 'a' ],
      //   [ 'b', 'c', 'd' ],
      //   [ 'f', 'f', 'f' ]
      // ], 0);
    })();
  }
);