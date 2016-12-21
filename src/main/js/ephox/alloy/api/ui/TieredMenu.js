define(
  'ephox.alloy.api.ui.TieredMenu',

  [
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.alloy.data.Fields',
    'ephox.alloy.ui.single.TieredMenuSpec',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun'
  ],

  function (UiBuilder, Fields, TieredMenuSpec, FieldSchema, Fun) {
    var schema = [
      FieldSchema.strict('onExecute'),
      FieldSchema.strict('onEscape'),

      FieldSchema.strict('onOpenMenu'),
      FieldSchema.strict('onOpenSubmenu'),

      FieldSchema.defaulted('openImmediately', true),

      FieldSchema.strictObjOf('data', [
        FieldSchema.strict('primary'),
        FieldSchema.strict('menus'),
        FieldSchema.strict('expansions')
      ]),

    
      FieldSchema.defaulted('fakeFocus', false),
      FieldSchema.defaulted('onHighlight', Fun.noop),
      FieldSchema.defaulted('onHover', Fun.noop),
      Fields.tieredMenuMarkers(),
      Fields.members([ 'menu', 'item' ])
    ];

    var build = function (spec) {
      return UiBuilder.single('TieredMenu', schema, TieredMenuSpec.make, spec);
    };

    return {
      build: build
    };
  }
);