define(
  'ephox.alloy.api.behaviour.Docking',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.docking.ActiveDocking',
    'ephox.alloy.behaviour.docking.DockingSchema'
  ],

  function (Behaviour, ActiveDocking, DockingSchema) {
    return Behaviour.create({
      fields: DockingSchema,
      name: 'docking',
      active: ActiveDocking
    });
  }
);