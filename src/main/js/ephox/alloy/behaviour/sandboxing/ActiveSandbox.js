define(
  'ephox.alloy.behaviour.sandboxing.ActiveSandbox',

  [
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.behaviour.sandboxing.SandboxApis'
  ],

  function (AlloyEvents, SystemEvents, SandboxApis) {
    var events = function (sandboxConfig, sandboxState) {
      return AlloyEvents.derive([
        AlloyEvents.run(SystemEvents.sandboxClose(), function (sandbox, simulatedEvent) {
          SandboxApis.close(sandbox, sandboxConfig, sandboxState);
        })
      ]);
    };

    return {
      events: events
    };
  }
);