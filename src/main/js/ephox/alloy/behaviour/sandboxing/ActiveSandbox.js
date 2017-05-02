define(
  'ephox.alloy.behaviour.sandboxing.ActiveSandbox',

  [
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.behaviour.sandboxing.SandboxApis',
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.Objects'
  ],

  function (SystemEvents, SandboxApis, EventHandler, Objects) {
    var events = function (sandboxConfig, sandboxState) {
      return Objects.wrapAll([
        {
          key: SystemEvents.sandboxClose(),
          value: EventHandler.nu({
            run: function (sandbox, simulatedEvent) {
              if (SandboxApis.isOpen(sandbox, sandboxConfig, sandboxState)) SandboxApis.close(sandbox, sandboxConfig, sandboxState);
            }
          })
        }
      ]);
    };

    return {
      events: events
    };
  }
);