define(
  'ephox.alloy.api.behaviour.Sandboxing',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.sandboxing.ActiveSandbox',
    'ephox.alloy.behaviour.sandboxing.SandboxApis',
    'ephox.alloy.behaviour.sandboxing.SandboxSchema',
    'ephox.alloy.behaviour.sandboxing.SandboxState'
  ],

  function (Behaviour, ActiveSandbox, SandboxApis, SandboxSchema, SandboxState) {
    return Behaviour.create({
      fields: SandboxSchema,
      name: 'sandboxing',
      active: ActiveSandbox,
      apis: SandboxApis,
      state: SandboxState
    });
  }
);

