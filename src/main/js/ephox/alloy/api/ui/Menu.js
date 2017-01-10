define(
  'ephox.alloy.api.ui.Menu',

  [
    'ephox.alloy.api.focus.FocusManagers',
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.alloy.data.Fields',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.alloy.ui.single.MenuSpec',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (FocusManagers, UiBuilder, Fields, UiSubstitutes, MenuSpec, FieldSchema, ValueSchema, Merger, Fun) {
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
      items: Fun.constant({
        uiType: UiSubstitutes.placeholder(), name: '<alloy.menu.items>', owner: 'menu' 
      })
    };

    var itemType = function (type) {
      return function (spec) {
        return Merger.deepMerge(spec, { type: type });
      };
    };

    

    return {
      build: build,
      parts: Fun.constant(parts),

      item: itemType('item'),
      widget: itemType('widget'),
      separator: itemType('separator')
    };
  }
);