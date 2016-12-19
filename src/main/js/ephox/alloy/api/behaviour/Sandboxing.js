define(
  'ephox.alloy.api.behaviour.Sandboxing',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.behaviour.sandboxing.ActiveSandbox',
    'ephox.alloy.behaviour.sandboxing.SandboxApis',
    'ephox.alloy.behaviour.sandboxing.SandboxSchema'
  ],

  function (BehaviourExport, ActiveSandbox, SandboxApis, SandboxSchema) {
    return BehaviourExport.santa(
      SandboxSchema,
      'sandboxing',
      ActiveSandbox,
      SandboxApis,
      { }
    );
  }
);

