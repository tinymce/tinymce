define(
  'ephox.alloy.api.ui.TabSection',

  [
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.api.ui.Tabbar',
    'ephox.alloy.api.ui.Tabview',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Attr'
  ],

  function (EventRoot, SystemEvents, Highlighting, Replacing, Representing, CompositeBuilder, Tabbar, Tabview, EventHandler, PartType, FieldSchema, Objects, Arr, Fun, Attr) {
    var schema = [
      FieldSchema.defaulted('selectFirst', true),
      FieldSchema.defaulted('tabs', [ ])
    ];

    var barPart = PartType.internal(
      Tabbar,
      'tabbar',
      '<alloy.tab-section.tabbar>',
      function (detail) {
        return {
          onChange: function (tabbar, button) {
            tabbar.getSystem().triggerEvent(SystemEvents.changeTab(), tabbar.element(), {
              tabbar: Fun.constant(tabbar),
              button: Fun.constant(button)
            });
          },
          tabs: detail.tabs()
        };
      },
      Fun.constant({ })
    );

    var viewPart = PartType.internal(
      Tabview,
      'tabview',
      '<alloy.tab-section.tabview>',
      Fun.constant({ }),
      Fun.constant({ })
    );


    var partTypes = [
      barPart,
      viewPart
    ];


    var make = function (detail, components, spec, externals) {
      var changeTab = function (button) {
        var tabValue = Representing.getValue(button);
        button.getSystem().getByUid(detail.partUids().tabview).each(function (tabview) {
          var tabData = Arr.find(detail.tabs(), function (t) {
            return t.value === tabValue;
          });

          var panel = tabData.view();

          // Update the tabview to refer to the current tab.
          Attr.set(tabview.element(), 'aria-labelledby', Attr.get(button.element(), 'id'));
          Replacing.set(tabview, panel);
        });
      };

      return {
        uid: detail.uid(),
        uiType: 'custom',
        dom: detail.dom(),
        components: components,


        events: Objects.wrapAll([
          {
            key: SystemEvents.systemInit(),
            value: EventHandler.nu({
              run: function (section, simulatedEvent) {
                if (detail.selectFirst() && EventRoot.isSource(section, simulatedEvent)) {
                  section.getSystem().getByUid(detail.partUids().tabbar).each(function (tabbar) {
                    Highlighting.getFirst(tabbar).each(function (button) {
                      Highlighting.highlight(tabbar, button);
                      changeTab(button);
                    });
                  });
                }
              }
            })
          },

          {
            key: SystemEvents.changeTab(),
            value: EventHandler.nu({
              run: function (section, simulatedEvent) {
                var button = simulatedEvent.event().button();
                changeTab(button);
              }
            })
          }


        ])
      };

    };

    var build = function (f) {
      return CompositeBuilder.build('tab-section', schema, partTypes, make, f);
    };

    var parts = PartType.generate('tab-section', partTypes);

    return {
      build: build,
      parts: Fun.constant(parts)
    };
  }
);