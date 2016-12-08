define(
  'ephox.alloy.api.ui.Tabbar',

  [
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.composite.TabbarSpec',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun'
  ],

  function (CompositeBuilder, Fields, PartType, TabbarSpec, FieldSchema, Fun) {
    var schema = [
      FieldSchema.strict('tabs'),

      FieldSchema.strict('onExecute'),
      FieldSchema.defaulted('onDismiss', Fun.noop),
      FieldSchema.defaulted('onChange', Fun.noop),
      FieldSchema.strict('dom'),

      Fields.members([ 'tab' ]),

      FieldSchema.defaulted('clickToDismiss', true),

      Fields.markers([ 'tabClass', 'selectedClass' ])
      // FieldSchema.defaulted('selectFirst', true)
    ];


    var tabsPart = PartType.group(
      'tabs',
      'tab',
      '<alloy.tabs>',
      Fun.constant({ }),
      Fun.constant({ })
    );
    /*
            '<alloy.tabs>': UiSubstitutes.multiple(true, 
          Arr.map(detail.tabs(), function (tab) {
            var munged = detail.members().tab().munge(tab);
            return Merger.deepMerge(
              munged,
              {
                uiType: 'button',
                representing: {
                  query: function () {
                    return tab.value;
                  },
                  set: function () { }
                },
                action: function (button) {
                  var bar = button.getSystem().getByUid(detail.uid()).getOrDie();
                  var alreadyViewing = Highlighting.getHighlighted(bar).exists(function (highlighted) {
                    return Compare.eq(button.element(), highlighted.element());
                  });

                  if (alreadyViewing && detail.clickToDismiss()) {
                    Highlighting.dehighlightAll(bar);
                    detail.onDismiss()(bar, button);
                  } else if (! alreadyViewing) {
                    Highlighting.highlight(bar, button);
                    detail.onExecute()(bar, button);
                    detail.onChange()(bar, button);
                  }
                },
                role: 'tab'
              }
            );
          })
        )*/

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
      tabsPart
      // barPart,
      // viewPart
    ];

    var build = function (spec) {
      return CompositeBuilder.build('tab-bar', schema, partTypes, TabbarSpec.make, spec);
    };

    // TODO: Remove likely dupe
    var parts = function (f) {
      return PartType.generate('tab-bar', partTypes);
    };

    return {
      build: build,
      parts: Fun.constant(parts)
    };
  }
);