define(
  'ephox.alloy.api.ui.TabSection',

  [
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.api.ui.Tabbar',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.composite.TabSectionSpec',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun'
  ],

  function (CompositeBuilder, Tabbar, PartType, TabSectionSpec, FieldSchema, Fun) {
    var schema = [
      FieldSchema.defaulted('selectFirst', true)
    ];

    var barPart = PartType.internal(
      Tabbar,
      'tabbar',
      '<alloy.tab-section.tabbar>',
      Fun.constant({ }),
      Fun.constant({ })
    );

    var viewPart = PartType.internal(
      Tabbar,
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

    return {
      build: build
    };
  }
);

/*
'<alloy.tabbar>': UiSubstitutes.single(true,  
          Merger.deepMerge(
            detail.parts().tabbar(),
            detail.parts().tabbar().base,
            {
              uid: detail.partUids().tabbar,
              uiType: 'tabbar',
              onExecute: function (tabbar, button) {
                var tabValue = Representing.getValue(button);
                button.getSystem().getByUid(detail.partUids().tabview).each(function (viewer) {
                  Transitioning.transition(viewer, tabValue);
                });
              },
              selectFirst: detail.selectFirst(),
              tabs: detail.tabs()
            }
          )
        ),
        '<alloy.tabview>': UiSubstitutes.single(true,  
          Merger.deepMerge(
            detail.parts().tabview(),
            detail.parts().tabview().base,
            {
              uid: detail.partUids().tabview,
              uiType: 'container',
              transitioning: {
                views: views,
                base: detail.defaultView()
              }
            }
          )
        )
        */