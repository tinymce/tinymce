define(
  'ephox.alloy.alien.EventRoot',

  [
    'ephox.sugar.api.dom.Compare'
  ],

  function (Compare) {
    var isSource = function (component, simulatedEvent) {
      return Compare.eq(component.element(), simulatedEvent.event().target());
    };

    return {
      isSource: isSource
    };
  }
);