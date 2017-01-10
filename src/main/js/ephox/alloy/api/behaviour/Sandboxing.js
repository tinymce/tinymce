define(
  'ephox.alloy.api.behaviour.Sandboxing',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.sandboxing.ActiveSandbox',
    'ephox.alloy.behaviour.sandboxing.SandboxApis',
    'ephox.alloy.behaviour.sandboxing.SandboxSchema'
  ],

  function (Behaviour, ActiveSandbox, SandboxApis, SandboxSchema) {
    return Behaviour.create(
      SandboxSchema,
      'sandboxing',
      ActiveSandbox,
      SandboxApis,
      { }
    );
  }
);

