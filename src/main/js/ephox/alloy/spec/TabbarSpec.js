define(
  'ephox.alloy.spec.TabbarSpec',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.data.Fields',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Compare'
  ],

  function (SystemEvents, Highlighting, EventHandler, Fields, SpecSchema, UiSubstitutes, FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Merger, Fun, Option, Compare) {
    var schema = [
      FieldSchema.strict('tabs'),

      FieldSchema.strict('onExecute'),
      FieldSchema.defaulted('onDismiss', Fun.noop),
      FieldSchema.defaulted('onChange', Fun.noop),
      FieldSchema.strict('dom'),

      Fields.members([ 'tab' ]),

      FieldSchema.defaulted('clickToDismiss', true),

      Fields.markers([ 'tabClass', 'selectedClass' ])
    ];

    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('tabbar', schema, spec, [
        'tabs'
      ]);

      var placeholders = {
        '<alloy.tabs>': UiSubstitutes.multiple(
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
        )
      };

      var components = UiSubstitutes.substitutePlaces(
        Option.some('tabbar'),
        detail,
        detail.components(),
        placeholders,
        { }
      );

      return {
        uid: detail.uid(),
        uiType: 'custom',
        dom: detail.dom(),
        highlighting: {
          highlightClass: detail.markers().selectedClass(),
          itemClass: detail.markers().tabClass()
        },
        components: components,
        keying: {
          mode: 'flow',
          getInitial: function (tabbar) {
            // Restore focus to the previously highlighted tab.
            return Highlighting.getHighlighted(tabbar).map(function (tab) {
              return tab.element();
            });
          },
          selector: '.' + detail.markers().tabClass(),
          executeOnMove: true
        },
        
        apis: {
          selectFirst: function (tabbar) {
            Highlighting.getFirst(tabbar).each(function (button) {
              tabbar.getSystem().triggerEvent(SystemEvents.execute(), button.element(), { });
            });
          }
        },


        tabstopping: true
      };
    };

    return {
      make: make
    };
  }
);