define(
  'ephox.alloy.api.ui.TabSection',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.api.ui.Tabbar',
    'ephox.alloy.api.ui.Tabview',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.composite.TabSectionSpec',
    'ephox.boulder.api.FieldSchema',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Attr'
  ],

  function (SystemEvents, Replacing, Representing, CompositeBuilder, Tabbar, Tabview, PartType, TabSectionSpec, FieldSchema, Arr, Fun, Attr) {
    var schema = [
      FieldSchema.defaulted('selectFirst', true),
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

    var build = function (f) {
      return CompositeBuilder.build('tab-section', schema, partTypes, TabSectionSpec.make, f);
    };

    var parts = PartType.generate('tab-section', partTypes);

    return {
      build: build,
      parts: Fun.constant(parts)
    };
  }
);