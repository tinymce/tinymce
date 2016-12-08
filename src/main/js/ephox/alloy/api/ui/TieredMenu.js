define(
  'ephox.alloy.api.ui.TieredMenu',

  [
    'ephox.alloy.data.Fields',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.ui.single.TieredMenuSpec',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun'
  ],

  function (Fields, SpecSchema, TieredMenuSpec, FieldSchema, Fun) {
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
      Fields.tieredMenuMarkers(),
      Fields.members([ 'menu', 'item' ])
    ];

    var build = function (f) {
      var rawUiSpec = f();
      var uiSpec = SpecSchema.asStructOrDie('TieredMenu', schema, rawUiSpec, [ ]);
      return TieredMenuSpec.make(uiSpec, rawUiSpec);
    };

    return {
      build: build
    };
  }
);