define(
  'ephox.alloy.api.behaviour.Docking',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.common.NoState',
    'ephox.alloy.behaviour.docking.ActiveDocking',
    'ephox.alloy.behaviour.docking.DockingSchema'
  ],

  function (Behaviour, NoState, ActiveDocking, DockingSchema) {
    return Behaviour.create(
      DockingSchema,
      'docking',
      ActiveDocking,
      Behaviour.noActive(),
      Behaviour.noApis(),
      NoState
    );
  }
);