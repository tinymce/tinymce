define(
  'ephox.alloy.spec.TabbedSpec',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Transitioning',
    'ephox.alloy.api.ui.TabbarApis',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Compare'
  ],

  function (SystemEvents, Representing, Transitioning, TabbarApis, EventHandler, SpecSchema, UiSubstitutes, FieldSchema, Objects, Arr, Merger, Option, Compare) {
    var schema = [
      FieldSchema.strict('tabs'),
      FieldSchema.strict('defaultView'),
      FieldSchema.strict('dom'),
      FieldSchema.defaulted('selectFirst', false)
    ];

    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('tabbed', schema, spec, [
        'tabbar',
        'tabview'
      ]);

      console.log('tabbar', detail.parts().tabbar());

      var views = { };
      Arr.each(detail.tabs(), function (tab) {
        views[tab.value] = tab.view;
      });

      var placeholders = {
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
      };

      var components = UiSubstitutes.substitutePlaces(
        Option.some('tabbing'),
        detail,
        detail.components(),
        placeholders,
        { }
      );

      return Merger.deepMerge(
        spec, {
          uid: detail.uid(),
          uiType: 'custom',
          dom: detail.dom(),
          components: components,


          events: Objects.wrapAll([
            {
              key: SystemEvents.systemInit(),
              value: EventHandler.nu({
                run: function (tabbing, simulatedEvent) {
                  if (detail.selectFirst() && Compare.eq(tabbing.element(), simulatedEvent.event().target())) {
                    tabbing.getSystem().getByUid(detail.partUids().tabbar).each(function (tabbar) {
                      TabbarApis.selectFirst(tabbar);
                    });
                  }
                }
              })
            }


          ])
        }
      );
    };

    return {
      make: make
    };
  }
);