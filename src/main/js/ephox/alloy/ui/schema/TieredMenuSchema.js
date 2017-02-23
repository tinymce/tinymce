define(
  'ephox.alloy.ui.schema.TieredMenuSchema',

  [
    'ephox.alloy.data.Fields',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (Fields, FieldSchema, Fun) {
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

    return {
      name: Fun.constant('TieredMenu'),
      schema: Fun.constant(schema),
      parts: Fun.constant([ ])
    };
  }
);