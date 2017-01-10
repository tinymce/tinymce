define(
  'ephox.alloy.api.ui.TieredMenu',

  [
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.alloy.data.Fields',
    'ephox.alloy.ui.single.TieredMenuSpec',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.peanut.Fun'
  ],

  function (UiBuilder, Fields, TieredMenuSpec, FieldSchema, Objects, Fun) {
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

    var simpleData = function (name, label, items) {
      return {
        primary: name,
        menus: Objects.wrap(
          name,
          {
            value: name,
            text: label,
            items: items
          }
        ),
        expansions: { }
      };
    };

    var tieredData = function (primary, menus, expansions) {
      return {
        primary: primary,
        menus: menus,
        expansions: expansions
      };
    };

    var singleData = function (name, label, item) {
      return {
        primary: name,
        menus: Objects.wrap(name, {
          value: name,
          text: label,
          items: [ item ]
        }),
        expansions: { }
      };
    };

    return {
      build: build,
      simpleData: simpleData,
      tieredData: tieredData,
      singleData: singleData
    };
  }
);