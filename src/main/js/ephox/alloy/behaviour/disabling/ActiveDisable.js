define(
  'ephox.alloy.behaviour.disabling.ActiveDisable',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.behaviour.common.Behaviour',
    'ephox.alloy.behaviour.disabling.DisableApis',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr'
  ],

  function (SystemEvents, Behaviour, DisableApis, EventHandler, DomModification, Objects, Arr) {
    var exhibit = function (base, disableInfo) {
      return DomModification.nu({
        // Do not add the attribute yet, because it will depend on the node name
        // if we use "aria-disabled" or just "disabled"
        classes: disableInfo.disabled() ? disableInfo.disableClass().map(Arr.pure).getOr([ ]) : [ ]
      });
    };

    var events = function (disableInfo) {
      var load = Behaviour.loadEvent(disableInfo, DisableApis.onLoad);

      var canExecute = {
        key: SystemEvents.execute(),
        value: EventHandler.nu({
          abort: function (component, simulatedEvent) {
            return DisableApis.isDisabled(component, disableInfo);
          }
        })
      };

      return Objects.wrapAll([ canExecute, load ]);
    };

    return {
      exhibit: exhibit,
      events: events
    };  
  }
);