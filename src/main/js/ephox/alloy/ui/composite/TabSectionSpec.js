define(
  'ephox.alloy.ui.composite.TabSectionSpec',

  [
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.Objects'
  ],

  function (EventRoot, SystemEvents, EventHandler, Objects) {
    var make = function (detail, components, spec, externals) {
      debugger;
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
          }


        ])
      };

    };

    return {
      make: make
    };
  }
);