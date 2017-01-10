define(
  'ephox.alloy.api.ui.Tabbar',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.ui.TabButton',
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.alloy.data.Fields',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun'
  ],

  function (SystemEvents, Behaviour, Highlighting, TabButton, UiBuilder, Fields, DomModification, PartType, FieldSchema, Fun) {
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
          behaviours: {
            representing: {
              initialValue: tabSpec.value
            },
            'tabbar.tabbuttons': { }
          },
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

    var make = function (detail, components, spec, externals) {
      return {
        dom: {
          tag: 'div',
          attributes: {
            role: 'tablist'
          }
        },
        components: components,

        behaviours: {
          highlighting: {
            highlightClass: detail.markers().selectedClass(),
            itemClass: detail.markers().tabClass()
          },

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
          }
        }
      };
    };


    var build = function (spec) {
      return UiBuilder.composite('tab-bar', schema, partTypes, make, spec);
    };

    // TODO: Remove likely dupe
    var parts = PartType.generate('tab-bar', partTypes);

    return {
      build: build,
      parts: Fun.constant(parts)


    };
  }
);