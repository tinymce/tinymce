define(
  'ephox.alloy.ui.schema.TabSectionSchema',

  [
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.ui.Tabbar',
    'ephox.alloy.api.ui.Tabview',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (SystemEvents, Tabbar, Tabview, Fields, PartType, FieldSchema, Fun) {
    var schema = [
      FieldSchema.defaulted('selectFirst', true),
      Fields.onHandler('onChangeTab'),
      Fields.onHandler('onDismissTab'),
      FieldSchema.defaulted('tabs', [ ])
    ];

    var barPart = PartType.internal(
      Tabbar,
      [
        FieldSchema.strict('dom'),
        FieldSchema.strictObjOf('parts', [
          FieldSchema.strict('tabs')
        ]),
        FieldSchema.strictObjOf('markers', [
          FieldSchema.strict('tabClass'),
          FieldSchema.strict('selectedClass')
        ]),
        FieldSchema.strictObjOf('members', [
          FieldSchema.strictObjOf('tab', [
            FieldSchema.strict('munge')
          ])
        ])
      ],
      'tabbar',
      '<alloy.tab-section.tabbar>',
      function (detail) {
        return {
          tabs: detail.tabs()
        };
      },
      Fun.constant({ })
    );

    var viewPart = PartType.internal(
      Tabview,
      [ ],
      'tabview',
      '<alloy.tab-section.tabview>',
      Fun.constant({ }),
      Fun.constant({ })
    );


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