define(
  'ephox.alloy.ui.common.ButtonBase',

  [
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.events.AlloyTriggers',
    'ephox.alloy.api.events.NativeEvents',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.katamari.api.Arr',
    'ephox.sand.api.PlatformDetection'
  ],

  function (AlloyEvents, AlloyTriggers, NativeEvents, SystemEvents, Arr, PlatformDetection) {
    var events = function (optAction) {
      var executeHandler = function (action) {
        return AlloyEvents.run(SystemEvents.execute(), function (component, simulatedEvent) {
          action(component);
          simulatedEvent.stop();
        });
      };

      var onClick = function (component, simulatedEvent) {
        simulatedEvent.stop();
        AlloyTriggers.emitExecute(component);
      };

      // Other mouse down listeners above this one should not get mousedown behaviour (like dragging)
      var onMousedown = function (component, simulatedEvent) {
        simulatedEvent.cut();
      };

      var pointerEvents = PlatformDetection.detect().deviceType.isTouch() ? [
        AlloyEvents.run(SystemEvents.tap(), onClick)
      ] : [
        AlloyEvents.run(NativeEvents.click(), onClick),
        AlloyEvents.run(NativeEvents.mousedown(), onMousedown)
      ];

      return AlloyEvents.derive(
        Arr.flatten([
          // Only listen to execute if it is supplied
          optAction.map(executeHandler).toArray(),
          pointerEvents
        ])
      );
    };

    return {
      events: events
    };
  }
);