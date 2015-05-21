test(
  'MaurizioTest',

  [
    'ephox.snooker.model.Warefun'
  ],

  function (Warefun) {
    /* global assert */


    var structure = [
      [ 1, 1, 1, 2, 3 ],
      [ 1, 1, 1, 4, 5 ]
    ];


    var result = [{
      element: 'row',
      cells: [
        {
          element: 1,
          colspan: 2,
          rowspan: 3
        },
        {
          element: 2,
          colspan: 1,
          rowspan: 1
        },
        {
          element: 3,
          colspan: 1,
          rowspan: 1
        }
      ]
    },
    {
      element: 'row',
      cells: [
        {
          element: 4,
          colspan: 1,
          rowspan: 1
        },
        {
          element: 5,
          colspan: 1,
          rowspan: 1
        }
      ]
    }];






    var something = Warefun.render(structure);

    console.log('something',something);



  }
);