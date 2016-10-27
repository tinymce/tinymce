define(
  'ephox.alloy.spec.TabbedSpec',

  [
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.highway.Merger',
    'ephox.perhaps.Option'
  ],

  function (SpecSchema, UiSubstitutes, Merger, Option) {
    var schema = [


    ];

    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('tabbed', schema, spec, [
        'tabbar',
        'tabview'
      ]);

      console.log('tabbar', detail.parts().tabbar());

      var placeholders = {
        '<alloy.tabbar>': UiSubstitutes.single(
          Merger.deepMerge(
            detail.parts().tabbar(),
            detail.parts().tabbar().base,
            {
              uid: detail.partUids().tabbar,
              uiType: 'tabbar'
            }
          )
        ),
        '<alloy.tabview>': UiSubstitutes.single({
          uiType: 'container',
          uid: detail.partUids().tabview
        })
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
        dom: {
          tag: 'div'
        },
        components: components
      };
    };

    return {
      make: make
    };
  }
);