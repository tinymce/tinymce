test(
  'TableCounterTest',

  [
    'ephox.compass.Obj',
    'ephox.peanut.Fun',
    'ephox.snooker.model.Warefun'
  ],

  function (Obj, Fun, Warefun) {
    // if(true) return;
    /* global assert */
    var testA = [
      [ 'td1', 'td1', 'td1', 'td2', 'td3' ]
    ];

    var expectedA = [{
      element: 'tr',
      cells: [
        {
          element: 'td1',
          colspan: 3,
          rowspan: 1
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

    var testB = [
      [ 'td1', 'td1', 'td1' ],
      [ 'td1', 'td1', 'td1' ],
      [ 'td1', 'td1', 'td1' ],
      [ 'td1', 'td1', 'td1' ]
    ];

    var expectedB = [
      {
        element: 'tr',
        cells: [
          {
            element: 'td1',
            colspan: 3,
            rowspan: 4
          }
        ]
      },

      {
        element: 'tr',
        cells: []
      },
      {
        element: 'tr',
        cells: []
      },
      {
        element: 'tr',
        cells: []
      }
    ];

    var testC = [
      [ 'td1', 'td1', 'td1' ],
      [ 'td1', 'td1', 'td1' ]
    ];

    var expectedC = [
      {
        element: 'tr',
        cells: [
          {
            element: 'td1',
            colspan: 3,
            rowspan: 2
          }
        ]
      },

      {
        element: 'tr',
        cells: []
      }
    ];

    var testD = [
      [ 'td1', 'td1', 'td3' ],
      [ 'td1', 'td1', 'td4' ]
    ];

    var expectedD = [
      {
        element: 'tr',
        cells: [{
            element: 'td1',
            colspan: 2,
            rowspan: 2
          },
          {
            element: 'td3',
            colspan: 1,
            rowspan: 1
          }]
      },
      {
        element: 'tr',
        cells: [{
            element: 'td4',
            colspan: 1,
            rowspan: 1
        }]
      }
    ];

    var testE = [
      [ 'td1', 'td1', 'td3' ],
      [ 'td1', 'td1', 'td4' ],
      [ 'td2', 'td2', 'td4' ],
      [ 'td5', 'td6', 'td6' ]
    ];

    var expectedE = [
      {
        element: 'tr',
        cells: [{
            element: 'td1',
            colspan: 2,
            rowspan: 2
          },
          {
            element: 'td3',
            colspan: 1,
            rowspan: 1
          }]
      },
      {
        element: 'tr',
        cells: [{
            element: 'td4',
            colspan: 1,
            rowspan: 2
        }]
      },
      {
        element: 'tr',
        cells: [{
            element: 'td2',
            colspan: 2,
            rowspan: 1
        }]
      },
      {
        element: 'tr',
        cells: [{
            element: 'td5',
            colspan: 1,
            rowspan: 1
        },
        {
            element: 'td6',
            colspan: 2,
            rowspan: 1
        }]
      }
    ];


    var checkRender = function (expected, input) {
      var actual = Warefun.render(input, Fun.tripleEquals);
      assert.eq(expected, actual);
    };

    checkRender(expectedA, testA);
    checkRender(expectedB, testB);
    checkRender(expectedC, testC);
    checkRender(expectedD, testD);
    checkRender(expectedE, testE);


  }
);