define(
  'ephox.alloy.behaviour.focusing.ActiveFocus',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.behaviour.focusing.FocusApis',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.log.AlloyLogger',
    'ephox.boulder.api.Objects'
  ],

  function (SystemEvents, FocusApis, EventHandler, DomModification, AlloyLogger, Objects) {
    var exhibit = function (base, focusInfo) {
      if (focusInfo.ignore()) return DomModification.nu({ });
      else return DomModification.nu({
        attributes: {
          'tabindex': '-1'
        }
      });
    };

    var events = function (focusInfo) {
      return Objects.wrap(
        SystemEvents.focus(),
        EventHandler.nu({
          run: function (component, simulatedEvent) {
            FocusApis.focus(component, focusInfo);
            simulatedEvent.stop();
          }
        })
      );
    };

    return {
      exhibit: exhibit,
      events: events
    };
  }
);