define(
  'ephox.alloy.api.ui.Tabbar',

  [
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.ui.composite.TabbarSpec'
  ],

  function (CompositeBuilder, TabbarSpec) {
    var schema = [
      // FieldSchema.defaulted('selectFirst', true)
    ];

    // var barPart = PartType.internal(
    //   'tabbar',
    //   '<alloy.tab-section.tabbar>',
    //   Fun.constant({ }),
    //   Fun.constant({ })
    // );

    // var viewPart = PartType.internal(
    //   'tabview',
    //   '<alloy.tab-section.tabview>',
    //   Fun.constant({ }),
    //   Fun.constant({ })
    // );


    var partTypes = [
      // barPart,
      // viewPart
    ];

    var build = function (f) {
      return CompositeBuilder.build('tab-bar', schema, partTypes, TabbarSpec.make, f);
    };

    return {
      build: build
    };
  }
);