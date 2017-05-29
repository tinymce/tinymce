define(
  'ephox.alloy.behaviour.disabling.ActiveDisable',

  [
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.behaviour.common.Behaviour',
    'ephox.alloy.behaviour.disabling.DisableApis',
    'ephox.alloy.dom.DomModification',
    'ephox.katamari.api.Arr'
  ],

  function (AlloyEvents, SystemEvents, Behaviour, DisableApis, DomModification, Arr) {
    var exhibit = function (base, disableConfig, disableState) {
      return DomModification.nu({
        // Do not add the attribute yet, because it will depend on the node name
        // if we use "aria-disabled" or just "disabled"
        classes: disableConfig.disabled() ? disableConfig.disableClass().map(Arr.pure).getOr([ ]) : [ ]
      });
    };

    var events = function (disableConfig, disableState) {
      return AlloyEvents.derive([
        AlloyEvents.abort(SystemEvents.execute(), function (component, simulatedEvent) {
          return DisableApis.isDisabled(component, disableConfig, disableState);
        }),
        Behaviour.loadEvent(disableConfig, disableState, DisableApis.onLoad)
      ]);
    };

    return {
      exhibit: exhibit,
      events: events
    };
  }
);