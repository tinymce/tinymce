test(
  'MaurizioTest',

  [
    'ephox.compass.Obj',
    'ephox.snooker.model.Warefun'
  ],

  function (Obj, Warefun) {
    /* global assert */


    var testA = [
      [ 'td1', 'td1', 'td1', 'td2', 'td3' ]
    ];

    var expectedA = [{
      element: 'row',
      cells: [
        {
          element: 'td1',
          colspan: 1,
          rowspan: 3
        },
        {
          element: 'td2',
          colspan: 1,
          rowspan: 1
        },
        {
          element: 'td3',
          colspan: 1,
          rowspan: 1
        }
      ]
    }];






    var resultA = Warefun.render(testA);
    console.dir(resultA)
    console.log('resultA', resultA);
    // console.log('expectedA', expectedA);
    // assert.eq(resultA, expectedA);

    console.log('resultA',resultA);



  }
);