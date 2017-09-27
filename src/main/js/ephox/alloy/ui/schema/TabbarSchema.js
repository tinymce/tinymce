define(
  'ephox.alloy.ui.schema.TabbarSchema',

  [
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.component.SketchBehaviours',
    'ephox.alloy.api.events.AlloyTriggers',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.ui.TabButton',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (Highlighting, Keying, SketchBehaviours, AlloyTriggers, SystemEvents, TabButton, Fields, PartType, FieldSchema, Fun) {
    var schema = [
      FieldSchema.strict('tabs'),

      FieldSchema.strict('dom'),

      FieldSchema.defaulted('clickToDismiss', false),
      SketchBehaviours.field('tabbarBehaviours', [ Highlighting, Keying ]),
      Fields.markers([ 'tabClass', 'selectedClass' ])
    ];


    var tabsPart = PartType.group({
      factory: TabButton,
      name: 'tabs',
      unit: 'tab',
      overrides: function (barDetail, tabSpec) {
        var dismissTab = function (tabbar, button) {
          Highlighting.dehighlight(tabbar, button);
          AlloyTriggers.emitWith(tabbar, SystemEvents.dismissTab(), {
            tabbar: tabbar,
            button: button
          });
        };

        var changeTab = function (tabbar, button) {
          Highlighting.highlight(tabbar, button);
          AlloyTriggers.emitWith(tabbar, SystemEvents.changeTab(), {
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
    });

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