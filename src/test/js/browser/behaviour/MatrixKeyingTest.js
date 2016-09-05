asynctest(
  'Matrix Keying Test',
 
  [
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.NavigationUtils',
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr'
  ],
 
  function (FocusTools, Keyboard, Keys, GuiFactory, EventHandler, GuiSetup, NavigationUtils, Objects, Arr) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var cells = [
      'c01', 'c02', 'c03', 'c04', 'c05', 'c06',
      'c07', 'c08', 'c09', 'c10', 'c11', 'c12',
      'c13', 'c14', 'c15', 'c16', 'c17', 'c18',
      'c19', 'c20', 'c21'
    ];

    GuiSetup.setup(function (store, doc, body) {
      var rows = Arr.chunk(cells, 6);

      var item = function (classes) {
        return {
          uiType: 'custom',
          dom: {
            tag: 'span',
            styles: {
              display: 'inline-block',
              width: '20px',
              height: '20px',
              margin: '1px',
              border: '1px solid black'
            },
            classes: [ 'cell' ].concat(classes)
          },
          events: {
            'alloy.execute': EventHandler.nu({
              run: store.adder('item.execute: ' + classes.join(','))
            })
          },
          focusing: true
        };
      };

      return GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div',
          classes: [ 'matrix-keying-test'],
          styles: {
            background: 'white',
            width: '150px',
            height: '200px'
          }
        },
        uid: 'custom-uid',
        keying: {
          mode: 'matrix',
          selectors: {
            row: '.row',
            cell: '.cell'
          }
        },
        // 4 x 6 grid size
        components: Arr.map(rows, function (row) {
          return {
            uiType: 'custom',
            dom: {
              tag: 'span',
              classes: [ 'row' ]
            },
            components: Arr.map(row, function (c) {
              return item([ c ]);
            })
          };
        })
      });

    }, function (doc, body, gui, component, store) {

      var targets = Objects.wrapAll(
        Arr.map(cells, function (sq) {
          return {
            key: sq,
            value: {
              label: sq,
              selector: '.' + sq
            }
          };
        })
      );
      console.log('targets', targets);

      return [
        FocusTools.sSetFocus('Initial focus', gui.element(), '.c11'),
        NavigationUtils.sequence(
          doc,
          Keys.down(),
          {},
          [
            targets.c17,
            targets.c21,
            targets.c03,
            targets.c09,
            targets.c15,
            targets.c21,
            targets.c03
          ]
        ),
        NavigationUtils.sequence(
          doc,
          Keys.left(),
          {  },
          [
            targets.c02,
            targets.c01,
            targets.c06,
            targets.c05,
            targets.c04,
            targets.c03,
            targets.c02,
            targets.c01,
            targets.c06
          ]
        ),
        NavigationUtils.sequence(
          doc,
          Keys.up(),
          {  },
          [
            targets.c21,
            targets.c15,
            targets.c09,
            targets.c03,
            targets.c21,
            targets.c15,
            targets.c09,
            targets.c03,
            targets.c21
          ]
        ),
        NavigationUtils.sequence(
          doc,
          Keys.right(),
          {  },
          [
            targets.c19,
            targets.c20,
            targets.c21,
            targets.c19,
            targets.c20,
            targets.c21
          ]
        ),

        NavigationUtils.sequence(
          doc,
          Keys.left(),
          {  },
          [
            targets.c20,
            targets.c19,
            targets.c21,
            targets.c20,
            targets.c19,
            targets.c21
          ]
        ),

        // Test execute
        Keyboard.sKeydown(doc, Keys.enter(), {}),
        store.sAssertEq(
          'Execute should have c21',
          [ 'item.execute: c21' ]
        )

        // function () { }
      ];
    }, function () {
      success();
    }, failure);
  }
);