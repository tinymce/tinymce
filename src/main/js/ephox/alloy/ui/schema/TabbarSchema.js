define(
  'ephox.alloy.ui.schema.TabbarSchema',

  [
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.ui.TabButton',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun'
  ],

  function (Highlighting, SystemEvents, TabButton, Fields, PartType, FieldSchema, Fun) {
    var schema = [
      FieldSchema.strict('tabs'),

      FieldSchema.strict('dom'),

      Fields.members([ 'tab' ]),

      FieldSchema.defaulted('clickToDismiss', false),

      Fields.markers([ 'tabClass', 'selectedClass' ])
    ];


    var tabsPart = PartType.group(
      TabButton,
      'tabs',
      'tab',
      '<alloy.tabs>',
      Fun.constant({ }),
      function (barDetail, tabSpec) {
        var dismissTab = function (tabbar, button) {
          Highlighting.dehighlight(tabbar, button);
          SystemEvents.trigger(tabbar, SystemEvents.dismissTab(), {
            tabbar: tabbar,
            button: button
          });
        };

        var changeTab = function (tabbar, button) {
          Highlighting.highlight(tabbar, button);
          SystemEvents.trigger(tabbar, SystemEvents.changeTab(), {
            tabbar: tabbar,
            button: button
          });
        };

        return {
          action: function (button) {
            var tabbar = button.getSystem().getByUid(barDetail.uid()).getOrDie();
            var activeButton = Highlighting.isHighlighted(tabbar, button);

            var response = (function () {
              if (activeButton && barDetail.clickToDismiss()) return dismissTab;
              else if (! activeButton) return changeTab;
              else return Fun.noop;
            })();

            response(tabbar, button);
          },

          domModification: {
            classes: [ barDetail.markers().tabClass() ]
          }
        };
      }
    );
  
    var partTypes = [
      tabsPart
    ];

    return {
      name: Fun.constant('Tabbar'),
      schema: Fun.constant(schema),
      parts: Fun.constant(partTypes)
    };
  }
);