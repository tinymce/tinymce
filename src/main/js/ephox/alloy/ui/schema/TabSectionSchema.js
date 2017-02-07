define(
  'ephox.alloy.ui.schema.TabSectionSchema',

  [
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.ui.Tabbar',
    'ephox.alloy.api.ui.Tabview',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun'
  ],

  function (SystemEvents, Tabbar, Tabview, PartType, FieldSchema, Fun) {
    var schema = [
      FieldSchema.defaulted('selectFirst', true),
      FieldSchema.defaulted('onChangeTab', Fun.noop),
      FieldSchema.defaulted('onDismissTab', Fun.noop),
      FieldSchema.defaulted('tabs', [ ])
    ];

    var barPart = PartType.internal(
      Tabbar,
      'tabbar',
      '<alloy.tab-section.tabbar>',
      function (detail) {
        return {
          onChange: function (tabbar, button) {
            tabbar.getSystem().triggerEvent(SystemEvents.changeTab(), tabbar.element(), {
              tabbar: Fun.constant(tabbar),
              button: Fun.constant(button)
            });
          },
          tabs: detail.tabs()
        };
      },
      Fun.constant({ })
    );

    var viewPart = PartType.internal(
      Tabview,
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