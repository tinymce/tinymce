test(
  'MaurizioTest',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.model.Warefun',
    'ephox.snooker.model.Warehouse'
  ],

  function (Arr, Fun, Warefun, Warehouse) {
    /* global assert */
    var check = function (expected, list) {
      var warehouse = Warehouse.generate(list);
      // generate new warehouse based on an operation
      var actual = Warefun.render(warehouse);
      assert.eq(expected.length, actual.length);

      Arr.each(expected, function (exp, i) {

        assert.eq(exp.element, actual[i].element());

        Arr.each(exp.cells, function (expc, j) {
          assert.eq(expc.colspan, actual[i].cells()[j].colspan());
          assert.eq(expc.rowspan, actual[i].cells()[j].rowspan());
        });
      });
    };


    check([
      {
        element: 'row',
        cells: [
          { element: 'a', colspan: 3  , rowspan: 1 }
        ]
      }
    ], [
      {
        element: Fun.constant('row'),
        cells: Fun.constant([
          { element: Fun.constant('a'), colspan: Fun.constant(3), rowspan: Fun.constant(1) }
        ])
      }
    ]);


  }
);