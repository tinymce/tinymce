define(
  'ephox.alloy.behaviour.unselecting.ActiveUnselecting',

  [
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.events.NativeEvents',
    'ephox.alloy.dom.DomModification',
    'ephox.katamari.api.Fun'
  ],

  function (AlloyEvents, NativeEvents, DomModification, Fun) {
    var exhibit = function (base, unselectConfig) {
      return DomModification.nu({
        styles: {
          '-webkit-user-select': 'none',
          'user-select': 'none',
          '-ms-user-select': 'none',
          '-moz-user-select': '-moz-none'
        },
        attributes: {
          'unselectable': 'on'
        }
      });
    };

    var events = function (unselectConfig) {
      return AlloyEvents.derive([
        AlloyEvents.abort(NativeEvents.selectstart(), Fun.constant(true))
      ]);
    };

    return {
      events: events,
      exhibit: exhibit
    };
  }
);