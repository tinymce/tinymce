define(
  'ephox.alloy.spec.TabbedSpec',

  [
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.perhaps.Option'
  ],

  function (SpecSchema, UiSubstitutes, Option) {
    var schema = [


    ];

    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('tabbed', schema, spec, [
        'tabbar',
        'tabview'
      ]);

      var placeholders = {
        '<alloy.tabbar>': UiSubstitutes.single({
          uiType: 'container'

        }),
        '<alloy.tabview>': UiSubstitutes.single({
          uiType: 'container'
        })
      };

      var components = UiSubstitutes.substitutePlaces(
        Option.some('tabs'),
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