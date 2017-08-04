define(
  'ephox.alloy.api.ui.TieredMenu',

  [
    'ephox.alloy.api.ui.Sketcher',
    'ephox.alloy.data.Fields',
    'ephox.alloy.ui.single.TieredMenuSpec',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Id'
  ],

  function (Sketcher, Fields, TieredMenuSpec, FieldSchema, Objects, Id) {
    var tieredData = function (primary, menus, expansions) {
      return {
        primary: primary,
        menus: menus,
        expansions: expansions
      };
    };

    var singleData = function (name, menu) {
      return {
        primary: name,
        menus: Objects.wrap(name, menu),
        expansions: { }
      };
    };

    var collapseItem = function (text) {
      return {
        value: Id.generate(TieredMenuSpec.collapseItem()),
        text: text
      };
    };

    return Sketcher.single({
      name: 'TieredMenu',
      configFields: [
        Fields.onStrictKeyboardHandler('onExecute'),
        Fields.onStrictKeyboardHandler('onEscape'),

        Fields.onStrictHandler('onOpenMenu'),
        Fields.onStrictHandler('onOpenSubmenu'),
        Fields.onHandler('onCollapseMenu'),

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


        FieldSchema.strict('dom'),

        FieldSchema.defaulted('navigateOnHover', true),
        FieldSchema.defaulted('stayInDom', false),

        FieldSchema.defaulted('tmenuBehaviours', { }),
        FieldSchema.defaulted('eventOrder', { })
      ],

      factory: TieredMenuSpec.make,

      extraApis: {
        tieredData: tieredData,
        singleData: singleData,
        collapseItem: collapseItem
      }
    });
  }
);