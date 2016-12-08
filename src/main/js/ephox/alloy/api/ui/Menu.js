define(
  'ephox.alloy.api.ui.Menu',

  [
    'ephox.alloy.api.focus.FocusManagers',
    'ephox.alloy.data.Fields',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.ui.single.MenuSpec',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (FocusManagers, Fields, Tagger, SpecSchema, MenuSpec, FieldSchema, ValueSchema, Merger, Fun) {
    var schema = [
      FieldSchema.strict('value'),
      FieldSchema.strict('items'),
      FieldSchema.strict('dom'),
      FieldSchema.strict('components'),


      FieldSchema.defaultedOf('movement', {
        mode: 'menu',
        moveOnTab: true
      }, ValueSchema.choose(
        'mode',
        {
          grid: [
            Fields.initSize(),
            FieldSchema.state('config', function () {
              return function (detail, movementInfo) {
                return {
                  mode: 'flatgrid',
                  selector: '.' + detail.markers().item(),
                  initSize: {
                    numColumns: movementInfo.initSize().numColumns(),
                    numRows: movementInfo.initSize().numRows()
                  },
                  focusManager: detail.focusManager()
                };
              };
            })
          ],
          menu: [
            FieldSchema.defaulted('moveOnTab', true),
            FieldSchema.state('config', function () {
              return function (detail, movementInfo) {
                return {
                  mode: 'menu',
                  selector: '.' + detail.markers().item(),
                  moveOnTab: movementInfo.moveOnTab(),
                  focusManager: detail.focusManager()
                };
              };
            })
          ]
        }
      )),

      Fields.itemMarkers(),

      Fields.members([ 'item' ]),
      FieldSchema.defaulted('shell', false),

      FieldSchema.defaulted('fakeFocus', false),
      FieldSchema.defaulted('focusManager', FocusManagers.dom()),
      FieldSchema.defaulted('onHighlight', Fun.noop)
    ];

    // FIX: Dupe
    var build = function (f) {
      var rawUiSpec = Merger.deepMerge({ uid: Tagger.generate('') }, f());
      var uiSpec = SpecSchema.asStructOrDie('Menu', schema, rawUiSpec, [ ]);
      return MenuSpec.make(uiSpec, rawUiSpec);
    };

    return {
      build: build
    };
  }
);