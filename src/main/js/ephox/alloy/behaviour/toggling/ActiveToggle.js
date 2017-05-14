define(
  'ephox.alloy.behaviour.toggling.ActiveToggle',

  [
    'ephox.alloy.behaviour.toggling.ToggleApis',
    'ephox.alloy.behaviour.common.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Arr'
  ],

  function (ToggleApis, Behaviour, DomModification, Objects, Arr) {
    var exhibit = function (base, toggleConfig, toggleState) {
      return DomModification.nu({ });
    };

    var events = function (toggleConfig, toggleState) {
      var execute = Behaviour.executeEvent(toggleConfig, toggleState, ToggleApis.toggle);
      var load = Behaviour.loadEvent(toggleConfig, toggleState, ToggleApis.onLoad);

      return Objects.wrapAll(
        Arr.flatten([
          toggleConfig.toggleOnExecute() ? [ execute ] : [ ],
          [ load ]
        ])
      );
    };

    return {
      exhibit: exhibit,
      events: events
    };
  }
);