define(
  'ephox.alloy.behaviour.unselecting.ActiveUnselecting',

  [
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dom.DomModification'
  ],

  function (EventHandler, DomModification) {
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
      return {
        selectstart: EventHandler.nu({
          run: function (component, simulatedEvent) {          
            simulatedEvent.event().kill();
            simulatedEvent.stop();
          }
        })
      };
    };

    return {
      events: events,
      exhibit: exhibit
    };
  }
);