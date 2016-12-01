define(
  'ephox.alloy.api.behaviour.Docking',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.behaviour.docking.ActiveDocking',
    'ephox.alloy.behaviour.docking.DockingSchema'
  ],

  function (BehaviourExport, ActiveDocking, DockingSchema) {
    return BehaviourExport.santa(
      DockingSchema,
      'docking',
      ActiveDocking,
      { }
    );
  }
);