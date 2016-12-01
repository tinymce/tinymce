define(
  'ephox.alloy.behaviour.toggling.ActiveToggle',

  [
    'ephox.alloy.behaviour.toggling.ToggleApis',
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr'
  ],

  function (ToggleApis, Behaviour, DomModification, Objects, Arr) {
    var exhibit = function (base, toggleInfo) {
      return DomModification.nu({ });
    };

    var events = function (toggleInfo) {
      var execute = Behaviour.executeEvent(toggleInfo, ToggleApis.toggle);
      var load = Behaviour.loadEvent(toggleInfo, ToggleApis.onLoad);

      return Objects.wrapAll(
        Arr.flatten([
          toggleInfo.toggleOnExecute() ? [ execute ] : [ ],
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