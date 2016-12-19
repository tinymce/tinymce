define(
  'ephox.alloy.api.ui.Menu',

  [
    'ephox.alloy.api.focus.FocusManagers',
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.alloy.data.Fields',
    'ephox.alloy.ui.single.MenuSpec',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (FocusManagers, UiBuilder, Fields, MenuSpec, FieldSchema, ValueSchema, Fun) {
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

    var build = function (spec) {
      return UiBuilder.single('menu', schema, MenuSpec.make, spec);
    };

    var parts = {
      // FIX
      items: Fun.constant({
        uiType: 'placeholder', name: '<alloy.menu.items>', owner: 'menu' 
      })
    };

    return {
      build: build,
      parts: Fun.constant(parts)
    };
  }
);