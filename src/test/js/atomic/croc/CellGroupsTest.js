test(
  'CellGroupsTest',

  [
    'ephox.compass.Arr',
    'ephox.snooker.croc.CellGroups',
    'ephox.snooker.croc.CellLookup',
    'ephox.snooker.croc.Spanning'
  ],

  function (Arr, CellGroups, CellLookup, Spanning) {
    var stringify = function (input) {
      return input.fold(function (info) {
        return 'whole-' + info.id();
      }, function (info, offset) {
        return 'partial-' + info.id() + '-' + offset;
      });
    };

    // var check = function (expected, input, column) {
    //   var model = CellLookup.model(input);
    //   var actual = CellGroups.column(model, column);
    //   assert.eq(expected, Arr.map(actual, stringify));
    // };

    // check([
    //   'whole-a',
    //   'partial-c-0'
    // ], [
    //   [ Spanning('a', 1, 1), Spanning('b', 1, 1) ],
    //   [ Spanning('c', 1, 2)]
    // ], 0);

    // check([
    //   'whole-b',
    //   'partial-c-1'
    // ], [
    //   [ Spanning('a', 1, 1), Spanning('b', 1, 1) ],
    //   [ Spanning('c', 1, 2)]
    // ], 1);

    var stringify2 = function (input) {
      return input.id() + '---' + input.rowspan() + 'x' + input.colspan();
    };

    // var check2 = function (expected, input, column) {
    //   var actual = CellGroups.insertAfterCol(input, column);
    //   var easy = Arr.map(actual, function (a) {
    //     return Arr.map(a, stringify2);
    //   });
    //   assert.eq(expected, easy);
    // };

    // check2([
    //   [ 'a---1x1', 'b---1x1' ],
    //   [ 'c---1x2' ]
    // ], [
    //   [ Spanning('a', 1, 1), Spanning('b', 1, 1) ],
    //   [ Spanning('c', 1, 2)]
    // ], 0);


    (function () {
      var input = [
        [ Spanning('a', 1, 1), Spanning('b', 1, 1) ],
        [ Spanning('c', 1, 2)]
      ];
      var model = CellLookup.model(input);

      var col = 0;
      var actual = CellGroups.columnContext(model, col);
      console.log('actual: ', Arr.map(actual, function (a) {
        return Arr.map(a.before(), stringify2) + ' >>> ' + stringify(a.on()) + ' <<< ' + Arr.map(a.after(), stringify2);
      }));
    })();

  }
);
