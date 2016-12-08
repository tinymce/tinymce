define(
  'ephox.alloy.ui.composite.TabSectionSpec',

  [
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'ephox.sugar.api.Attr'
  ],

  function (EventRoot, SystemEvents, Replacing, Representing, EventHandler, Objects, Arr, Attr) {
    var make = function (detail, components, spec, externals) {
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

                    // TabbarApis.selectFirst(tabbar);
                  });
                }
              }
            })
          },

          {
            // FIX: Name.
            key: SystemEvents.changeTab(),
            value: EventHandler.nu({
              run: function (section, simulatedEvent) {
                var button = simulatedEvent.event().button();

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
              }
            })
          }


        ])
      };

    };

    return {
      make: make
    };
  }
);