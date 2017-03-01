define(
  'ephox.alloy.ui.schema.TieredMenuSchema',

  [
    'ephox.alloy.data.Fields',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (Fields, FieldSchema, Fun) {
    var schema = [
      Fields.onStrictKeyboardHandler('onExecute'),
      Fields.onStrictKeyboardHandler('onEscape'),

      Fields.onStrictHandler('onOpenMenu'),
      Fields.onStrictHandler('onOpenSubmenu'),

      FieldSchema.defaulted('openImmediately', true),

      FieldSchema.strictObjOf('data', [
        FieldSchema.strict('primary'),
        FieldSchema.strict('menus'),
        FieldSchema.strict('expansions')
      ]),
    
      FieldSchema.defaulted('fakeFocus', false),
      Fields.onHandler('onHighlight'),
      Fields.onHandler('onHover'),
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