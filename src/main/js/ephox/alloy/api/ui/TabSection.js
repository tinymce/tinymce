define(
  'ephox.alloy.api.ui.TabSection',

  [
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.composite.TabSectionSpec',
    'ephox.peanut.Fun'
  ],

  function (CompositeBuilder, PartType, TabSectionSpec, Fun) {
    var schema = [


    ];

    var barPart = PartType.internal(
      'tabbar',
      '<alloy.tab-section.tabbar>',
      Fun.constant({ }),
      Fun.constant({ })
    );

    var viewPart = PartType.internal(
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