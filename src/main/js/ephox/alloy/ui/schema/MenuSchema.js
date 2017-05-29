define(
  'ephox.alloy.ui.schema.MenuSchema',

  [
    'ephox.alloy.api.focus.FocusManagers',
    'ephox.alloy.data.Fields',
    'ephox.alloy.menu.build.ItemType',
    'ephox.alloy.menu.build.SeparatorType',
    'ephox.alloy.menu.build.WidgetType',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.registry.Tagger',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger'
  ],

  function (FocusManagers, Fields, ItemType, SeparatorType, WidgetType, PartType, Tagger, FieldSchema, ValueSchema, Fun, Merger) {
    var itemSchema = ValueSchema.choose(
      'type',
      {
        widget: WidgetType,
        item: ItemType,
        separator: SeparatorType
      }
    );

    var configureGrid = function (detail, movementInfo) {
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

    var configureMenu = function (detail, movementInfo) {
      return {
        mode: 'menu',
        selector: '.' + detail.markers().item(),
        moveOnTab: movementInfo.moveOnTab(),
        focusManager: detail.focusManager()
      };
    };

    var parts = [
      PartType.group({
        factory: {
          sketch: function (spec) {
            var itemInfo = ValueSchema.asStructOrDie('menu.spec item', itemSchema, spec);
            return itemInfo.builder()(itemInfo);
          }
        },
        name: 'items',
        unit: 'item',
        defaults: function (detail, u) {
          var fallbackUid = Tagger.generate('');
          return Merger.deepMerge(
            {
              uid: fallbackUid
            },
            u
          );
        },
        overrides: function (detail, u) {
          return {
            type: u.type,
            ignoreFocus: detail.fakeFocus(),
            domModification: {
              classes: [ detail.markers().item() ]
            }
          };
        }
      })
    ];

    var schema = [
      FieldSchema.strict('value'),
      FieldSchema.strict('items'),
      FieldSchema.strict('dom'),
      FieldSchema.strict('components'),
      FieldSchema.defaulted('menuBehaviours', { }),


      FieldSchema.defaultedOf('movement', {
        mode: 'menu',
        moveOnTab: true
      }, ValueSchema.choose(
        'mode',
        {
          grid: [
            Fields.initSize(),
            Fields.output('config', configureGrid)
          ],
          menu: [
            FieldSchema.defaulted('moveOnTab', true),
            Fields.output('config', configureMenu)
          ]
        }
      )),

      Fields.itemMarkers(),

      FieldSchema.defaulted('fakeFocus', false),
      FieldSchema.defaulted('focusManager', FocusManagers.dom()),
      Fields.onHandler('onHighlight')
    ];

    return {
      name: Fun.constant('Menu'),
      schema: Fun.constant(schema),
      parts: Fun.constant(parts)
    };
  }
);