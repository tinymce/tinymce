define(
  'ephox.alloy.ui.schema.TabSectionSchema',

  [
    'ephox.alloy.api.component.SketchBehaviours',
    'ephox.alloy.api.ui.Tabbar',
    'ephox.alloy.api.ui.Tabview',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (SketchBehaviours, Tabbar, Tabview, Fields, PartType, FieldSchema, Fun) {
    var schema = [
      FieldSchema.defaulted('selectFirst', true),
      Fields.onHandler('onChangeTab'),
      Fields.onHandler('onDismissTab'),
      FieldSchema.defaulted('tabs', [ ]),
      SketchBehaviours.field('tabSectionBehaviours', [ ])
    ];

    var barPart = PartType.required({
      factory: Tabbar,
      schema: [
        FieldSchema.strict('dom'),
        FieldSchema.strictObjOf('markers', [
          FieldSchema.strict('tabClass'),
          FieldSchema.strict('selectedClass')
        ])
      ],
      name: 'tabbar',
      defaults: function (detail) {
        return {
          tabs: detail.tabs()
        };
      }
    });

    var viewPart = PartType.required({
      factory: Tabview,
      name: 'tabview'
    });

    var partTypes = [
      barPart,
      viewPart
    ];

    return {
      name: Fun.constant('TabSection'),
      schema: Fun.constant(schema),
      parts: Fun.constant(partTypes)
    };
  }
);