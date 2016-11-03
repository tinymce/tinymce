define(
  'ephox.alloy.spec.TabbedSpec',

  [
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Transitioning',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.perhaps.Option'
  ],

  function (Representing, Transitioning, SpecSchema, UiSubstitutes, FieldSchema, Arr, Merger, Option) {
    var schema = [
      FieldSchema.strict('tabs'),
      FieldSchema.strict('defaultView'),
      FieldSchema.strict('dom')
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
        '<alloy.tabbar>': UiSubstitutes.single(
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
              tabs: detail.tabs()
            }
          )
        ),
        '<alloy.tabview>': UiSubstitutes.single(
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

      return {
        uid: detail.uid(),
        uiType: 'custom',
        dom: detail.dom(),
        components: components
      };
    };

    return {
      make: make
    };
  }
);